// tips.component.ts
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-tips',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Tips for Effective Use</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <h2>Getting Started</h2>
        <p>Navigate through the dashboards to explore policy data and trends.</p>

        <h2>Using the Search Features</h2>
        <p>Use filters to narrow down policies by type, status, or jurisdiction.</p>

        <h2>Contributing</h2>
        <p>Add new policies using the Policy Entry Form in the navigation menu.</p>
      </mat-card-content>
    </mat-card>
  `
})
export class TipsComponent { }
