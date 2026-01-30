# AI Policy Dashboard
An Angular application for tracking and analyzing AI policies. Supports GitHub-based form submissions that commit directly to the repository.

## Development

### Prerequisites
- Node.js
- Angular CLI

### Building

```bash
ng build
```

Build artifacts are stored in `dist/`.

### Development Server

```bash
ng serve
```

Open `http://localhost:4200/`. The app reloads automatically on file changes.

## GitHub API Integration

The app supports GitHub authentication and form submissions that commit directly to the repository, triggering automatic GitHub Pages rebuilds.

### Setup of GitHub API

Repository settings are auto-detected from the GitHub Pages URL, or can be configured manually via `localStorage`:

   ```typescript
   localStorage.setItem('github_repo_owner', 'democratising-ai');
   localStorage.setItem('github_repo_name', 'ai-policy-dashboard');
   localStorage.setItem('github_branch', 'main');
   ```

### Usage
#### Create a GitHub Personal Access Token (Classic)
   - Go to https://github.com/settings/tokens
   - Click **"Generate new token"** > **"Generate new token (classic)"**
   - Name it (e.g., "AI Policy Dashboard Forms")
   - Select the **`repo`** scope (or `public_repo` for public repos only)
   - Click **"Generate token"** and copy it immediately

#### Website
1. Navigate to a data table (e.g., Policy Analysis)
2. Click "Add New Entry"
3. Enter your GitHub Personal Access Token when prompted
4. Fill out and submit the form — it commits directly to the repository

### How It Works

1. User authenticates with a Personal Access Token
2. Form submission triggers `GitHubService.addRowToTable()` or `updateRowInTable()`
3. Service fetches current file content via GitHub API, parses JSON, adds/updates the row
4. Service commits the updated file back to the repository
5. GitHub Pages automatically rebuilds (if configured)

### Security Notes

Personal Access Tokens are stored in `sessionStorage` and are cleared when the browser tab is closed. This is acceptable for public repositories, trusted users, and development/testing.

### Troubleshooting

- You must have write permissions on the repo
- Ensure your token has the `repo` (or `public_repo`) scope
- If the token has expired, generate a new one and re-enter it
