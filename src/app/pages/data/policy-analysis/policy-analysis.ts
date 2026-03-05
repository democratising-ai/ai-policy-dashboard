import { Component, inject, signal } from '@angular/core';
import { PolicyDataService } from '../../../services/policy-data.service';
import { FlexibleTableData, FlexibleRow } from '../../../services/data.models';
import { RowInfoCardService } from '../../../services/row-info-card.service';
import { HotTableComponent } from '../../../components/hot-table/hot-table.component';

@Component({
  selector: 'app-policy-analysis',
  standalone: true,
  imports: [
    HotTableComponent
  ],
  templateUrl: './policy-analysis.html',
  styleUrl: './policy-analysis.css'
})
export class PolicyAnalysisComponent {
  private policyDataService = inject(PolicyDataService);
  private rowInfoCardService = inject(RowInfoCardService);

  data = signal<FlexibleTableData | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = this.policyDataService.getData();
      this.data.set(data);
      this.loading.set(false);
    } catch (e) {
      this.error.set('Failed to load data');
      this.loading.set(false);
    }
  }

  onRowClick(row: FlexibleRow) {
    this.rowInfoCardService.showCard(row);
  }
}
