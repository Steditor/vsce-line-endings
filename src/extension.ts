"use strict";
import * as vscode from "vscode";
import * as fs from "fs";

function isActive(): boolean {
    return vscode.workspace.getConfiguration("editor", null).get("renderControlCharacters");
}

const lfDecoration = createDecorationType("\\n", "after");
const crDecoration = createDecorationType("\\r", "before");

let timeout = null;

export function activate(context: vscode.ExtensionContext) {
    let show = isActive();

    let activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        triggerUpdateDecorations();
    }

    vscode.window.onDidChangeActiveTextEditor((editor) => {
        activeEditor = editor;
        if (editor && show) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument((event) => {
        if (show && activeEditor && event.document === activeEditor.document) {
            event.contentChanges.forEach((change) => {
                if (change.text.indexOf("\n") || change.text.indexOf("\r")) {
                    updateDecorations();
                }
            });
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("editor.renderControlCharacters")) {
            show = isActive();
            if (show) {
                updateDecorations();
            } else {
                deactivate();
            }
        }
    }, null, context.subscriptions);

    function triggerUpdateDecorations() {
        if (timeout) {
            clearTimeout(timeout);
        }
        if (show) {
            timeout = setTimeout(updateDecorations, 500);
        }
    }

    function updateDecorations() {
        if (activeEditor && show) {
            try{
                // Call the function and handle the returned data
                // const content = new Uint8Array(Buffer.from(activeEditor.document.getText(), 'utf8'));
                const docUri = activeEditor.document.uri;
                // Get the file path from the URI
                const filePath = docUri.fsPath;
                // Read the file synchronously as a buffer
                const fileContent = fs.readFileSync(filePath);
                // Convert the buffer to a Uint8Array
                const content = new Uint8Array(fileContent);
                const rangeList10 = [];
                const rangeList13 = [];
                // Loop through the Uint8Array content
                for (let i = 0; i < content.length; i++) {
                    // Check for values 10 (newline) or 13 (carriage return)
                    if (content[i] === 10){
                        let position = activeEditor.document.positionAt(i);
                        let range = new vscode.Range(position, position);
                        rangeList10.push(range);
                    }
                    else if (content[i] === 13) {
                        let position = activeEditor.document.positionAt(i);
                        let range = new vscode.Range(position, position);
                        rangeList13.push(range);
                    }
                }
                activeEditor.setDecorations(lfDecoration, rangeList13);
                activeEditor.setDecorations(crDecoration, rangeList10);
            } catch (err) {
                // console.error("Error reading file:", err);
            }
        }
    }

}

export function deactivate() {
    clearTimeout(timeout);
    vscode.window.visibleTextEditors.forEach(clearDecorations, this);
}

function clearDecorations(editor: vscode.TextEditor) {
    editor.setDecorations(lfDecoration, []);
    editor.setDecorations(crDecoration, []);
}

function createDecorationType(text: string, position: "before" | "after") {
    const darkColor = "rgba(255, 255, 255, 0.4)";
    const lightColor = "rgba(0, 0, 0, 0.4)";

    return vscode.window.createTextEditorDecorationType({
        [position]: {
            border: "1px solid",
            contentText: text,
            margin: "0 0 0 0.3ch",
        },
        dark: {
            [position]: {
                borderColor: darkColor,
                color: darkColor,
            },
        },
        light: {
            [position]: {
                borderColor: lightColor,
                color: lightColor,
            },
        },
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    });
}
