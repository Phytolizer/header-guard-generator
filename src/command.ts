import path = require("path");
import * as vscode from "vscode";
import dedent = require("dedent");
import { findLastIndex } from "./util";

export function generateHeaderGuard() {
    const editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        return;
    }

    const currentPath = editor.document.fileName;
    const guard = determineHeaderGuard(currentPath).toUpperCase() + "_";

    const snip = dedent(`
            #ifndef \${1:${guard}}
            #define \${1:${guard}}

            \$0

            #endif // \${1:${guard}}
    `);

    editor.insertSnippet(new vscode.SnippetString(snip));
}

function determineHeaderGuard(currentPath: string): string {
    const parts = currentPath.split(path.sep);
    const stopDirs = vscode.workspace
        .getConfiguration("header-guard-generator")
        .get("stopDirs", ["src", "include"]);
    const stop = findLastIndex(parts, (part) => stopDirs.includes(part));
    const name =
        stop === undefined
            ? parts[parts.length - 1]
            : parts.slice(stop + 1).join("_");
    return name.replace(/\W/, "_");
}
