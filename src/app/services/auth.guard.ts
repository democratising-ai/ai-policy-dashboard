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

  const dialogRef = dialog.open(TokenDialogComponent, {
    width: '450px',
    disableClose: false,
    autoFocus: true
  });

  return dialogRef.afterClosed().pipe(
    map(token => {
      if (token) {
        githubService.setAccessToken(token);
        return true;
      } else {
        const tableType = route.params['table'];
        if (tableType === 'tableA') {
          router.navigate(['/data/all-potentially-relevant-ai-policies-reviewed']);
        } else if (tableType === 'tableB') {
          router.navigate(['/data/policy-analysis']);
        } else {
          location.back();
        }
        return false;
      }
    })
  );
};
