import { Component, inject, signal } from '@angular/core';

import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
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
      padding: 0.2vh;
    }

    .active {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class AppComponent {
  title = 'Education and AI Policy Commons';
  private router = inject(Router);
  showSidebar = signal(true);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe((event) => {
      this.showSidebar.set(!event.url.includes('policy-form'));
    });
  }

  navigateToWelcome() {
    this.router.navigate(['/']);
  }
}
