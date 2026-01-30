import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { GitHubService } from './github.service';
import { TokenDialogComponent } from './token-dialog.component';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, _state) => {
  const githubService = inject(GitHubService);
  const router = inject(Router);
  const location = inject(Location);
  const dialog = inject(MatDialog);

  if (githubService.isAuthenticated()) {
    return true;
  }

  // Show authentication dialog and wait for result
  const dialogRef = dialog.open(TokenDialogComponent, {
    width: '450px',
    disableClose: false,
    autoFocus: true
  });

  // Return an Observable that resolves based on dialog result
  return dialogRef.afterClosed().pipe(
    map(token => {
      if (token) {
        githubService.setAccessToken(token);
        return true; // Allow navigation
      } else {
        // Navigate back to the appropriate table view based on route parameter
        const tableType = route.params['table'];
        if (tableType === 'tableA') {
          router.navigate(['/data/all-potentially-relevant-ai-policies-reviewed']);
        } else if (tableType === 'tableB') {
          router.navigate(['/data/policy-analysis']);
        } else {
          // Fallback: go back in history if possible, otherwise navigate to data
          location.back();
        }
        return false; // Block navigation
      }
    })
  );
};
