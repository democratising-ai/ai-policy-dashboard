// app.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './app.html',
  styles: [`
    mat-sidenav {
      width: 250px;
    }

    mat-sidenav-container {
      height: 100vh;
    }

    mat-sidenav-content {
      padding: 20px;
    }

    .active {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class AppComponent {
  title = 'Education and AI Policy Commons';
  private router = inject(Router);

  navigateToWelcome() {
    this.router.navigate(['/']);
  }
}
