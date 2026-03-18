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
2. Enable **Edit Mode** using the toggle in the action bar
3. Click **"Authenticate"** and enter your GitHub Personal Access Token in the dialog
4. You can now:
   - **Add New Policy**: click "Add New Policy" to open the form and submit a new row
   - **Edit inline**: modify cells directly in the table, then click "Save Changes"
   - **Add New Column**: click "Add Column" to add a new column definition to the table

### How It Works

1. User authenticates with a Personal Access Token via the token dialog
2. Form submission triggers `GitHubService.addRowToTable()` or `updateRowInTable()`
3. Inline edits are batched and committed via `GitHubService.updateMultipleRows()`
4. New columns are added via `GitHubService.addColumnToTable()`
5. Each service method fetches current file content via GitHub API, parses JSON, applies changes, and commits the updated file
6. GitHub Pages automatically rebuilds (if configured)

### Security Notes

Personal Access Tokens are stored in `localStorage` with a sliding 8-hour expiry — the token is automatically cleared after 8 hours of inactivity. Each interaction resets the expiry timer. This is acceptable for public repositories, trusted users, and development/testing.

### Troubleshooting

- You must have write permissions on the repo
- Ensure your token has the `repo` (or `public_repo`) scope
- If the token has expired (after 8 hours of inactivity), re-authenticate via the token dialog
