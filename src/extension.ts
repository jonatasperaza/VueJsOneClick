import * as vscode from 'vscode';
import { promisify } from 'util';
import { spawnSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const exec = promisify(require('child_process').exec);

export function activate(context: vscode.ExtensionContext) {
    console.log('Vue One-Click extension is active.');

    const disposable = vscode.commands.registerCommand('vueOneClick.install', async () => {
        try {
            if (!isNpmInstalled()) {
                vscode.window.showErrorMessage('npm is not installed. Please install npm to use this extension.');
                return;
            }

            const projectFolderName = await vscode.window.showInputBox({
                prompt: 'Enter the name of the project folder',
                placeHolder: 'my-vue-project',
            });

            if (!projectFolderName) {
                return; // O usuário cancelou a entrada.
            }

            if (await installVueCLI()) {
                if (await createVueProject(projectFolderName)) {
                    vscode.window.showInformationMessage(`Vue.js project '${projectFolderName}' has been created.`);
                }
            }
        } catch (error: any) {
            vscode.window.showErrorMessage('Error: ' + error.message);
        }
    });

    context.subscriptions.push(disposable);
}

function isNpmInstalled(): boolean {
    try {
        const result = spawnSync('npm', ['-v'], {
            shell: true,
        });
        return result.status === 0;
    } catch (error: any) {
        return false;
    }
}

async function installVueCLI(): Promise<boolean> {
    try {
        vscode.window.showInformationMessage('Vue CLI is being installed.');
        await exec('npm install -g @vue/cli');
        vscode.window.showInformationMessage('Vue CLI has been installed successfully.');
        return true;
    } catch (error: any) {
        vscode.window.showErrorMessage('Error installing Vue CLI via npm: ' + error.message);
        return false;
    }
}

async function createVueProject(projectFolderName: string): Promise<boolean> {
    const projectFolderPath = path.join(vscode.workspace.rootPath || '', projectFolderName);
    
    try {
        vscode.window.showInformationMessage('Creating Vue.js project...');
        await exec(`vue create --preset default ${projectFolderName}`, { cwd: vscode.workspace.rootPath });
        return true;
    } catch (error: any) {
        vscode.window.showErrorMessage('Error creating the Vue.js project: ' + error.message);
        return false;
    }
}
