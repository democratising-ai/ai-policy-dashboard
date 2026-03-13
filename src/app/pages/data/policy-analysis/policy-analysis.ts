import { Component, inject, signal, computed, viewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PolicyDataService } from '../../../services/policy-data.service';
import { GitHubService } from '../../../services/github.service';
import { FlexibleTableData, FlexibleRow, FlexibleColumn } from '../../../services/data.models';
import { RowInfoCardService } from '../../../services/row-info-card.service';
import { HotTableComponent } from '../../../components/hot-table/hot-table.component';
import { ColumnBuilderDialogComponent } from '../../../components/column-builder-dialog/column-builder-dialog.component';
import { TokenDialogComponent } from '../../../services/token-dialog.component';

@Component({
  selector: 'app-policy-analysis',
  standalone: true,
  imports: [
    HotTableComponent
  ],
  templateUrl: './policy-analysis.html',
  styleUrl: './policy-analysis.css'
})
export class PolicyAnalysisComponent {
  private policyDataService = inject(PolicyDataService);
  private rowInfoCardService = inject(RowInfoCardService);
  private githubService = inject(GitHubService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  hotTable = viewChild(HotTableComponent);

  data = signal<FlexibleTableData | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  isAuthenticated = computed(() => this.githubService.isAuthenticated());

  constructor() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = this.policyDataService.getData();
      this.data.set(data);
      this.loading.set(false);
    } catch (e) {
      this.error.set('Failed to load data');
      this.loading.set(false);
    }
  }

  onRowClick(row: FlexibleRow) {
    this.rowInfoCardService.showCard(row);
  }

  onSaveChanges(event: { rows: { id: string; values: Record<string, any> }[] }) {
    if (!this.githubService.isAuthenticated()) {
      this.promptAuth();
      return;
    }

    this.githubService.updateMultipleRows('tableA', event.rows).subscribe({
      next: () => {
        this.snackBar.open('Changes saved successfully!', 'Close', { duration: 3000 });
        this.hotTable()?.onSaveComplete(true);
      },
      error: (err) => {
        this.snackBar.open(`Error saving: ${err.message}`, 'Close', { duration: 5000 });
        this.hotTable()?.onSaveComplete(false);
      }
    });
  }

  onAddColumn() {
    if (!this.githubService.isAuthenticated()) {
      this.promptAuth();
      return;
    }

    const existingColumns = this.data()?.columns.map(c => c.name) || [];

    const dialogRef = this.dialog.open(ColumnBuilderDialogComponent, {
      width: '500px',
      data: { existingColumns }
    });

    dialogRef.afterClosed().subscribe((column: FlexibleColumn | undefined) => {
      if (!column) return;

      this.githubService.addColumnToTable(column).subscribe({
        next: () => {
          this.snackBar.open(`Column "${column.name}" added successfully!`, 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open(`Error adding column: ${err.message}`, 'Close', { duration: 5000 });
        }
      });
    });
  }

  private promptAuth() {
    const dialogRef = this.dialog.open(TokenDialogComponent, {
      width: '450px',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(token => {
      if (token) {
        this.githubService.setAccessToken(token);
      }
    });
  }
}
