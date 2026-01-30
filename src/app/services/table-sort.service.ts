/**
 * Centralized table sorting service for consistent sorting across all tables.
 * Handles various data types: strings, numbers, booleans, arrays, and null/undefined values.
 */
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class TableSortService {

  /**
   * Normalizes a value for comparison by converting it to a consistent format.
   * - Arrays are converted to their first element (or empty string if empty)
   * - Objects with 'name' property use the name
   * - Other values are returned as-is
   */
  private normalizeValue(value: any): any {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // Handle arrays - use first element for sorting
    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      // Get first element and normalize it recursively
      const first = value[0];
      if (typeof first === 'object' && first != null && 'name' in first) {
        return String(first.name);
      }
      return this.normalizeValue(first);
    }

    // Handle objects with 'name' property
    if (typeof value === 'object' && value != null && 'name' in value) {
      return String(value.name);
    }

    return value;
  }

  /**
   * Compares two values for sorting, handling all data types consistently.
   * Returns: negative if a < b, positive if a > b, 0 if equal
   */
  private compareValues(a: any, b: any, direction: 'asc' | 'desc'): number {
    const aNorm = this.normalizeValue(a);
    const bNorm = this.normalizeValue(b);

    // Handle null/undefined/empty - sort to end
    const aEmpty = aNorm === null;
    const bEmpty = bNorm === null;
    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1;  // null values go to end
    if (bEmpty) return -1; // null values go to end

    // Booleans
    if (typeof aNorm === 'boolean' && typeof bNorm === 'boolean') {
      const cmp = (aNorm ? 1 : 0) - (bNorm ? 1 : 0);
      return direction === 'asc' ? cmp : -cmp;
    }

    // Numbers
    if (typeof aNorm === 'number' && typeof bNorm === 'number') {
      const cmp = aNorm - bNorm;
      return direction === 'asc' ? cmp : -cmp;
    }

    // Numeric-looking strings (e.g. "Year of Commencement")
    const aNum = typeof aNorm === 'string' ? parseFloat(aNorm) : NaN;
    const bNum = typeof bNorm === 'string' ? parseFloat(bNorm) : NaN;
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum) &&
        String(aNorm).trim() !== '' && String(bNorm).trim() !== '') {
      const cmp = aNum - bNum;
      return direction === 'asc' ? cmp : -cmp;
    }

    // Strings (and fallback): localeCompare
    const aStr = String(aNorm).trim();
    const bStr = String(bNorm).trim();
    const cmp = aStr.localeCompare(bStr, undefined, {
      sensitivity: 'base',
      numeric: true
    });
    return direction === 'asc' ? cmp : -cmp;
  }

  /**
   * Sorts an array of rows by a specified column.
   * @param rows Array of row objects with a 'values' property
   * @param columnName Name of the column to sort by
   * @param direction 'asc' or 'desc'
   * @returns A new sorted array (does not mutate the original)
   */
  sortRows(rows: any[], columnName: string, direction: 'asc' | 'desc'): any[] {
    const sorted = [...rows];

    sorted.sort((a, b) => {
      const aVal = a.values?.[columnName];
      const bVal = b.values?.[columnName];
      return this.compareValues(aVal, bVal, direction);
    });

    return sorted;
  }

  /**
   * Gets the cell value from a row for a given column name.
   * This is a helper method that can be used by components.
   */
  getCellValue(row: any, columnName: string): any {
    return row.values?.[columnName];
  }
}
