
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
	text = text.replaceAll(/for *\(/g, 'for (');
	text = text.replaceAll(/switch *\(/g, 'switch (');
	return text;
}

function isSubstr(text: string, pattern: string, index: number): boolean {
	if (index + pattern.length <= text.length &&
		text.substring(index, index + pattern.length) === pattern) {
			return true;
		}
	return false;
}

function formatOperators(text: string): string {
	let beginNotFormat = ["//", "/*", "'", '"', "#"];
	let endNotFormat = ["\n", "*/", "'", '"', "\n"];
	let operators = ["<<=", ">>=", "==", "<<", ">>", "<=", ">=", "!=", "+=", "-=", "*=", "/=", "%=",
		"&&", "||", "&", "|", "<", ">", "=", "+", "-", "*", "/", "%", ","];
	let flag = -1;
	for (let i = 0; i < text.length; i++) {
		if(flag !== -1 && isSubstr(text, endNotFormat[flag], i)){
			flag = -1;
			continue;
		}
		for (let j = 0; j < beginNotFormat.length; j++) {
			if (flag === -1 && isSubstr(text, beginNotFormat[j], i)) {
				flag = j;
				break;
			}
		}
		if (flag === -1) {
			if(isSubstr(text, "++", i) || isSubstr(text, "--", i)) {
				i++;
				continue;
			}
			for(let j = 0; j < operators.length; j++) {
				if(isSubstr(text, operators[j], i)) {
					let left = i - 1;
					while (left > 0) {
						if (text[left] !== " ") {
							break;
						}
						left--;
					}
					let right = i + operators[j].length;
					while (right < text.length) {
						if (text[right] !== " ") {
							break;
						}
						right++;
					}
					if(operators[j] === ',') {
						text = text.slice(0, left + 1) + operators[j] + " " + text.slice(right);
					}
					else {
						text = text.slice(0, left + 1) + " " + operators[j] + " " + text.slice(right);
					}
					i = left + operators[j].length + 2;
					break;
				}
			}
		}
	}
	return text;
}

function countSpaces(text: string, index: number): string {
	while(index > 0 && text[index] !== '\n') {
		index--;
	}
	let new_index = index+1;
	while (new_index<text.length && text[new_index] === " ") {
		new_index++;
	}
	index++;
	return text.slice(index, new_index);
}

function formatSemicolon(text: string): string {
	let beginNotFormat = ["//", "/*", "'", '"', "#"];
	let endNotFormat = ["\n", "*/", "'", '"', "\n"];
	let flag = -1;
	for (let i = 0; i < text.length; i++) {
		if(flag < -1 && text[i] === ";") {
			let right = i + 1;
			while (right < text.length) {
				if (text[right] !== " ") {
					break;
				}
				right++;
			}
			text = text.slice(0, i) + "; " + text.slice(right);
			flag++;
			i = i + 2;
			continue;
		}
		if(flag<-1){
			continue;
		}
		if(flag !== -1 && isSubstr(text, endNotFormat[flag], i)){
			flag = -1;
			continue;
		}
		for (let j = 0; j < beginNotFormat.length; j++) {
			if (flag === -1 && isSubstr(text, beginNotFormat[j], i)) {
				flag = j;
				break;
			}
		}
		if (flag === -1) {
			if(isSubstr(text, "for", i)){
				flag = -3;
				continue;
			}
			let pat =  ";\n";
			if(text[i] === ";" && !isSubstr(text, pat, i)) {
				let right = i + 1;
				while (right < text.length) {
					if(text[right] !== " ") {
						break;
					}
					right++;
				}
				let spaces = countSpaces(text, i);
				text = text.slice(0, i) + ";\n" + spaces + text.slice(right);
				i = i+2+spaces.length;
			}
		}
	}

	return text;
}

function formatDocument(document: vscode.TextDocument): string {
	let newText = formatIncludes(document);

	newText = fromatElseIf(newText);
	newText = formatBracket(newText);
	newText = formatOperators(newText);
	newText = formatSemicolon(newText);
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

