import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card class="info-card">
      @if (getTitle()) {
        <mat-card-header class="info-card-header">
          <mat-card-title class="info-card-title">{{ getTitle() }}</mat-card-title>
        </mat-card-header>
      }

      <mat-card-content class="info-card-content">
        @for (item of dataEntries; track item[0]) {
          <div class="info-row">
            <span class="info-label">{{ formatLabel(item[0]) }}</span>
            <span class="info-value">{{ formatValue(item[1]) }}</span>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .info-card {
      max-width: 600px;
      min-width: 400px;
      width: auto !important;
      margin: 0 !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08) !important;
      border: none !important;
      border-radius: 12px !important;
      background: #ffffff !important;
      overflow: visible !important;
    }

    .info-card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.75rem 1rem !important;
      border-radius: 12px 12px 0 0;
      margin: 0 !important;
    }

    .info-card-title {
      color: white !important;
      font-size: 1rem !important;
      font-weight: 600 !important;
      margin: 0 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .info-card-content {
      padding: 0.75rem !important;
      max-height: 500px !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    /* Custom scrollbar styling */
    .info-card-content::-webkit-scrollbar {
      width: 8px;
    }

    .info-card-content::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    .info-card-content::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }

    .info-card-content::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    .info-row {
      display: grid;
      grid-template-columns: 160px 1fr;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e9ecef;
      transition: all 0.15s ease;
      align-items: start;
    }

    .info-row:hover {
      background: #e9ecef;
      border-color: #667eea;
      box-shadow: 0 1px 3px rgba(102, 126, 234, 0.1);
    }

    .info-label {
      font-weight: 600;
      color: #495057;
      font-size: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      padding-right: 0.5rem;
      border-right: 1px solid #dee2e6;
    }

    .info-value {
      color: #212529;
      font-size: 0.8125rem;
      word-break: break-word;
      line-height: 1.4;
    }
  `]
})
export class InfoCardComponent {
  @Input() data: any = {};

  get dataEntries() {
    if (!this.data || typeof this.data !== 'object') return [];

    return Object.entries(this.data)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '');
  }

  getTitle(): string | null {
    const titleFields = ['title', 'name', 'policy_name', 'document_title'];
    for (const field of titleFields) {
      if (this.data[field]) return String(this.data[field]);
    }
    return null;
  }
  formatLabel(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  formatValue(value: any): string {
    if (value === null || value === undefined) return '—';
    if (Array.isArray(value)) {
      return value.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(', ');
    }
    if (typeof value === 'object') {
      if (value.name) return value.name;
      if (value.title) return value.title;
      return Object.values(value).filter(v => typeof v === 'string').join(', ') || '—';
    }
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    if (typeof value === 'string' && value.length > 150) {
      return value.substring(0, 150) + '...';
    }
    return String(value);
  }
}
