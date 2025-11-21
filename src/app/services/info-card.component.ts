// services/info-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="info-card">
      <mat-card-header>
        <mat-card-title>{{ getTitle() }}</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        @for (item of dataEntries; track item[0]) {
          <div class="info-row">
            <span class="info-label">{{ item[0] }}:</span>
            <span class="info-value">{{ formatValue(item[1]) }}</span>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .info-card {
      max-width: 400px;
      min-width: 300px;
      max-height: 300px;
      overflow-y: auto;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
      border: 1px solid #e0e0e0;
    }

    .info-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .info-label {
      font-weight: 500;
      color: #666;
      min-width: 120px;
      flex-shrink: 0;
      font-size: 0.875rem;
    }

    .info-value {
      flex: 1;
      word-break: break-word;
      font-size: 0.875rem;
    }
  `]
})
export class InfoCardComponent {
  @Input() data: any = {};

  get dataEntries() {
    if (!this.data || typeof this.data !== 'object') return [];

    return Object.entries(this.data)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .slice(0, 8);
  }

  getTitle(): string {
    const titleFields = ['title', 'name', 'policy_name', 'document_title'];
    for (const field of titleFields) {
      if (this.data[field]) return String(this.data[field]);
    }
    return 'Row Details';
  }

  formatValue(value: any): string {
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    if (typeof value === 'string' && value.length > 150) {
      return value.substring(0, 150) + '...';
    }
    return String(value);
  }
}
