/**
 * HTTP Interceptor for adding security headers and handling authentication errors.
 */

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { GitHubService } from './github.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const githubService = inject(GitHubService);

  const isGitHubApi = req.url.includes('api.github.com');
  let modifiedReq = req;

  if (isGitHubApi) {
    modifiedReq = req.clone({
      setHeaders: {
        'Accept': 'application/vnd.github.v3+json',
      }
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle authentication errors
      if (error.status === 401) {
        // Token is invalid or expired - clear it
        githubService.logout();
        return throwError(() => new Error('Authentication expired. Please re-authenticate.'));
      }

      if (error.status === 403) {
        // Rate limiting or permission issues
        if (error.headers?.get('X-RateLimit-Remaining') === '0') {
          return throwError(() => new Error('GitHub API rate limit exceeded. Please wait before trying again.'));
        }
        return throwError(() => new Error('Permission denied. Please check your token permissions.'));
      }

      if (error.status === 404) {
        return throwError(() => new Error('Resource not found. Please verify the file path and repository settings.'));
      }

      if (error.status >= 500) {
        return throwError(() => new Error('GitHub server error. Please try again later.'));
      }

      return throwError(() => error);
    })
  );
};
