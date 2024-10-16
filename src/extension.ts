import * as vscode from 'vscode';

function formatIncludes(document: vscode.TextDocument): string {
	let newText = "";
	let includesSTD: string[] = [];
	let includesLIB: string[] = [];
	let processedLine = 0;
	for(; processedLine < document.lineCount; processedLine++) {
		let line = document.lineAt(processedLine);
		if (line.text.startsWith("#include") && line.text.endsWith(">")) {
			includesSTD.push(line.text);
		} else if (line.text.startsWith("#include")) {
			includesLIB.push(line.text);
		} else if (line.isEmptyOrWhitespace) {
			continue;
		} else {
			break;
		}
	}
	includesSTD.sort();
	includesLIB.sort();
	for (let j = 0; j < includesSTD.length; j++) {
		newText += includesSTD[j] + "\n";
	}
	newText += "\n";
	for (let j = 0; j < includesLIB.length; j++) {
		newText += includesLIB[j] + "\n";
	}
	newText += "\n\n";

	for(; processedLine < document.lineCount; processedLine++) {
		if (processedLine !== document.lineCount - 1) {
			newText += document.lineAt(processedLine).text + "\n";
		} else {
			newText += document.lineAt(processedLine).text;
		}
	}

	return newText;
}

function fromatElseIf(text: string): string {
	let indexOfElse = 0;
	while (text.indexOf("else", indexOfElse) !== -1) {
		indexOfElse = text.indexOf("else", indexOfElse);
		let indexOfBracket = indexOfElse;
		while (text[indexOfBracket] !== '}') {
			indexOfBracket--;
		}
		let space = indexOfElse - indexOfBracket;
		text = text.slice(0, indexOfBracket + 1) + " " + text.slice(indexOfElse);
		indexOfElse = indexOfBracket + 5;
	}
	return text;
}

function formatBracket(text: string): string {
	text = text.replaceAll(/ *\{/g, ' {');
	text = text.replaceAll(/if *\(/g, 'if (');
	text = text.replaceAll(/else if *\(/g, 'else if (');
	return text;
}

function formatDocument(document: vscode.TextDocument): string {
	let newText = formatIncludes(document);

	newText = fromatElseIf(newText);
	newText = formatBracket(newText);
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
