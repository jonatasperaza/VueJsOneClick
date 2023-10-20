import * as vscode from 'vscode';
import axios, { AxiosResponse } from 'axios';

interface W3CValidationMessage {
    type: string;
    subType: string;
    lastLine: number;
    lastColumn: number;
    message: string;
}

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('extension.validateHTML', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'html') {
            vscode.window.showErrorMessage('Please open an HTML document.');
            return;
        }

        const document = editor.document;
        const text = document.getText();

        try {
            const response: AxiosResponse<{ messages: W3CValidationMessage[] }> = await axios.post(
                'https://validator.w3.org/nu/',
                text,
                {
                    headers: {
                        'Content-Type': 'text/html; charset=utf-8',
                    },
                }
            );

            console.log('W3C API Response:', response.data); // Adicionando log da resposta

            if (response.data && response.data.messages) {
                if (response.data.messages.length === 0) {
                    vscode.window.showInformationMessage('HTML is valid according to W3C validation.');
                } else {
                    vscode.window.showErrorMessage(`HTML contains validation errors according to W3C validation. Errors: ${response.data.messages.length}`);
                }
            } else {
                vscode.window.showErrorMessage('Unable to determine validation result. No messages found.');
            }
        } catch (error: any) {
            console.error('Error while validating HTML:', error); // Adicionando log de erro
            vscode.window.showErrorMessage('Error while validating HTML: ' + error.message);
        }
    });

    context.subscriptions.push(disposable);
}
