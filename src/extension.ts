import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	
	const disposable = vscode.commands.registerCommand('labwork3.helloWorld', () => {
		
		vscode.window.showInformationMessage('Hello World from labwork3!');
	});

	context.subscriptions.push(disposable);
}
