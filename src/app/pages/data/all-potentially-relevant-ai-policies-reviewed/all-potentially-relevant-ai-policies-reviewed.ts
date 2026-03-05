import { Component, inject, signal } from '@angular/core';
import { PolicyDataService } from '../../../services/policy-data.service';
import { FlexibleTableData, FlexibleRow } from '../../../services/data.models';
import { RowInfoCardService } from '../../../services/row-info-card.service';
import { HotTableComponent } from '../../../components/hot-table/hot-table.component';

@Component({
  selector: 'app-table-a',
  standalone: true,
  imports: [
    HotTableComponent
  ],
  templateUrl: './all-potentially-relevant-ai-policies-reviewed.html',
  styleUrl: './all-potentially-relevant-ai-policies-reviewed.css'
})
export class TableAComponent {
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
      const data = this.policyDataService.getData('tableA');
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
