import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { FlexibleColumn } from '../../services/data.models';

@Component({
  selector: 'app-column-builder-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Add New Column</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="column-form">
        <mat-form-field appearance="outline">
          <mat-label>Column Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Policy Category">
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Column name is required</mat-error>
          }
          @if (form.get('name')?.hasError('duplicate')) {
            <mat-error>A column with this name already exists</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            <mat-option value="text">Text</mat-option>
            <mat-option value="select">Select (Dropdown)</mat-option>
            <mat-option value="checkbox">Checkbox</mat-option>
            <mat-option value="number">Number</mat-option>
            <mat-option value="link">Link / URL</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-checkbox formControlName="isArray" color="primary">
          Multi-value (array)
        </mat-checkbox>

        @if (showOptions()) {
          <mat-form-field appearance="outline">
            <mat-label>Options (semicolon-separated)</mat-label>
            <input matInput formControlName="options"
              placeholder="Option 1; Option 2; Option 3">
            <mat-hint>Separate options with semicolons, e.g. Low; Medium; High</mat-hint>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid">
        <mat-icon>add</mat-icon>
        Add Column
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .column-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 400px;
      padding-top: 0.5rem;
    }
    mat-dialog-content {
      overflow: visible;
    }
  `]
})
export class ColumnBuilderDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ColumnBuilderDialogComponent>);
  private data: { existingColumns: string[] } = inject(MAT_DIALOG_DATA);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, this.duplicateValidator.bind(this)]],
      type: ['text', Validators.required],
      isArray: [false],
      options: ['']
    });
  }

  showOptions(): boolean {
    const type = this.form?.get('type')?.value;
    const isArray = this.form?.get('isArray')?.value;
    return type === 'select' || isArray;
  }

  private duplicateValidator(control: any) {
    if (!this.data?.existingColumns) return null;
    const name = (control.value || '').trim();
    if (this.data.existingColumns.some(c => c.toLowerCase() === name.toLowerCase())) {
      return { duplicate: true };
    }
    return null;
  }

  onSubmit() {
    if (this.form.invalid) return;

    const { name, type, isArray, options } = this.form.value;

    const parsedOptions = options
      ? options.split(';').map((o: string) => o.trim()).filter((o: string) => o)
      : undefined;

    const column: FlexibleColumn = {
      name: name.trim(),
      format: {
        type,
        isArray: !!isArray,
        ...(parsedOptions?.length ? { options: parsedOptions } : {})
      }
    };

    this.dialogRef.close(column);
  }
}
