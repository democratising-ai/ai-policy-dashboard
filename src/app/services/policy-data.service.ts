import { Injectable, signal, computed } from '@angular/core';
import { FlexibleTableData, FlexibleColumn, FlexibleRow } from './data.models';
import tableADataRaw from '../../assets/data/table_a__all_potentially_relevant_ai_policies_reviewed.json';
import tableBDataRaw from '../../assets/data/table_b__all_relevant_policies.json';

@Injectable({
  providedIn: 'root'
})
export class PolicyDataService {
  private dataSources: Record<string, FlexibleTableData>;

  constructor() {
    this.dataSources = {
      tableA: this.validateTableData(tableADataRaw),
      tableB: this.validateTableData(tableBDataRaw)
    };
  }

  private isFlexibleColumn(value: unknown): value is FlexibleColumn {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as FlexibleColumn).id === 'string' &&
      typeof (value as FlexibleColumn).name === 'string' &&
      typeof (value as FlexibleColumn).type === 'string' &&
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
    return this.dataSources[tableName] ?? { columns: [], rows: [] };
  }

  getTableAData(): FlexibleTableData {
    return this.getData('tableA');
  }

  getTableBData(): FlexibleTableData {
    return this.getData('tableB');
  }
}
