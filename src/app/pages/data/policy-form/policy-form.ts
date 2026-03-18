import { Component, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { GitHubService } from '../../../services/github.service';
import { PolicyDataService } from '../../../services/policy-data.service';
import { FlexibleTableData, FlexibleColumn } from '../../../services/data.models';
import { TokenDialogComponent } from '../../../services/token-dialog.component';
import { InputSanitizerService } from '../../../services/input-sanitizer.service';

@Component({
  selector: 'app-policy-form',
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    TextFieldModule
  ],
  templateUrl: './policy-form.html',
  styleUrl: './policy-form.css'
})
export class PolicyFormComponent {
  private fb = inject(FormBuilder);
  githubService = inject(GitHubService);
  private policyDataService = inject(PolicyDataService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private sanitizer = inject(InputSanitizerService);

  form!: FormGroup;
  tableData = signal<FlexibleTableData | null>(null);
  columns = signal<FlexibleColumn[]>([]);
  loading = signal(false);
  submitting = signal(false);
  isEditMode = signal(false);
  rowId = signal<string | null>(null);
  tableType = signal<'tableA' | 'tableB'>('tableA');

  constructor() {
    this.route.params.pipe(takeUntilDestroyed()).subscribe(params => {
      const table = params['table'] || 'tableA';
      this.tableType.set(table === 'tableB' ? 'tableB' : 'tableA');
      this.loadTableData();
    });

    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(params => {
      if (params['edit'] && params['id']) {
        const rawId = params['id'];
        if (this.isValidRowId(rawId)) {
          this.isEditMode.set(true);
          this.rowId.set(rawId);
          if (this.tableData()) {
            this.buildForm();
          }
        } else {
          this.snackBar.open('Invalid row ID parameter', 'Close', { duration: 3000 });
          this.router.navigate(['/data']);
        }
      }
    });
  }

  private isValidRowId(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    const validPattern = /^[a-zA-Z0-9_-]{1,100}$/;
    return validPattern.test(id);
  }

  loadTableData() {
    this.loading.set(true);
    const data = this.policyDataService.getData(this.tableType());

    this.tableData.set(data);
    this.columns.set(data.columns);

    if (this.isEditMode() && this.rowId()) {
      const row = data.rows.find(r => r.id === this.rowId());
      if (!row) {
        this.snackBar.open('Policy not found. It may have been deleted.', 'Close', { duration: 3000 });
        this.isEditMode.set(false);
        this.rowId.set(null);
        this.router.navigate([this.tableRoute()]);
        this.loading.set(false);
        return;
      }
    }

    this.buildForm();
    this.loading.set(false);
  }

  buildForm() {
    const data = this.tableData();
    if (!data) return;

    const formControls: any = {};

    data.columns.forEach(column => {
      const validators = [];

      if (column.name.toLowerCase().includes('name') ||
          column.name.toLowerCase().includes('title')) {
        validators.push(Validators.required);
      }

      if (column.format.type === 'checkbox') {
        formControls[column.name] = this.fb.control(false, validators);
      } else if (column.format.isArray && column.format.options?.length) {
        formControls[column.name] = this.fb.control([], validators);
      } else {
        formControls[column.name] = this.fb.control('', validators);
      }
    });

    this.form = this.fb.group(formControls);

    if (this.isEditMode() && this.rowId()) {
      const row = data.rows.find(r => r.id === this.rowId());
      if (row) {
        data.columns.forEach(col => {
          const control = this.form.get(col.name);
          if (control) {
            const value = row.values[col.name];
            if (Array.isArray(value)) {
              if (col.format.isArray && col.format.options?.length) {
                control.setValue(value);
              } else {
                control.setValue(value.join(', '));
              }
            } else {
              control.setValue(value ?? '');
            }
          }
        });
      }
    }
  }

  authenticate() {
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

  onSubmit() {
    if (!this.githubService.isAuthenticated()) {
      this.authenticate();
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.submitting.set(true);

    const formValue = this.form.value;
    const rowData: any = {
      values: {}
    };

    this.columns().forEach(column => {
      const value = formValue[column.name];
      const normalized = this.normalizeFormValue(column, value);
      if (normalized !== undefined) {
        rowData.values[column.name] = normalized;
      } else if (this.isEditMode()) {
        rowData.values[column.name] = column.format.isArray ? [] : '';
      }
    });

    const nameCol = this.columns().find(col =>
      col.name.toLowerCase().includes('name') || col.name.toLowerCase().includes('title')
    );
    if (!rowData.name && nameCol && rowData.values[nameCol.name]) {
      rowData.name = String(rowData.values[nameCol.name]);
    } else if (!rowData.name) {
      rowData.name = `New Entry ${new Date().toISOString()}`;
    }

    const sanitizationResult = this.sanitizer.sanitizeRowData(rowData.values);
    if (!sanitizationResult.isValid) {
      this.submitting.set(false);
      const errorMessages = sanitizationResult.errors.slice(0, 3).join('; ');
      this.snackBar.open(`Validation failed: ${errorMessages}`, 'Close', { duration: 5000 });
      return;
    }
    rowData.values = sanitizationResult.sanitizedValue;

    const nameResult = this.sanitizer.sanitizeString(rowData.name, { maxLength: 500 });
    rowData.name = nameResult.sanitizedValue;

    const operation = this.isEditMode() && this.rowId()
      ? this.githubService.updateRowInTable(this.tableType(), this.rowId()!, rowData)
      : this.githubService.addRowToTable(this.tableType(), rowData);

    operation.subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.snackBar.open(
          this.isEditMode() ? 'Policy updated successfully!' : 'Policy added successfully!',
          'Close',
          { duration: 3000 }
        );

        setTimeout(() => this.router.navigate([this.tableRoute()]), 1500);
      },
      error: (error) => {
        this.submitting.set(false);
        let errorMessage = error.error?.message || error.message || 'Failed to submit form';

        if (errorMessage.includes('Conflict')) {
          errorMessage = 'The data was modified by someone else. Please refresh and try again.';
        } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          errorMessage = 'File not found. Please verify the file exists in the repository.';
        } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          errorMessage = 'Authentication failed. Please check your Personal Access Token.';
        } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          errorMessage = 'Permission denied. Please check your token has the correct scopes (repo or public_repo).';
        }

        this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 7000 });
      }
    });
  }

  cancel() {
    this.router.navigate([this.tableRoute()]);
  }

  private tableRoute = computed(() =>
    this.tableType() === 'tableA'
      ? '/data/all-potentially-relevant-ai-policies-reviewed'
      : '/data/policy-analysis'
  );

  isFieldRequired(column: FlexibleColumn): boolean {
    return column.name.toLowerCase().includes('name') ||
           column.name.toLowerCase().includes('title');
  }

  isLongTextField(column: FlexibleColumn): boolean {
    return column.name.length > 50 ||
           column.name.toLowerCase().includes('reason') ||
           column.name.toLowerCase().includes('description') ||
           column.name.toLowerCase().includes('note');
  }

  laneClass(column: FlexibleColumn): string | null {
    const name = (column.name || '').trim().toLowerCase();
    const leftLane = new Set(['weekend', 'analysis complete']);
    const rightLane = new Set(['draft analysis complete', 'wc favourite']);

    if (rightLane.has(name)) return 'lane-right';
    if (leftLane.has(name)) return 'lane-left';
    return null;
  }

  /**
   * Get unique select options for a column, merging predefined options
   * with additional values found in existing data rows.
   */
  getSelectOptions(column: FlexibleColumn): string[] {
    const data = this.tableData();
    if (!data) return [];

    const orderedOptions: string[] = column.format.options ? [...column.format.options] : [];
    const optionSet = new Set<string>(orderedOptions);

    data.rows.forEach(row => {
      const value = row.values[column.name];
      if (Array.isArray(value)) {
        value.forEach((v: any) => {
          if (v !== null && v !== undefined && v !== '') {
            const str = String(v);
            if (!optionSet.has(str)) {
              orderedOptions.push(str);
              optionSet.add(str);
            }
          }
        });
      } else if (value !== null && value !== undefined && value !== '') {
        const str = String(value);
        if (!optionSet.has(str)) {
          orderedOptions.push(str);
          optionSet.add(str);
        }
      }
    });

    return orderedOptions;
  }

  hasSelectOptions(column: FlexibleColumn): boolean {
    return this.getSelectOptions(column).length > 0;
  }

  isAuthenticated = computed(() => this.githubService.isAuthenticated());
  currentUser = computed(() => this.githubService.currentUser());

  logout() {
    this.githubService.logout();
    this.snackBar.open('Logged out successfully', 'Close', { duration: 2000 });
  }

  private normalizeFormValue(column: FlexibleColumn, value: any): any | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }

    if (column.format.isArray) {
      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value === 'string') {
        const parts = value
          .split(',')
          .map((part: string) => part.trim())
          .filter((part: string) => part.length > 0);
        return parts.length > 0 ? parts : undefined;
      }

      return [value];
    }

    if (column.format.type === 'number') {
      const num = typeof value === 'number' ? value : Number(value);
      return Number.isNaN(num) ? undefined : num;
    }

    if (column.format.type === 'checkbox') {
      return Boolean(value);
    }

    return value;
  }
}
