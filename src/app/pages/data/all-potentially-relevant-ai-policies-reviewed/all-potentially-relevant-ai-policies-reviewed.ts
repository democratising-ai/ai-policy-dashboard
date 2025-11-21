import { Component, computed, inject, OnInit, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
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
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule
  ],
  templateUrl: './all-potentially-relevant-ai-policies-reviewed.html',
  styleUrl: './all-potentially-relevant-ai-policies-reviewed.css'
})
export class TableAComponent implements OnInit, AfterViewInit {
  private policyDataService = inject(PolicyDataService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Signals
  data = signal<FlexibleTableData | null>(null);
  dataSource = new MatTableDataSource<any>([]);
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    this.policyDataService.getData('tableA').subscribe({
      next: (data) => {
        this.data.set(data);
        this.dataSource.data = data.rows;
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

  getRowTooltip(row: any): string {
    return JSON.stringify(row.values, null, 2);
  }
}
