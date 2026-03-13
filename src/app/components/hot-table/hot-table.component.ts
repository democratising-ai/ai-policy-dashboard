import { Component, DestroyRef, ElementRef, effect, inject, input, output, signal, computed, viewChild, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import Handsontable from 'handsontable';
import { registerAllModules } from 'handsontable/registry';
import { FlexibleTableData, FlexibleRow } from '../../services/data.models';
import { HandsontableTransformerService, TransformedTableData } from '../../services/handsontable-transformer.service';

registerAllModules();

@Component({
  selector: 'app-hot-table',
  standalone: true,
  imports: [
    RouterLink,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatSlideToggleModule
  ],
  templateUrl: './hot-table.component.html',
  styleUrl: './hot-table.component.css'
})
export class HotTableComponent {
  tableData = input<FlexibleTableData | null>(null);
  tableTitle = input('Data Table');
  loading = input(false);
  error = input<string | null>(null);
  addButtonRoute = input<string | null>(null);
  editable = input(false);

  rowClick = output<FlexibleRow>();
  retry = output<void>();
  saveChanges = output<{ rows: { id: string; values: Record<string, any> }[] }>();
  addColumn = output<void>();

  hotContainer = viewChild<ElementRef<HTMLDivElement>>('hotContainer');

  editMode = signal(false);
  modifiedRows = signal(new Map<string, Record<string, any>>());
  saving = signal(false);

  private transformer = inject(HandsontableTransformerService);
  private destroyRef = inject(DestroyRef);
  private hotInstance: Handsontable | null = null;
  private transformedData: TransformedTableData | null = null;
  private resizeObserver: ResizeObserver | null = null;

  hiddenColumnIds = signal(new Set<string>());
  filteredRowCount = signal(0);

  visibleColumns = computed(() => {
    const data = this.tableData();
    if (!data) return [];
    const hidden = this.hiddenColumnIds();
    return data.columns.filter(col => !hidden.has(col.name));
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
      this.destroyHandsontable();
    });

    effect(() => {
      const data = this.tableData();
      const isLoading = this.loading();
      const container = this.hotContainer();
      if (data && !isLoading && container) {
        // Don't re-init while editing — would destroy unsaved edits
        if (untracked(() => this.editMode()) && this.hotInstance) return;
        this.initHandsontable();
      }
    });
  }

  private initHandsontable() {
    const tableData = this.tableData();
    const containerRef = this.hotContainer();
    if (!tableData || !containerRef?.nativeElement) return;

    this.destroyHandsontable();

    this.transformedData = this.transformer.transform(tableData);

    const container = containerRef.nativeElement;

    const isEditing = this.editMode();
    const columns = isEditing
      ? this.transformer.getEditableColumns(tableData.columns, true)
      : this.transformedData.columns;

    this.hotInstance = new Handsontable(container, {
      data: this.transformedData.data,
      columns: columns as Handsontable.ColumnSettings[],
      colHeaders: this.transformedData.colHeaders,
      rowHeaders: true,
      readOnly: !this.editMode(),

      filters: true,
      dropdownMenu: [
        'filter_by_condition',
        'filter_operators',
        'filter_by_condition2',
        'filter_by_value',
        'filter_action_bar'
      ],

      columnSorting: true,

      manualColumnResize: true,
      manualColumnMove: true,

      hiddenColumns: {
        columns: [],
        indicators: true
      },

      height: this.calculateTableHeight(),
      width: '100%',
      stretchH: 'all',
      wordWrap: true,
      autoRowSize: { syncLimit: 100 },

      licenseKey: 'non-commercial-and-evaluation',

      themeName: 'ht-theme-main',

      // For array columns, replace the filter_by_value checkbox list with individual option
      // values from format.options (cells store comma-joined strings, which would otherwise
      // appear as a single entry). Deferred so it runs after Handsontable's own
      // afterDropdownMenuShow restores the joined-string values.
      afterDropdownMenuShow: () => {
        setTimeout(() => {
          const td = this.tableData();
          if (!this.hotInstance || !td) return;
          const filtersPlugin = (this.hotInstance as any).getPlugin('filters');
          const selectedCol = filtersPlugin?.getSelectedColumn?.();
          if (!selectedCol) return;
          const physicalCol = selectedCol.physicalIndex;
          const colDef = td.columns[physicalCol];
          if (!colDef?.format?.isArray) return;

          let options: string[];
          if (colDef.format.options?.length) {
            options = (colDef.format.options as string[]).filter(o => o !== '');
          } else {
            const unique = new Set<string>();
            (this.hotInstance.getDataAtCol(selectedCol.visualIndex) as any[]).forEach(v => {
              if (v) String(v).split(/,\s*/).forEach(p => { if (p.trim()) unique.add(p.trim()); });
            });
            options = Array.from(unique).sort();
          }
          if (!options.length) return;

          const stored = filtersPlugin.conditionCollection.getConditions(physicalCol);
          const existing = stored.find((c: any) => c.name === 'by_value');
          const checkedSet: Set<string> | null = existing ? new Set<string>(existing.args[0]) : null;

          const items = options.map((opt: string) => ({
            checked: checkedSet ? checkedSet.has(opt) : true,
            value: opt,
            visualValue: opt
          }));

          const valueComp = filtersPlugin.components.get('filter_by_value');
          const multiSelect = valueComp?.getMultipleSelectElement?.();
          if (!multiSelect) return;
          multiSelect.setItems(items);
          multiSelect.setValue(checkedSet ? Array.from(checkedSet) : options);

          this.fixDropdownMenuHeight();
        }, 0);

        setTimeout(() => this.fixDropdownMenuHeight(), 50);
      },

      // For array columns the by_value condition uses exact matching, but cells hold
      // comma-joined strings. Patch the stored condition func to use contains logic.
      beforeFilter: (conditions: any[]) => {
        const td = this.tableData();
        if (!this.hotInstance || !td) return;
        const filtersPlugin = (this.hotInstance as any).getPlugin('filters');
        const collection = filtersPlugin?.conditionCollection;
        if (!collection) return;
        conditions.forEach((colCondition: any) => {
          const physicalCol = colCondition.column;
          if (!td.columns[physicalCol]?.format?.isArray) return;
          collection.getConditions(physicalCol).forEach((cond: any) => {
            if (cond.name === 'by_value' && Array.isArray(cond.args[0])) {
              const selected = new Set<string>(cond.args[0]);
              cond.func = (dataRow: any) => {
                const cell = String(dataRow.value ?? '');
                if (!cell) return selected.has('');
                return cell.split(/,\s*/).some((part: string) => selected.has(part.trim()));
              };
            }
          });
        });
      },

      afterChange: (changes: Handsontable.CellChange[] | null, source: string) => {
        if (source === 'loadData' || source === 'updateData') return;
        if (this.editMode()) {
          this.trackChange(changes);
        }
      },

      afterOnCellMouseDown: (event: MouseEvent, coords: { row: number; col: number }) => {
        if (this.editMode()) return;
        if (coords.row >= 0 && this.transformedData && this.hotInstance) {
          const physicalRow = this.hotInstance.toPhysicalRow(coords.row);
          const rowData = this.transformedData.data[physicalRow];
          const originalRow = this.transformer.getOriginalRow(rowData);
          if (originalRow) {
            this.rowClick.emit(originalRow);
          }
        }
      },

      afterFilter: () => {
        this.filteredRowCount.set(this.hotInstance!.countRows());
      },

      afterRenderer: (td: HTMLTableCellElement, row: number, col: number, prop: string | number) => {
        td.style.cursor = 'pointer';
        if (this.editMode() && this.transformedData && this.hotInstance) {
          const physicalRow = this.hotInstance.toPhysicalRow(row);
          const rowData = this.transformedData.data[physicalRow];
          const rowId = rowData?.['__rowId'] as string;
          if (rowId && this.modifiedRows().has(rowId)) {
            const modifiedCols = this.modifiedRows().get(rowId)!;
            if (String(prop) in modifiedCols) {
              td.style.backgroundColor = '#fff9c4';
            }
          }
        }
      }
    });

    this.filteredRowCount.set(this.hotInstance.countRows());
    this.updateHiddenColumns();
    this.setupResizeObserver();
  }

  toggleEditMode() {
    const entering = !this.editMode();
    this.editMode.set(entering);

    if (!entering) {
      this.discardChanges();
      return;
    }

    this.applyEditMode(true);
  }

  private applyEditMode(_editable: boolean) {
    this.initHandsontable();
  }

  private trackChange(changes: Handsontable.CellChange[] | null) {
    if (!changes || !this.transformedData) return;

    const td = this.tableData();
    if (!td) return;

    const current = new Map(this.modifiedRows());

    for (const [visualRow, prop, oldVal, newVal] of changes) {
      // Skip if value didn't actually change
      if (oldVal === newVal) continue;
      const physicalRow = this.hotInstance!.toPhysicalRow(visualRow);
      const rowData = this.transformedData.data[physicalRow];
      const rowId = rowData?.['__rowId'] as string;
      if (!rowId) continue;

      const colName = String(prop);
      const col = td.columns.find(c => c.name === colName);

      let normalized: any = newVal;
      if (col?.format.isArray && typeof newVal === 'string') {
        normalized = newVal.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      }

      const existing = current.get(rowId) || {};
      existing[colName] = normalized;
      current.set(rowId, existing);
    }

    this.modifiedRows.set(current);
  }

  onSave() {
    const modified = this.modifiedRows();
    if (modified.size === 0) return;

    const rows = Array.from(modified.entries()).map(([id, values]) => ({ id, values }));
    this.saving.set(true);
    this.saveChanges.emit({ rows });
  }

  onSaveComplete(success: boolean) {
    this.saving.set(false);
    if (success) {
      this.modifiedRows.set(new Map());
      this.editMode.set(false);
      this.applyEditMode(false);
    }
  }

  discardChanges() {
    this.modifiedRows.set(new Map());

    // Re-init to restore original data (stay in edit mode)
    this.initHandsontable();
  }

  onAddColumn() {
    this.addColumn.emit();
  }

  private destroyHandsontable() {
    if (this.hotInstance) {
      this.hotInstance.destroy();
      this.hotInstance = null;
    }
  }

  toggleColumn(columnId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const current = new Set(this.hiddenColumnIds());
    if (current.has(columnId)) {
      current.delete(columnId);
    } else {
      current.add(columnId);
    }
    this.hiddenColumnIds.set(current);
    this.updateHiddenColumns();
  }

  toggleAllColumns(show: boolean) {
    if (show) {
      this.hiddenColumnIds.set(new Set());
    } else {
      const allIds = new Set(this.tableData()?.columns.map(col => col.name) || []);
      this.hiddenColumnIds.set(allIds);
    }
    this.updateHiddenColumns();
  }

  private updateHiddenColumns() {
    const tableData = this.tableData();
    if (!this.hotInstance || !tableData) return;

    const hiddenPlugin = this.hotInstance.getPlugin('hiddenColumns');
    const hidden = this.hiddenColumnIds();

    const allIndices = tableData.columns.map((_, index) => index);
    hiddenPlugin.showColumns(allIndices);

    const hiddenIndices: number[] = [];
    tableData.columns.forEach((col, index) => {
      if (hidden.has(col.name)) {
        hiddenIndices.push(index);
      }
    });

    if (hiddenIndices.length > 0) {
      hiddenPlugin.hideColumns(hiddenIndices);
    }
    this.hotInstance.render();
  }

  private fixDropdownMenuHeight() {
    const menu = document.querySelector('.htDropdownMenu') as HTMLElement;
    if (!menu) return;

    const menuWidth = menu.getBoundingClientRect().width;

    const multiSelectHolders = menu.querySelectorAll('.htUIMultipleSelect .ht_master .wtHolder') as NodeListOf<HTMLElement>;
    multiSelectHolders.forEach(holder => {
      holder.style.maxHeight = '250px';
      holder.style.overflowY = 'auto';
      holder.style.overflowX = 'hidden';
      holder.style.height = '';
    });

    const menuHolder = menu.querySelector(':scope > .ht_master > .wtHolder') as HTMLElement;
    if (menuHolder) {
      menuHolder.style.height = 'auto';
      menuHolder.style.overflow = 'visible';
      menuHolder.style.width = menuWidth + 'px';
    }

    const htCore = menu.querySelector(':scope > .ht_master > .wtHolder > .wtHider > .wtSpreader > table.htCore') as HTMLElement;
    if (htCore) {
      htCore.style.height = 'auto';
      htCore.style.width = menuWidth + 'px';
    }

    const wtHider = menu.querySelector(':scope > .ht_master > .wtHolder > .wtHider') as HTMLElement;
    if (wtHider) wtHider.style.width = menuWidth + 'px';
    const wtSpreader = menu.querySelector(':scope > .ht_master > .wtHolder > .wtHider > .wtSpreader') as HTMLElement;
    if (wtSpreader) wtSpreader.style.width = menuWidth + 'px';

    const customCells = menu.querySelectorAll('td.htCustomMenuRenderer') as NodeListOf<HTMLElement>;
    customCells.forEach(cell => {
      cell.style.height = 'auto';
      cell.style.overflow = 'visible';
    });

    const multiSelects = menu.querySelectorAll('.htUIMultipleSelect') as NodeListOf<HTMLElement>;
    multiSelects.forEach(ms => {
      ms.style.width = '100%';
    });
  }

  private setupResizeObserver() {
    this.resizeObserver?.disconnect();
    const wrapper = this.hotContainer()?.nativeElement?.closest('.table-wrapper') as HTMLElement;
    if (!wrapper) return;

    this.resizeObserver = new ResizeObserver(() => {
      if (this.hotInstance) {
        const height = wrapper.clientHeight || window.innerHeight - 200;
        this.hotInstance.updateSettings({ height });
      }
    });
    this.resizeObserver.observe(wrapper);
  }

  private calculateTableHeight(): number {
    const wrapper = this.hotContainer()?.nativeElement?.closest('.table-wrapper') as HTMLElement;
    if (wrapper) {
      return wrapper.clientHeight || window.innerHeight - 200;
    }
    return window.innerHeight - 200;
  }

  onRetry() {
    this.retry.emit();
  }

  get totalRowCount(): number {
    return this.transformedData?.data.length || 0;
  }
}
