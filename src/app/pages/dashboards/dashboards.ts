// pages/dashboards/dashboards.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataService } from '../../services/data.service';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-dashboards',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatProgressBarModule,
    RouterModule
  ],
  templateUrl: './dashboards.html',
  styleUrl: './dashboards.css',
})
export class DashboardsComponent {
  dataService = inject(DataService);
}
