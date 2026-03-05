import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
}

export interface GitHubFileContent {
  content: string;
  sha: string;
  encoding: string;
}

@Injectable({
  providedIn: 'root'
})
export class GitHubService {
  private readonly GITHUB_API = 'https://api.github.com';
  private readonly STORAGE_KEY = 'gh_session';
  private readonly TOKEN_EXPIRY_KEY = 'gh_session_exp';
  private readonly TOKEN_EXPIRY_HOURS = 8;

  private detectBranch(): string {
    const stored = localStorage.getItem('github_branch');
    return stored || 'main';
  }

  setBranch(branch: string): void {
    localStorage.setItem('github_branch', branch);
  }

  private detectRepoOwner(): string {
    const stored = localStorage.getItem('github_repo_owner');
    if (stored) return stored;

    const hostname = window.location.hostname;
    if (hostname.includes('github.io')) {
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        return parts[0];
      }
    }

    return 'democratising-ai';
  }

  private detectRepoName(): string {
    const stored = localStorage.getItem('github_repo_name');
    if (stored) return stored;

    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'ai-policy-dashboard';
    }

    const pathname = window.location.pathname;
    if (pathname.startsWith('/') && pathname.length > 1) {
      const parts = pathname.split('/').filter(p => p);
      if (parts.length > 0 && parts[0] !== '') {
        return parts[0];
      }
    }

    return 'ai-policy-dashboard';
  }

  setRepoConfig(owner: string, name: string): void {
    localStorage.setItem('github_repo_owner', owner);
    localStorage.setItem('github_repo_name', name);
  }

  private http = inject(HttpClient);

  isAuthenticated = signal<boolean>(false);
  currentUser = signal<GitHubUser | null>(null);
  accessToken = signal<string | null>(null);

  constructor() {
    this.checkAuthentication();
  }

  private checkAuthentication(): void {
    const token = sessionStorage.getItem(this.STORAGE_KEY);
    const expiry = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);

    if (token && expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() > expiryTime) {
        this.logout();
        return;
      }

      this.accessToken.set(token);
      this.verifyToken(token);
      this.refreshTokenExpiry();
    }
  }

  private refreshTokenExpiry(): void {
    const expiryTime = Date.now() + (this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
    sessionStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  private authHeaders(token?: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${token ?? this.accessToken()!}`,
      'Accept': 'application/vnd.github.v3+json'
    });
  }

  private verifyToken(token: string): void {
    const headers = this.authHeaders(token);

    this.http.get<GitHubUser>(`${this.GITHUB_API}/user`, { headers })
      .subscribe({
        next: (user) => {
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
        },
        error: () => {
          this.logout();
        }
      });
  }

  setAccessToken(token: string): void {
    sessionStorage.setItem(this.STORAGE_KEY, token);
    this.refreshTokenExpiry();
    this.accessToken.set(token);
    this.isAuthenticated.set(true);
    this.verifyToken(token);
  }

  logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    this.accessToken.set(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  getFileContent(filePath: string): Observable<GitHubFileContent> {
    const token = this.accessToken();
    if (!token) {
      return throwError(() => new Error('Not authenticated'));
    }

    const headers = this.authHeaders(token);
    const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, '/');
    const url = `${this.GITHUB_API}/repos/${this.detectRepoOwner()}/${this.detectRepoName()}/contents/${encodedPath}?ref=${this.detectBranch()}`;

    return this.http.get<GitHubFileContent>(url, { headers }).pipe(
      map(response => ({
        ...response,
        content: this.base64DecodeUnicode(response.content.replace(/\s/g, ''))
      })),
      catchError(error => {
        const errorMessage = error.status === 404
          ? `File not found at path: ${filePath} in branch: ${this.detectBranch()}. Please verify the file exists in your repository.`
          : error.error?.message || error.message || 'Failed to fetch file from GitHub';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private base64EncodeUnicode(str: string): string {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  }

  private base64DecodeUnicode(str: string): string {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }

  updateFile(
    filePath: string,
    content: string,
    message: string,
    sha?: string
  ): Observable<any> {
    const token = this.accessToken();
    if (!token) {
      return throwError(() => new Error('Not authenticated'));
    }

    const headers = this.authHeaders(token);
    const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, '/');
    const url = `${this.GITHUB_API}/repos/${this.detectRepoOwner()}/${this.detectRepoName()}/contents/${encodedPath}`;

    const body: any = {
      message: message,
      content: this.base64EncodeUnicode(content),
      branch: this.detectBranch()
    };

    if (sha) {
      body.sha = sha;
    }

    return this.http.put(url, body, { headers });
  }

  /**
   * Add a new row to a JSON data file by appending only.
   * Inserts new lines without rewriting existing content, avoiding spurious
   * diffs (e.g. line-ending or encoding changes) when pushing to GitHub.
   */
  addRowToTable(
    tableFile: string,
    newRow: any
  ): Observable<any> {
    const filePath = 'src/assets/data/table_a__all_potentially_relevant_ai_policies_reviewed.json';

    return this.getFileContent(filePath).pipe(
      switchMap(fileData => {
        try {
          const data = JSON.parse(fileData.content);
          const raw = fileData.content;
          const now = new Date().toISOString();

          const newId = `new-${Date.now()}`;
          const rowToAdd: any = {
            values: newRow.values || {},
            id: newId,
            name: newRow.name || `Row ${newId}`,
            index: data.rows.length,
            createdAt: now,
            updatedAt: now
          };

          const userName = this.currentUser()?.login || 'User';
          const commitMessage = `Add new row to ${tableFile} by ${userName}`;

          const lineEnding = raw.includes('\r\n') ? '\r\n' : '\n';
          const endPattern = new RegExp(`    \\}${lineEnding}  \\]${lineEnding}\\}${lineEnding}?$`);
          if (!endPattern.test(raw)) {
            return throwError(() => new Error('Unexpected JSON structure: could not find rows end'));
          }

          const newRowJson = JSON.stringify(rowToAdd, null, 2);
          const indented = newRowJson.split('\n').map(line => '    ' + line).join(lineEnding);
          const updated = raw.replace(endPattern, '    },' + lineEnding + indented + lineEnding + '  ]' + lineEnding + '}' + lineEnding);

          return this.updateFile(filePath, updated, commitMessage, fileData.sha);
        } catch (error) {
          return throwError(() => new Error('Failed to parse JSON data'));
        }
      })
    );
  }

  updateRowInTable(
    tableFile: string,
    rowId: string,
    updatedRow: any
  ): Observable<any> {
    const filePath = 'src/assets/data/table_a__all_potentially_relevant_ai_policies_reviewed.json';

    return this.getFileContent(filePath).pipe(
      switchMap(fileData => {
        try {
          const data = JSON.parse(fileData.content);

          const rowIndex = data.rows.findIndex((r: any) => r.id === rowId);
          if (rowIndex === -1) {
            return throwError(() => new Error('Row not found'));
          }

          data.rows[rowIndex] = {
            ...data.rows[rowIndex],
            ...updatedRow,
            id: rowId,
            updatedAt: new Date().toISOString()
          };

          const userName = this.currentUser()?.login || 'User';
          const commitMessage = `Update row ${rowId} in ${tableFile} by ${userName}`;

          return this.updateFile(filePath, JSON.stringify(data, null, 2), commitMessage, fileData.sha);
        } catch (error) {
          return throwError(() => new Error('Failed to parse JSON data'));
        }
      })
    );
  }

}
