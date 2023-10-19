import * as vscode from 'vscode';
import * as stylelintVSCode from 'stylelint-vscode';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.languages.registerDocumentRangeFormattingEditProvider(
        { language: 'css' },
        {
            provideDocumentRangeFormattingEdits(
                document: vscode.TextDocument,
                range: vscode.Range,
                options: vscode.FormattingOptions,
                token: vscode.CancellationToken
            ): vscode.ProviderResult<vscode.TextEdit[]> {
                const text = document.getText(range);
                const uri = document.uri.fsPath;

                return stylelintVSCode.processText(uri, text, { config: '.stylelintrc' })
                    .then((results: any) => {
                        const edits: vscode.TextEdit[] = [];

                        for (const result of results) {
                            for (const warning of result.warnings) {
                                const startPos = document.positionAt(warning.line - 1, warning.column - 1);
                                const endPos = document.positionAt(warning.line - 1, warning.column);
                                const range = new vscode.Range(startPos, endPos);
                                const newText = ''; // Corrija o erro aqui, se necessário
                                const edit = new vscode.TextEdit(range, newText);
                                edits.push(edit);
                            }
                        }

                        return edits;
                    });
            }
        }
    );

    context.subscriptions.push(disposable);
}
