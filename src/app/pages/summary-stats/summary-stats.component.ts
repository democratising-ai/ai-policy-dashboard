import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import {
  Chart,
  BarController,
  BarElement,
  PieController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Colors,
} from 'chart.js';
import { PolicyDataService } from '../../services/policy-data.service';
import { FlexibleRow } from '../../services/data.models';

Chart.register(
  BarController,
  BarElement,
  PieController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Colors
);

interface StatCard {
  label: string;
  value: number;
  icon: string;
}

@Component({
  selector: 'app-summary-stats',
  standalone: true,
  imports: [MatCardModule, MatIconModule, BaseChartDirective],
  templateUrl: './summary-stats.component.html',
  styleUrl: './summary-stats.component.css',
})
export class SummaryStatsComponent {
  private policyData = inject(PolicyDataService);

  statCards: StatCard[] = [];

  /** Dynamic height for horizontal bar charts based on item count. */
  getChartHeight(chart: any): string {
    const count = chart?._itemCount ?? 0;
    if (count === 0) return '350px';
    return Math.max(350, count * 40) + 'px';
  }

  relevanceChart!: ChartConfiguration<'pie'>;
  yearChart!: ChartConfiguration<'bar'>;
  jurisdictionChart!: ChartConfiguration<'bar'>;
  relevanceTypeChart!: ChartConfiguration<'bar'>;
  educationChart!: ChartConfiguration<'bar'>;
  governanceChart!: ChartConfiguration<'bar'>;

  constructor() {
    const tableA = this.policyData.getData('tableA');
    const tableB = this.policyData.getData('tableB');
    const rowsA = tableA.rows;

    const analysisComplete = rowsA.filter(
      (r) => r.values['Analysis Complete'] === true
    ).length;
    const jurisdictions = new Set(
      rowsA.flatMap((r) => this.toArray(r.values['Policy creator']))
    );

    this.statCards = [
      {
        label: 'Total Policies Reviewed',
        value: rowsA.length,
        icon: 'description',
      },
      {
        label: 'Relevant Policies',
        value: rowsA.filter((r) => r.values['Relevant?'] === 'Yes').length,
        icon: 'check_circle',
      },
      {
        label: 'Analysis Complete',
        value: analysisComplete,
        icon: 'task_alt',
      },
      {
        label: 'Unique Jurisdictions',
        value: jurisdictions.size,
        icon: 'public',
      },
    ];

    this.relevanceChart = this.buildPieChart(rowsA, 'Relevant?');
    this.yearChart = this.buildBarChart(
      rowsA,
      'Year of Commencement or Creation',
      false,
      true
    );
    this.jurisdictionChart = this.buildBarChart(
      rowsA,
      'Policy creator',
      true
    );
    this.relevanceTypeChart = this.buildBarChart(
      tableB.rows,
      'Relevance Type',
      true
    );
    this.educationChart = this.buildBarChart(
      tableB.rows,
      'What kinds of education, if any, are contemplated by the policy?',
      true
    );
    this.governanceChart = this.buildBarChart(
      tableB.rows,
      'Governance practices employed',
      true
    );
  }

  private toArray(val: unknown): string[] {
    if (val == null || val === '') return [];
    if (Array.isArray(val)) return val.map((v) => String(v)).filter(Boolean);
    return [String(val)];
  }

  private countValues(
    rows: FlexibleRow[],
    column: string,
    isArray = false
  ): Map<string, number> {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const vals = isArray
        ? this.toArray(row.values[column])
        : [row.values[column]];
      for (let v of vals) {
        const key =
          v == null || v === '' ? 'Not specified' : String(v).trim();
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return counts;
  }

  private buildPieChart(
    rows: FlexibleRow[],
    column: string
  ): ChartConfiguration<'pie'> {
    const counts = this.countValues(rows, column);
    const labels = Array.from(counts.keys());
    const data = Array.from(counts.values());

    return {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: [
              '#4caf50',
              '#f44336',
              '#ff9800',
              '#2196f3',
              '#9c27b0',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    };
  }

  private buildBarChart(
    rows: FlexibleRow[],
    column: string,
    isArray = false,
    sortByLabel = false
  ): ChartConfiguration<'bar'> {
    const counts = this.countValues(rows, column, isArray);
    counts.delete('Not specified');

    let entries = Array.from(counts.entries());
    if (sortByLabel) {
      entries.sort((a, b) => a[0].localeCompare(b[0]));
    } else {
      entries.sort((a, b) => b[1] - a[1]);
    }

    if (entries.length > 20) entries = entries.slice(0, 20);

    const isHorizontal = isArray && !sortByLabel;
    const labels = entries.map(([k]) =>
      isHorizontal ? this.wrapLabel(k, 40) : k
    );
    const data = entries.map(([, v]) => v);

    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data,
            label: 'Count',
            backgroundColor: '#3f51b5',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: isHorizontal ? 'y' : 'x',
        plugins: { legend: { display: false } },
        scales: isHorizontal
          ? {
              y: {
                ticks: { font: { size: 12 }, autoSkip: false },
                afterFit: (axis: any) => {
                  axis.width = 260;
                },
              },
              x: {
                ticks: { stepSize: 1 },
              },
            }
          : {
              x: {
                ticks: { maxRotation: 45, autoSkip: true },
              },
            },
      },
      _itemCount: entries.length,
    } as ChartConfiguration<'bar'> & { _itemCount?: number };
  }

  /** Wrap a long label string into an array of lines for Chart.js. */
  private wrapLabel(text: string, maxChars: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      if (current && (current + ' ' + word).length > maxChars) {
        lines.push(current);
        current = word;
      } else {
        current = current ? current + ' ' + word : word;
      }
    }
    if (current) lines.push(current);
    return lines;
  }
}
