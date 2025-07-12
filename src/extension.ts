import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

	const commandId = "git-permalink.copyPermalink";

	let disposable = vscode.commands.registerCommand(commandId, async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found.');
			return;
		}

		const selection = editor.selection;
		const startLine = selection.start.line + 1;
		const endLine = selection.end.line + 1;

		const filePath = editor.document.uri.fsPath;
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);

		if (!workspaceFolder) {
			vscode.window.showErrorMessage('No workspace folder found for the current file.');
			return;
		}

		const repoPath = workspaceFolder.uri.fsPath;

		try {
			const remoteUrl = await getRemoteUrl(repoPath);
			const commitHash = await getCommitHash(repoPath);
			const relativePath = path.relative(repoPath, filePath).replace(/\\/g, '/');

			if (remoteUrl) {
				const permalink = createPermalink(remoteUrl, commitHash, relativePath, startLine, endLine);
				await vscode.env.clipboard.writeText(permalink);
				vscode.window.showInformationMessage('Permalink copied to clipboard!');
			}
		} catch (error) {
			if (error instanceof Error) {
				vscode.window.showErrorMessage(`Error generating permalink: ${error.message}`);
			} else {
				vscode.window.showErrorMessage(`An unknown error occurred while generating the permalink.`);
			}
		}
	});

	context.subscriptions.push(disposable);

	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = commandId;
	statusBarItem.text = "$(link) Copy Permalink";
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);
}

export function getRemoteUrl(repoPath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		exec('git config --get remote.origin.url', { cwd: repoPath }, (err, stdout, stderr) => {
			if (err) {
				return reject(new Error('Could not get remote URL. Is this a git repository?'));
			}
			if (stderr) {
				return reject(new Error(stderr));
			}
			resolve(stdout.trim());
		});
	});
}

export function getCommitHash(repoPath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		exec('git rev-parse HEAD', { cwd: repoPath }, (err, stdout, stderr) => {
			if (err) {
				return reject(new Error('Could not get commit hash.'));
			}
			if (stderr) {
				return reject(new Error(stderr));
			}
			resolve(stdout.trim());
		});
	});
}

export function createPermalink(remoteUrl: string, commitHash: string, filePath: string, startLine: number, endLine: number): string {
	filePath = filePath.replace(/\\/g, '/');
	let url = remoteUrl.replace(/\.git$/, '');

	if (url.startsWith('git@')) {
		url = 'https://' + url.substring(4).replace(':', '/');
	}

	if (url.includes('github.com') || url.includes('gitlab.com')) {
		let link = `${url}/blob/${commitHash}/${filePath}`;
		if (startLine) {
			link += `#L${startLine}`;
			if (endLine && endLine !== startLine) {
				link += `-L${endLine}`;
			}
		}
		return link;
	} else if (url.includes('bitbucket.org')) {
		let link = `${url}/src/${commitHash}/${filePath}`;
		if (startLine) {
			link += `#lines-${startLine}`;
			if (endLine && endLine !== startLine) {
				link += `:${endLine}`;
			}
		}
		return link;
	}

	let link = `${url}/blob/${commitHash}/${filePath}`;
	if (startLine) {
		link += `#L${startLine}`;
		if (endLine && endLine !== startLine) {
			link += `-L${endLine}`;
		}
	}
	return link;
}


export function deactivate() { }
