"use strict";
import * as vscode from "vscode";

function isActive(): boolean {
    return vscode.workspace.getConfiguration("editor", null).get("renderControlCharacters");
}

const lfDecoration = createDecorationType("LF", "after");
const crDecoration = createDecorationType("CR", "before");

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
            const text = activeEditor.document.getText();
            activeEditor.setDecorations(lfDecoration, createDecorations(/\n/g, text, activeEditor));
            activeEditor.setDecorations(crDecoration, createDecorations(/\r/g, text, activeEditor));
        }
    }
}

function createDecorations(regEx: RegExp, text: string, activeEditor: vscode.TextEditor): vscode.Range[] {
    const ranges: vscode.Range[] = [];

    for (let match = regEx.exec(text); match; match = regEx.exec(text)) {
        const position = activeEditor.document.positionAt(match.index);
        ranges.push(new vscode.Range(position, position));
    }

    return ranges;
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
