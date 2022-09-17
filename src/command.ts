import path = require("path");
import * as vscode from "vscode";
import dedent = require("dedent");

function findLastIndex<T>(
    a: T[],
    predicate: (value: T) => boolean
): number | undefined {
    for (let i = a.length - 1; i >= 0; i--) {
        if (predicate(a[i])) {
            return i;
        }
    }
    return undefined;
}

export function generateHeaderGuard() {
    const editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        return;
    }

    const currentPath = editor.document.fileName;
    const guard = determineHeaderGuard(currentPath).toUpperCase() + "_";

    editor.insertSnippet(
        new vscode.SnippetString(dedent`
            #ifndef \${1:${guard}}
            #define \${1:${guard}}

            \$0

            #endif // \${1:${guard}}
        `)
    );
}

function determineHeaderGuard(currentPath: string): string {
    const parts = currentPath.split(path.sep);
    const stopDirs = vscode.workspace
        .getConfiguration("header-guard-generator")
        .get("stopDirs", ["src", "include"]);
    const stop = findLastIndex(parts, (part) => stopDirs.includes(part));
    if (stop === undefined) {
        return parts[parts.length - 1];
    }
    return parts
        .slice(stop + 1)
        .join("_")
        .replace(/\W/, "_");
}
