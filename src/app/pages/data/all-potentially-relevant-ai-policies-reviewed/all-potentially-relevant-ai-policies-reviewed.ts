import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { PolicyDataService } from '../../../services/data.service';
import { FlexibleTableData, FlexibleColumn } from '../../../services/data.models';

@Component({
  selector: 'app-table-a',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './all-potentially-relevant-ai-policies-reviewed.html',
  styleUrl: './all-potentially-relevant-ai-policies-reviewed.css'
})
export class TableAComponent implements OnInit {
  private policyDataService = inject(PolicyDataService);

  // Signals
  data = signal<FlexibleTableData | null>(null);
  hiddenColumnIds = signal(new Set<string>());
  loading = signal(true);
  error = signal<string | null>(null);

  // Computed
  visibleColumns = computed(() => {
    const tableData = this.data();
    const hidden = this.hiddenColumnIds();
    if (!tableData) return [];
    return tableData.columns.filter(col => !hidden.has(col.id));
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    // Change this line - use the existing getData() method with 'tableA' parameter
    this.policyDataService.getData('tableA').subscribe({
      next: (data) => {
        console.log('Table A Data loaded:', data);
        this.data.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load data');
        this.loading.set(false);
        console.error('Error loading data:', err);
      }
    });
  }

  toggleColumn(columnId: string) {
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

  // Fixed: Use column.id instead of column.name
  getCellValue(row: any, columnId: string): any {
    return row.values[columnId];
  }

  formatCellValue(value: any, column: FlexibleColumn): string {
    if (value === null || value === undefined) return '-';

    if (column.format?.isArray && Array.isArray(value)) {
      return value.join(', ');
    }

    if (column.format?.type === 'number' && typeof value === 'number') {
      return value.toLocaleString();
    }

    return String(value);
  }

  displayedColumns = computed(() => {
    return this.visibleColumns().map(col => col.name);
  });

  isCheckbox(column: FlexibleColumn): boolean {
    return column.format.type === 'checkbox';
  }

  isLink(column: FlexibleColumn): boolean {
    return column.format.type === 'link' || column.format.type === 'url';
  }

  trackByColumnId(index: number, column: FlexibleColumn): string {
    return column.id;
  }

  trackByRowId(index: number, row: any): string {
    return row.id;
  }
}
