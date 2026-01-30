import { Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-ai-principles',
  standalone: true,
  imports: [
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <div class="principles-container">
      <h1>AI in Education Principles</h1>

      <div class="principles-grid">
        @for (principle of dataService.aiPrinciples(); track principle.principle) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ principle.principle }}</mat-card-title>
              <mat-card-subtitle>Referenced in {{ principle.count }} policies</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>{{ principle.description }}</p>
              <mat-progress-bar
                mode="determinate"
                [value]="(principle.count / maxCount()) * 100"
                color="primary">
              </mat-progress-bar>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .principles-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .principles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    mat-card {
      height: 100%;
    }

    mat-card-content p {
      margin-bottom: 16px;
      min-height: 3em;
    }

    h1 {
      color: #333;
      margin-bottom: 20px;
    }
  `]
})
export class AIPrinciplesComponent {
  dataService = inject(DataService);

  maxCount = computed(() => {
    const principles = this.dataService.aiPrinciples();
    return principles.length > 0 ? Math.max(...principles.map(p => p.count)) : 1;
  });
}
