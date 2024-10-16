import * as vscode from 'vscode';

function formatDocument(document: vscode.TextDocument): string {
	let newText = "";

	if (!document.lineAt(document.lineCount - 1).isEmptyOrWhitespace) {
		newText += "\n";
	}

	return newText;
}

export function activate(context: vscode.ExtensionContext) {
	
	const disposable = vscode.commands.registerCommand('labwork3.helloWorld', () => {
		const activeEditor = vscode.window.activeTextEditor;
		if(!activeEditor) {
			vscode.window.showInformationMessage('Editor is not active now');
			return;
		}
		activeEditor.edit((editBuilder)=>{
			const document = activeEditor.document;

			const start = new vscode.Position(0, 0);
			const end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
			const range = new vscode.Range(start, end);
			const newText = formatDocument(document);

			editBuilder.replace(range, newText);
		});
		
		vscode.window.showInformationMessage('Hello World from labwork3!');
	});

	context.subscriptions.push(disposable);
}
