// services/data.service.ts
import { Injectable, signal } from '@angular/core';
import { FlexibleTableData } from './data.models';
import { Observable, of } from 'rxjs';
import tableADataRaw from '../../assets/data/table_a__all_potentially_relevant_ai_policies_reviewed.json';
import tableBDataRaw from '../../assets/data/table_b__all_relevant_policies.json';

@Injectable({
  providedIn: 'root'
})
export class PolicyDataService {
  private dataSources: Record<string, FlexibleTableData>;

  constructor() {
    // Validate and ensure the data matches the interface
    this.dataSources = {
      tableA: this.validateTableData(tableADataRaw),
      tableB: this.validateTableData(tableBDataRaw)
    };
  }

  private validateTableData(data: any): FlexibleTableData {
    // Basic validation - ensure required properties exist
    if (!data.columns || !data.rows) {
      console.error('Invalid table data structure', data);
      return { columns: [], rows: [] };
    }
    return data as FlexibleTableData;
  }

  getData(tableName: 'tableA' | 'tableB' = 'tableB'): Observable<FlexibleTableData> {
    return of(this.dataSources[tableName]);
  }

  getTableAData(): Observable<FlexibleTableData> {
    return this.getData('tableA');
  }

  getTableBData(): Observable<FlexibleTableData> {
    return this.getData('tableB');
  }
}

// Keep DataService separate if needed for other purposes
export class DataService {
  private aiPrinciplesSignal = signal([
    { principle: "Accountability", count: 9, description: "It should always be clear who is accountable for the use of AI in educational settings" },
    { principle: "Privacy and data protection", count: 13, description: "AI systems used in educational settings should not create privacy or data security vulnerabilities" },
    { principle: "Transparency (explainability)", count: 10, description: "AI systems used in education should be sufficiently explainable" },
    { principle: "Teacher training", count: 18, description: "Teachers should be trained to ensure that AI is used well in educational settings" },
    { principle: "Equity/equality (increasing)", count: 12, description: "This technology should be used as a means of reducing existing educational inequities" },
    { principle: "Harm avoidance", count: 10, description: "AI systems used in schools should not harm the wellbeing or safety of any member" },
    { principle: "Academic integrity", count: 3, description: "Students should be supported to use AI tools ethically in their work" },
    { principle: "Human rights-centred", count: 10, description: "The technology must be consistent with human rights" },
    { principle: "Augmentation, not replacement", count: 7, description: "AI systems should not be used in educational settings as a replacement for teachers" },
    { principle: "Managing bias", count: 10, description: "The risk of bias should be managed with care" }
  ]);

  readonly aiPrinciples = this.aiPrinciplesSignal.asReadonly();
}
