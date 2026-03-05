import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class TableSortService {

  private normalizeValue(value: any): any {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      const first = value[0];
      if (typeof first === 'object' && first != null && 'name' in first) {
        return String(first.name);
      }
      return this.normalizeValue(first);
    }

    if (typeof value === 'object' && value != null && 'name' in value) {
      return String(value.name);
    }

    return value;
  }

  private compareValues(a: any, b: any, direction: 'asc' | 'desc'): number {
    const aNorm = this.normalizeValue(a);
    const bNorm = this.normalizeValue(b);

    const aEmpty = aNorm === null;
    const bEmpty = bNorm === null;
    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1;
    if (bEmpty) return -1;

    if (typeof aNorm === 'boolean' && typeof bNorm === 'boolean') {
      const cmp = (aNorm ? 1 : 0) - (bNorm ? 1 : 0);
      return direction === 'asc' ? cmp : -cmp;
    }

    if (typeof aNorm === 'number' && typeof bNorm === 'number') {
      const cmp = aNorm - bNorm;
      return direction === 'asc' ? cmp : -cmp;
    }

    const aNum = typeof aNorm === 'string' ? parseFloat(aNorm) : NaN;
    const bNum = typeof bNorm === 'string' ? parseFloat(bNorm) : NaN;
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum) &&
        String(aNorm).trim() !== '' && String(bNorm).trim() !== '') {
      const cmp = aNum - bNum;
      return direction === 'asc' ? cmp : -cmp;
    }

    const aStr = String(aNorm).trim();
    const bStr = String(bNorm).trim();
    const cmp = aStr.localeCompare(bStr, undefined, {
      sensitivity: 'base',
      numeric: true
    });
    return direction === 'asc' ? cmp : -cmp;
  }

  sortRows(rows: any[], columnName: string, direction: 'asc' | 'desc'): any[] {
    const sorted = [...rows];

    sorted.sort((a, b) => {
      const aVal = a.values?.[columnName];
      const bVal = b.values?.[columnName];
      return this.compareValues(aVal, bVal, direction);
    });

    return sorted;
  }

  getCellValue(row: any, columnName: string): any {
    return row.values?.[columnName];
  }
}
