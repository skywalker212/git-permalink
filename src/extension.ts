import * as vscode from 'vscode';
import * as path from 'path';

export async function activate(context: vscode.ExtensionContext) {
	const gitExt = vscode.extensions.getExtension<any>('vscode.git');
	if (!gitExt) {
		console.warn('Git extension not found; permalink disabled.');
		return;
	}

	const git = gitExt.exports.getAPI(1);
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'git-permalink.copyPermalink';
	statusBarItem.text = '$(link) Copy Permalink';
	context.subscriptions.push(statusBarItem);

	let currentRepo: any;

	const updateStatus = () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor || !currentRepo) {
			statusBarItem.hide();
			vscode.commands.executeCommand('setContext', 'git-permalink.isChecked', false);
			return;
		}
		const root = currentRepo.rootUri.fsPath;
		if (!editor.document.uri.fsPath.startsWith(root)) {
			statusBarItem.hide();
			vscode.commands.executeCommand('setContext', 'git-permalink.isChecked', false);
			return;
		}
		vscode.commands.executeCommand('setContext', 'git-permalink.isChecked', true);
		statusBarItem.show();
	};

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(() => {
			const editor = vscode.window.activeTextEditor;
			currentRepo = git.repositories.find((repo: any) =>
				editor && editor.document.uri.fsPath.startsWith(repo.rootUri.fsPath)
			);
			updateStatus();
		})
	);

	context.subscriptions.push(
		git.onDidOpenRepository((repo: any) => {
			currentRepo = repo;
			updateStatus();
		})
	);

	const disposable = vscode.commands.registerCommand('git-permalink.copyPermalink', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor || !currentRepo) {
			vscode.window.showErrorMessage('No Git repository or active editor available.');
			return;
		}

		const start = editor.selection.start.line + 1;
		const end = editor.selection.end.line + 1;
		const relPath = path.relative(currentRepo.rootUri.fsPath, editor.document.uri.fsPath).replace(/\\/g, '/');

		const head = currentRepo.state.HEAD;
		const commit = head?.commit;
		const branch = head?.name;
		const remote = currentRepo.state.remotes[0];
		const url = remote?.pushUrl || remote?.fetchUrl;

		if (!url) {
			vscode.window.showErrorMessage('Could not determine remote URL.');
			return;
		}

		const ref = commit || branch;
		if (!ref) {
			vscode.window.showErrorMessage('Could not determine commit hash or branch name.');
			return;
		}

		const link = createPermalink(url, ref, relPath, start, end);
		await vscode.env.clipboard.writeText(link);
		vscode.window.showInformationMessage('Permalink copied to clipboard!');
	});
	context.subscriptions.push(disposable);

	if (vscode.window.activeTextEditor) {
		currentRepo = git.repositories.find((repo: any) =>
			vscode.window.activeTextEditor!.document.uri.fsPath.startsWith(repo.rootUri.fsPath)
		);
	}
	updateStatus();
}

export function createPermalink(
	remoteUrl: string,
	ref: string,
	filePath: string,
	startLine: number,
	endLine: number
): string {
	let url = remoteUrl.replace(/\.git$/, '');
	if (url.startsWith('git@')) {
		url = 'https://' + url.substring(4).replace(':', '/');
	}

	if (url.includes('bitbucket.org')) {
		let link = `${url}/src/${ref}/${filePath}`;
		if (startLine) {
			link += `#lines-${startLine}`;
			if (endLine && endLine !== startLine) {
				link += `:${endLine}`;
			}
		}
		return link;
	} else {
		let link = `${url}/blob/${ref}/${filePath}`;
		if (startLine) {
			link += `#L${startLine}`;
			if (endLine && endLine !== startLine) {
				link += `-L${endLine}`;
			}
		}
		return link;
	}
}

export function deactivate() { }
