import path = require("path");
import * as vscode from "vscode";
import dedent = require("dedent");

declare global {
    interface Array<T> {
        findLastIndex(predicate: (value: T) => boolean): number | undefined;
    }
}

Array.prototype.findLastIndex = function (predicate: (value: any) => boolean) {
    for (let i = this.length - 1; i >= 0; i--) {
        if (predicate(this[i])) {
            return i;
        }
    }
    return undefined;
};

class HeaderGuard {
    constructor(
        public first: vscode.Range,
        public second: vscode.Range,
        public third: vscode.Range,
        public wasAnsiStyle: boolean
    ) {}
}

export function generateHeaderGuard() {
    const editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        return;
    }

    const currentPath = editor.document.fileName;
    const enableTrailingUnderscore = vscode.workspace
        .getConfiguration("header-guard-generator")
        .get("enableTrailingUnderscore", true);
    const guard = determineHeaderGuard(currentPath).toUpperCase() + (enableTrailingUnderscore ? "_" : "");

    const snip = dedent(`
        #ifndef \${1:${guard}}
        #define \${1:${guard}}

        \$0

        #endif // \${1:${guard}}
    `);

    editor.insertSnippet(new vscode.SnippetString(snip));
}

export function updateHeaderGuard() {
    const editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        return;
    }

    const currentPath = editor.document.fileName;
    const enableTrailingUnderscore = vscode.workspace
        .getConfiguration("header-guard-generator")
        .get("enableTrailingUnderscore", true);
    const guard = determineHeaderGuard(currentPath).toUpperCase() + (enableTrailingUnderscore ? "_" : "");

    const existingHeaderGuard = findExistingHeaderGuard(editor.document);
    if (existingHeaderGuard === undefined) {
        vscode.window.showErrorMessage("No header guard found");
        return;
    }

    editor.edit((editBuilder) => {
        editBuilder.replace(existingHeaderGuard.first, `#ifndef ${guard}`);
        editBuilder.replace(existingHeaderGuard.second, `#define ${guard}`);
        if (existingHeaderGuard.wasAnsiStyle) {
            editBuilder.replace(
                existingHeaderGuard.third,
                `#endif /* ${guard} */`
            );
        } else {
            editBuilder.replace(
                existingHeaderGuard.third,
                `#endif // ${guard}`
            );
        }
    });
}

function determineHeaderGuard(currentPath: string): string {
    const parts = currentPath.split(path.sep);
    const stopDirs = vscode.workspace
        .getConfiguration("header-guard-generator")
        .get("stopDirs", ["src", "include"]);
    const stop = parts.findLastIndex((part) => stopDirs.includes(part));
    const name =
        stop === undefined
            ? parts[parts.length - 1]
            : parts.slice(stop + 1).join("_");
    return name.replaceAll(/\W/g, "_");
}

function findExistingHeaderGuard(
    document: vscode.TextDocument
): HeaderGuard | undefined {
    // find all #ifndef in the document
    let ifndefs: {
        lineNumber: number;
        range: vscode.Range;
        match: RegExpMatchArray;
    }[] = [];
    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        const match = line.text.match(/^#ifndef\s+(.*)/);
        if (match !== null) {
            ifndefs.push({ lineNumber: i, range: line.range, match });
        }
    }
    // check if there is a #define for each #ifndef
    let guard: HeaderGuard | undefined = undefined;
    for (const ifndef of ifndefs) {
        const define = document.lineAt(ifndef.lineNumber + 1);
        const definePat = new RegExp(`^#define\\s+${ifndef.match[1]}`);
        if (!define.text.match(definePat)) {
            continue;
        }

        // find the matching endif
        let endif: vscode.Range | undefined = undefined;
        let wasAnsiStyle = false;
        for (let i = ifndef.lineNumber + 2; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const pat = new RegExp(
                `^#endif\\s*(//|/\\*)\\s*${ifndef.match[1]}\\s*(?:\\*/)?$`
            );
            const match = line.text.match(pat);
            if (match !== null) {
                if (match[1] === "/*") {
                    wasAnsiStyle = true;
                }
                endif = line.range;
                break;
            }
        }
        if (endif !== undefined) {
            guard = new HeaderGuard(
                ifndef.range,
                define.range,
                endif,
                wasAnsiStyle
            );
            break;
        }
    }

    return guard;
}
