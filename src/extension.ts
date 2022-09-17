import * as vscode from "vscode";

import { generateHeaderGuard, updateHeaderGuard } from "./command";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand(
        "header-guard-generator.generateHeaderGuard",
        generateHeaderGuard
    );
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand(
        "header-guard-generator.updateHeaderGuard",
        updateHeaderGuard
    );
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
