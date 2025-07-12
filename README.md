# git-permalink

A lightweight VS Code extension that lets you copy a permanent link to the current file (and selected lines) at the exact Git commit you’re working on. Supports GitHub, GitLab, and Bitbucket remotes out of the box.

## Features

- **Copy permalink for any file & selection**  
  Select one or more lines in your editor, or simply place the cursor anywhere, then click **Copy Permalink** in the status bar (or run the **Git Permalink: Copy Permalink** command).

- **Line-range highlighting**  
  If you select multiple lines, the generated URL will highlight the entire range (e.g. `#L10-L20` on GitHub/GitLab, `#lines-10:20` on Bitbucket).  

## Requirements

- [Git CLI](https://git-scm.com/) must be installed and available on your system `PATH`.
- Your project must be a Git repository with a configured `origin` remote.

## Extension Settings

This extension does **not** add any new settings in your `settings.json`.  
All behavior is automatic; just install and start copying permalinks.

## Known Issues

- **No workspace folder**  
  If you open a single file without a workspace, the extension cannot determine the repo root and will show an error.
- **Unusual remotes**  
  Only remotes named `origin` are supported. If your remote is named differently, you can either rename it or modify the code to point to your remote name.
- **Non-standard repository layouts**  
  Submodules and nested git repos may produce unexpected relative paths.