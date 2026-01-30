import { Component, computed, inject, OnInit, signal, AfterViewInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { ViewChild } from '@angular/core';
import { PolicyDataService } from '../../../services/policy-data.service';
import { FlexibleTableData, FlexibleColumn } from '../../../services/data.models';
import { RowInfoCardService } from '../../../services/row-info-card.service';
import { TableSortService } from '../../../services/table-sort.service';
import { InputSanitizerService } from '../../../services/input-sanitizer.service';

@Component({
  selector: 'app-policy-analysis',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatPaginatorModule,
    RouterLink
  ],
  templateUrl: './policy-analysis.html',
  styleUrl: './policy-analysis.css'
})
export class PolicyAnalysisComponent implements OnInit, AfterViewInit {
  private policyDataService = inject(PolicyDataService);
  private rowInfoCardService = inject(RowInfoCardService);
  private tableSortService = inject(TableSortService);
  private sanitizer = inject(InputSanitizerService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  data = signal<FlexibleTableData | null>(null);
  dataSource = new MatTableDataSource<any>([]);
  private originalData: any[] = [];
  hiddenColumnIds = signal(new Set<string>());
  loading = signal(true);
  error = signal<string | null>(null);
  sortColumn = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc' | null>(null);

  visibleColumns = computed(() => {
    const tableData = this.data();
    const hidden = this.hiddenColumnIds();
    if (!tableData) return [];
    return tableData.columns.filter(col => !hidden.has(col.id));
  });

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    const data = this.policyDataService.getData();
    this.data.set(data);
    this.originalData = [...data.rows]; // Store original data
    this.dataSource.data = data.rows;
    this.applySorting();
    this.loading.set(false);
  }

  applySorting() {
    const sortCol = this.sortColumn();
    const sortDir = this.sortDirection();

    if (!sortCol || !sortDir) {
      this.dataSource.sort = null;
      // Reset to original unsorted order
      this.dataSource.data = [...this.originalData];
      return;
    }

    // Use centralized sorting service on original data
    const sortedData = this.tableSortService.sortRows(this.originalData, sortCol, sortDir);
    this.dataSource.data = sortedData;
  }

  onColumnHeaderClick(column: FlexibleColumn, event: MouseEvent) {
    // Prevent closing column when clicking to sort
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    const columnName = column.name;
    const currentSortCol = this.sortColumn();
    const currentSortDir = this.sortDirection();

    // Cycle through: none -> asc -> desc -> none
    if (currentSortCol !== columnName) {
      this.sortColumn.set(columnName);
      this.sortDirection.set('asc');
    } else if (currentSortDir === 'asc') {
      this.sortDirection.set('desc');
    } else if (currentSortDir === 'desc') {
      this.sortColumn.set(null);
      this.sortDirection.set(null);
    }

    this.applySorting();
  }

  getSortDirection(columnName: string): 'asc' | 'desc' | null {
    if (this.sortColumn() !== columnName) return null;
    return this.sortDirection();
  }

  getSortTooltip(columnName: string): string {
    const dir = this.getSortDirection(columnName);
    if (dir === 'asc') return 'Click to sort descending';
    if (dir === 'desc') return 'Click to clear sort';
    return 'Click to sort ascending';
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
  }

  toggleAllColumns(show: boolean) {
    if (show) {
      this.hiddenColumnIds.set(new Set());
    } else {
      const allIds = new Set(this.data()?.columns.map(col => col.id) || []);
      this.hiddenColumnIds.set(allIds);
    }
  }

  getCellValue(row: any, columnName: string): any {
    return this.tableSortService.getCellValue(row, columnName);
  }

  formatCellValue(value: any, column: FlexibleColumn): string {
    if (value === null || value === undefined) return '-';

    if (column.format.isArray && Array.isArray(value)) {
      return value.join(', ');
    }

    if (column.format.type === 'checkbox') {
      return value ? '✓' : '✗';
    }

    if (column.format.type === 'number' && typeof value === 'number') {
      return value.toLocaleString();
    }

    return String(value);
  }

  displayedColumns = computed(() => {
    return this.visibleColumns().map(col => col.name);
  });

  isLink(column: FlexibleColumn): boolean {
    return column.format.type === 'link' || column.format.type === 'url';
  }

  isCheckbox(column: FlexibleColumn): boolean {
    return column.format.type === 'checkbox';
  }

  trackByColumnId(index: number, column: FlexibleColumn): string {
    return column.id;
  }

  trackByRowId(index: number, row: any): string {
    return row.id;
  }

  getSafeUrl(row: any, columnName: string): string {
    const value = this.getCellValue(row, columnName);
    if (!value) return '';
    return this.sanitizer.sanitizeUrl(String(value));
  }

  onRowClick(row: any) {
    this.rowInfoCardService.showCard(row);
  }
}
