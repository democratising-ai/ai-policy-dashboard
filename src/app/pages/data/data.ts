// pages/data/data.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { DataService } from '../../services/data.service';
import { FlexibleTableData } from '../../services/data.models';
import { Observable } from 'rxjs';
import { PolicyDataService } from '../../services/data.service';
import { RouterModule, RouterOutlet  } from "@angular/router";

@Component ({
  selector: 'app-data',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatChipsModule, RouterModule, RouterOutlet],
  templateUrl: './data.html',
  styleUrl: './data.css'
})
export class DataComponent {
}
