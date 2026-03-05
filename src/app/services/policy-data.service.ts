import { Injectable } from '@angular/core';
import { FlexibleTableData, FlexibleColumn, FlexibleRow } from './data.models';
import tableADataRaw from '../../assets/data/table_a__all_potentially_relevant_ai_policies_reviewed.json';

/** Column name for "Relevance Type" – rows with a non-empty value appear in table B. */
const RELEVANCE_TYPE_COL = 'Relevance Type';

@Injectable({
  providedIn: 'root'
})
export class PolicyDataService {
  private tableA: FlexibleTableData;
  private tableB: FlexibleTableData;

  constructor() {
    this.tableA = this.validateTableData(tableADataRaw);
    this.tableB = this.deriveTableB(this.tableA);
  }

  /** Table B = table A rows where "Relevance Type" is not blank, same columns. */
  private deriveTableB(tableA: FlexibleTableData): FlexibleTableData {
    const rows = tableA.rows.filter(row => {
      const val = row.values[RELEVANCE_TYPE_COL];
      if (val == null || val === '') return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    });

    return { columns: tableA.columns, rows };
  }

  private isFlexibleColumn(value: unknown): value is FlexibleColumn {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as FlexibleColumn).name === 'string' &&
      typeof (value as FlexibleColumn).format === 'object' &&
      (value as FlexibleColumn).format !== null
    );
  }

  private isFlexibleRow(value: unknown): value is FlexibleRow {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as FlexibleRow).id === 'string' &&
      typeof (value as FlexibleRow).name === 'string' &&
      typeof (value as FlexibleRow).index === 'number' &&
      typeof (value as FlexibleRow).values === 'object' &&
      (value as FlexibleRow).values !== null
    );
  }

  private validateTableData(data: unknown): FlexibleTableData {
    if (
      typeof data !== 'object' ||
      data === null ||
      !Array.isArray((data as FlexibleTableData).columns) ||
      !Array.isArray((data as FlexibleTableData).rows)
    ) {
      return { columns: [], rows: [] };
    }

    const typed = data as FlexibleTableData;
    return {
      columns: typed.columns.filter(col => this.isFlexibleColumn(col)),
      rows: typed.rows.filter(row => this.isFlexibleRow(row))
    };
  }

  getData(tableName: 'tableA' | 'tableB' = 'tableB'): FlexibleTableData {
    return tableName === 'tableA' ? this.tableA : this.tableB;
  }
}
