# Copy git permalink

A lightweight VS Code extension that lets you copy a permanent link to the current file (and selected lines) at the exact Git commit you’re working on. Supports GitHub, GitLab, and Bitbucket remotes out of the box.

## Features

- **Copy permalink for any file & selection**  
  Select one or more lines in your editor, or simply place the cursor anywhere, then click **Copy Permalink** in the status bar/right click context menu (or run the **Copy Permalink** command).
  
  <img alt="git permalink status bar bottom right" src="https://github.com/user-attachments/assets/fe493274-9299-4e5a-9dab-bcbcaadc3a28" />
  
  <img alt="git permalink context menu" src="https://github.com/user-attachments/assets/b2b847ab-0c3e-4665-b45e-cbbba2873bde" />


- **Line-range highlighting**  
  If you select multiple lines, the generated URL will highlight the entire range (e.g. `#L10-L20` on GitHub/GitLab, `#lines-10:20` on Bitbucket).  

## Requirements

- Relies on `vscode.git` extension.
- Your project must be a Git repository with a configured `origin` remote.

## Extension Settings

This extension does **not** add any new settings in your `settings.json`.  
All behavior is automatic; just install and start copying permalinks.
