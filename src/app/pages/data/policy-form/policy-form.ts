import { Component, DestroyRef, inject, OnInit, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
    MatDialogModule
  ],
  templateUrl: './policy-form.html',
  styleUrl: './policy-form.css'
})
export class PolicyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  githubService = inject(GitHubService);
  private policyDataService = inject(PolicyDataService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private sanitizer = inject(InputSanitizerService);
  private destroyRef = inject(DestroyRef);

  form!: FormGroup;
  tableData = signal<FlexibleTableData | null>(null);
  columns = signal<FlexibleColumn[]>([]);
  loading = signal(false);
  submitting = signal(false);
  isEditMode = signal(false);
  rowId = signal<string | null>(null);
  tableType = signal<'tableA' | 'tableB'>('tableB');
  ngOnInit() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const table = params['table'] || 'tableB';
      this.tableType.set(table === 'tableA' ? 'tableA' : 'tableB');
      this.loadTableData();
    });

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['edit'] && params['id']) {
        const rawId = params['id'];
        // Validate row ID format (prevent injection)
        if (this.isValidRowId(rawId)) {
          this.isEditMode.set(true);
          this.rowId.set(rawId);
        } else {
          this.snackBar.open('Invalid row ID parameter', 'Close', { duration: 3000 });
          this.router.navigate(['/data']);
        }
      }
    });

  }

  /**
   * Validate row ID format to prevent injection attacks
   */
  private isValidRowId(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    // Allow alphanumeric, hyphens, underscores, and common ID formats
    // Max length 100 to prevent DoS
    const validPattern = /^[a-zA-Z0-9_-]{1,100}$/;
    return validPattern.test(id);
  }

  loadTableData() {
    this.loading.set(true);
    const data = this.tableType() === 'tableA'
      ? this.policyDataService.getTableAData()
      : this.policyDataService.getTableBData();

    this.tableData.set(data);
    this.columns.set(data.columns);

    // Validate row exists if in edit mode
    if (this.isEditMode() && this.rowId()) {
      const row = data.rows.find(r => r.id === this.rowId());
      if (!row) {
        this.snackBar.open('Row not found. It may have been deleted.', 'Close', { duration: 3000 });
        this.isEditMode.set(false);
        this.rowId.set(null);
        // Redirect to table view
        const route = this.tableType() === 'tableA'
          ? '/data/all-potentially-relevant-ai-policies-reviewed'
          : '/data/policy-analysis';
        this.router.navigate([route]);
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
        formControls[column.id] = this.fb.control(false, validators);
      } else {
        formControls[column.id] = this.fb.control('', validators);
      }
    });

    this.form = this.fb.group(formControls);

    if (this.isEditMode() && this.rowId()) {
      const row = data.rows.find(r => r.id === this.rowId());
      if (row) {
        Object.keys(row.values).forEach(key => {
          const control = this.form.get(key);
          if (control) {
            const value = row.values[key];
            if (Array.isArray(value)) {
              control.setValue(value.join(', '));
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

    // Build row data from form
    const formValue = this.form.value;
    const rowData: any = {
      values: {}
    };

    // Map form values to row structure (use column *name* as key to match table JSON)
    this.columns().forEach(column => {
      const value = formValue[column.id];
      const normalized = this.normalizeFormValue(column, value);
      if (normalized !== undefined) {
        rowData.values[column.name] = normalized;
      }
    });

    // Add name if not present
    const nameCol = this.columns().find(col =>
      col.name.toLowerCase().includes('name') || col.name.toLowerCase().includes('title')
    );
    if (!rowData.name && nameCol && rowData.values[nameCol.name]) {
      rowData.name = String(rowData.values[nameCol.name]);
    } else if (!rowData.name) {
      rowData.name = `New Entry ${new Date().toISOString()}`;
    }

    // Sanitize and validate all input data before submission
    const sanitizationResult = this.sanitizer.sanitizeRowData(rowData.values);
    if (!sanitizationResult.isValid) {
      this.submitting.set(false);
      const errorMessages = sanitizationResult.errors.slice(0, 3).join('; ');
      this.snackBar.open(`Validation failed: ${errorMessages}`, 'Close', { duration: 5000 });
      return;
    }
    rowData.values = sanitizationResult.sanitizedValue;

    // Also sanitize the name field
    const nameResult = this.sanitizer.sanitizeString(rowData.name, { maxLength: 500 });
    rowData.name = nameResult.sanitizedValue;

    const operation = this.isEditMode() && this.rowId()
      ? this.githubService.updateRowInTable(this.tableType(), this.rowId()!, rowData)
      : this.githubService.addRowToTable(this.tableType(), rowData);

    operation.subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.snackBar.open(
          this.isEditMode() ? 'Row updated successfully!' : 'Row added successfully!',
          'Close',
          { duration: 3000 }
        );

        // Navigate back to table view
        setTimeout(() => {
          const route = this.tableType() === 'tableA'
            ? '/data/all-potentially-relevant-ai-policies-reviewed'
            : '/data/policy-analysis';
          this.router.navigate([route]);
        }, 1500);
      },
      error: (error) => {
        this.submitting.set(false);
        let errorMessage = error.error?.message || error.message || 'Failed to submit form';

        // Provide helpful error messages for common issues
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
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
    const route = this.tableType() === 'tableA'
      ? '/data/all-potentially-relevant-ai-policies-reviewed'
      : '/data/policy-analysis';
    this.router.navigate([route]);
  }

  getFieldLabel(column: FlexibleColumn): string {
    return column.name;
  }

  getFieldType(column: FlexibleColumn): string {
    return column.format.type;
  }

  isFieldRequired(column: FlexibleColumn): boolean {
    return column.name.toLowerCase().includes('name') ||
           column.name.toLowerCase().includes('title');
  }

  /**
   * Get unique select options for a column based on existing table rows.
   * This makes <mat-select> usable instead of only showing the placeholder.
   * Handles both array and non-array values in the data.
   */
  getSelectOptions(column: FlexibleColumn): string[] {
    const data = this.tableData();
    if (!data) return [];

    const options = new Set<string>();

    data.rows.forEach(row => {
      const value = row.values[column.name];

      // Handle array values (even if column says isArray: false, data may have arrays)
      if (Array.isArray(value)) {
        value.forEach((v: any) => {
          if (v !== null && v !== undefined && v !== '') {
            options.add(String(v));
          }
        });
      } else if (value !== null && value !== undefined && value !== '') {
        options.add(String(value));
      }
    });

    // If no options found, check if column has predefined options in format
    if (options.size === 0 && column.format['options']) {
      column.format['options'].forEach((opt: string) => options.add(opt));
    }

    return Array.from(options).sort((a, b) => a.localeCompare(b));
  }

  /**
   * Check if a select column has any options available.
   */
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
