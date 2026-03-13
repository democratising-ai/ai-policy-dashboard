import { Injectable } from '@angular/core';
import { FlexibleTableData, FlexibleColumn, FlexibleRow } from './data.models';

export interface HandsontableColumnConfig {
  data: string;
  type?: string;
  readOnly?: boolean;
  renderer?: string;
  width?: number;
  dropdownMenu?: string[] | boolean;
}

export interface TransformedTableData {
  data: Record<string, any>[];
  columns: HandsontableColumnConfig[];
  colHeaders: string[];
  originalRows: FlexibleRow[];
}

@Injectable({
  providedIn: 'root'
})
export class HandsontableTransformerService {

  transform(tableData: FlexibleTableData): TransformedTableData {
    const columns = this.transformColumns(tableData.columns);
    const colHeaders = tableData.columns.map(col => col.name);
    const data = this.transformRows(tableData.rows, tableData.columns);

    return {
      data,
      columns,
      colHeaders,
      originalRows: tableData.rows
    };
  }

  private transformColumns(columns: FlexibleColumn[]): HandsontableColumnConfig[] {
    return columns.map(col => {
      const config: HandsontableColumnConfig = {
        data: col.name,
        readOnly: true
      };

      // For array columns, use condition-only filter dropdown since filter_by_value
      // shows the full joined string as one entry (confusing for multi-value cells).
      if (col.format?.isArray) {
        config.dropdownMenu = [
          'filter_by_condition',
          'filter_operators',
          'filter_by_condition2',
          'filter_action_bar'
        ];
      }

      switch (col.format?.type) {
        case 'checkbox':
          config.type = 'checkbox';
          break;
        case 'number':
          config.type = 'numeric';
          break;
        case 'link':
        case 'url':
          config.renderer = 'html';
          break;
        default:
          config.type = 'text';
      }

      return config;
    });
  }

  private transformRows(rows: FlexibleRow[], columns: FlexibleColumn[]): Record<string, any>[] {
    return rows.map(row => {
      const transformedRow: Record<string, any> = {
        __originalRow: row,
        __rowId: row.id
      };

      columns.forEach(col => {
        let value = row.values?.[col.name];

        if (Array.isArray(value)) {
          const uniqueValues = [...new Set(value.filter((v: any) => v !== null && v !== undefined && v !== ''))];
          value = uniqueValues.join(', ');
        }

        if (value === null || value === undefined) {
          value = '';
        }

        if ((col.format?.type === 'link' || col.format?.type === 'url') && value) {
          value = `<a href="${this.sanitizeUrl(value)}" target="_blank" rel="noopener noreferrer" class="hot-link">View Link</a>`;
        }

        transformedRow[col.name] = value;
      });

      return transformedRow;
    });
  }

  private sanitizeUrl(url: string): string {
    if (!url) return '';
    const urlStr = String(url).trim();
    if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
      return urlStr;
    }
    return '';
  }

  getOriginalRow(transformedRow: Record<string, any>): FlexibleRow | null {
    return transformedRow?.['__originalRow'] || null;
  }

  /**
   * Returns column configs toggled for edit mode.
   * Dropdown columns get `type: 'dropdown'` with `source` options;
   * checkbox columns stay as checkboxes; others become editable text.
   */
  getEditableColumns(columns: FlexibleColumn[], editMode: boolean): HandsontableColumnConfig[] {
    return columns.map(col => {
      const config: HandsontableColumnConfig = {
        data: col.name,
        readOnly: !editMode
      };

      if (col.format?.isArray) {
        config.dropdownMenu = [
          'filter_by_condition',
          'filter_operators',
          'filter_by_condition2',
          'filter_action_bar'
        ];
      }

      if (!editMode) {
        switch (col.format?.type) {
          case 'checkbox':
            config.type = 'checkbox';
            break;
          case 'number':
            config.type = 'numeric';
            break;
          case 'link':
          case 'url':
            config.renderer = 'html';
            break;
          default:
            config.type = 'text';
        }
        return config;
      }

      // Edit mode configs
      if (col.format?.type === 'checkbox') {
        config.type = 'checkbox';
      } else if (col.format?.type === 'number') {
        config.type = 'numeric';
      } else if (col.format?.options?.length && !col.format.isArray) {
        config.type = 'dropdown';
        (config as any).source = col.format.options;
      } else {
        config.type = 'text';
      }

      return config;
    });
  }
}
