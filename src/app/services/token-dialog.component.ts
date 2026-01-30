import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-token-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>GitHub Authentication</h2>
    <mat-dialog-content>
      <p class="dialog-description">
        Enter your GitHub Personal Access Token to authenticate.
        <br>
        <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
          Create one at GitHub Settings
        </a>
      </p>
      <p class="scope-info">
        Required scope: <code>repo</code> (for private) or <code>public_repo</code> (for public)
      </p>

      <mat-form-field appearance="outline" class="token-field">
        <mat-label>Personal Access Token</mat-label>
        <input
          matInput
          [type]="hideToken ? 'password' : 'text'"
          [(ngModel)]="token"
          (ngModelChange)="validateToken()"
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          autocomplete="off"
          spellcheck="false"
          (keydown.enter)="submit()"
        >
        <button
          mat-icon-button
          matSuffix
          type="button"
          (click)="hideToken = !hideToken"
          [attr.aria-label]="hideToken ? 'Show token' : 'Hide token'"
        >
          <mat-icon>{{ hideToken ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      </mat-form-field>

      @if (tokenError) {
        <p class="token-error">{{ tokenError }}</p>
      }

      <p class="security-note">
        <mat-icon class="security-icon">security</mat-icon>
        Your token is stored in session storage and will be cleared when you close the tab.
      </p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="submit()"
        [disabled]="!isValidToken()"
      >
        Authenticate
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-description {
      margin-bottom: 8px;
      color: #666;
      font-size: 0.9rem;
    }

    .dialog-description a {
      color: #1976d2;
      text-decoration: none;
    }

    .dialog-description a:hover {
      text-decoration: underline;
    }

    .scope-info {
      background: #f5f5f5;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 0.85rem;
      margin-bottom: 16px;
    }

    .scope-info code {
      background: #e0e0e0;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }

    .token-field {
      width: 100%;
      min-width: 350px;
    }

    .token-error {
      color: #d32f2f;
      font-size: 0.8rem;
      margin: 4px 0 0 0;
    }

    .security-note {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: #4caf50;
      margin-top: 8px;
      margin-bottom: 0;
    }

    .security-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    mat-dialog-content {
      min-width: 400px;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
    }
  `]
})
export class TokenDialogComponent {
  private dialogRef = inject(MatDialogRef<TokenDialogComponent>);

  token = '';
  hideToken = true;
  tokenError = '';

  private static readonly TOKEN_PATTERN = /^(ghp_[a-zA-Z0-9]{36,}|github_pat_[a-zA-Z0-9_]{22,})$/;

  isValidToken(): boolean {
    const trimmed = this.token?.trim();
    if (!trimmed) return false;
    return TokenDialogComponent.TOKEN_PATTERN.test(trimmed);
  }

  validateToken(): void {
    const trimmed = this.token?.trim();
    if (!trimmed) {
      this.tokenError = '';
    } else if (!TokenDialogComponent.TOKEN_PATTERN.test(trimmed)) {
      this.tokenError = 'Token must start with ghp_ or github_pat_';
    } else {
      this.tokenError = '';
    }
  }

  submit(): void {
    const trimmed = this.token?.trim();
    if (trimmed && this.isValidToken()) {
      this.dialogRef.close(trimmed);
    }
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
