import * as vscode from 'vscode';
import { promisify } from 'util';
import { spawnSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { exec } from 'child_process';

const execAsync = promisify(exec);

export function activate(context: vscode.ExtensionContext) {
    console.log('Vue One-Click extension is active.');

    // Create a status bar item and add it to the status bar
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBarItem.text = "$(rocket) Vue One-Click";
    statusBarItem.tooltip = "Create Vue Project";
    statusBarItem.command = 'vueOneClick.install';
    statusBarItem.show();

    context.subscriptions.push(statusBarItem);

    // Register a command to be executed when the status bar item is clicked
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
                return; // The user canceled the input.
            }

            if (os.platform() === 'win32') {
                // Execute Windows-specific commands
                if (await installVueCLIWindows()) {
                    if (await createVueProjectWindows(projectFolderName)) {
                        vscode.window.showInformationMessage(`Vue.js project '${projectFolderName}' has been created.`);
                    }
                }
            } else if (os.platform() === 'linux') {
                // Execute Linux-specific commands
                if (await installVueCLILinux()) {
                    if (await createVueProjectLinux(projectFolderName)) {
                        vscode.window.showInformationMessage(`Vue.js project '${projectFolderName}' has been created.`);
                    }
                }
            } else {
                vscode.window.showErrorMessage('Unsupported platform. This extension supports Windows and Linux only.');
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

async function installVueCLIWindows(): Promise<boolean> {
    try {
        vscode.window.showInformationMessage('Vue CLI is being installed on Windows.');
        // Execute Windows-specific npm installation command
        const { stdout, stderr } = await execAsync('npm install -g @vue/cli');
        if (stderr) {
            throw new Error(stderr);
        }
        vscode.window.showInformationMessage('Vue CLI has been installed on Windows successfully.');
        return true;
    } catch (error: any) {
        vscode.window.showErrorMessage('Error installing Vue CLI on Windows via npm: ' + error.message);
        return false;
    }
}

async function createVueProjectWindows(projectFolderName: string): Promise<boolean> {
    const projectFolderPath = path.join(vscode.workspace.rootPath || '', projectFolderName);

    try {
        vscode.window.showInformationMessage('Creating Vue.js project on Windows...');
        // Execute Windows-specific Vue project creation command
        const { stdout, stderr } = await execAsync(`vue create --preset default ${projectFolderName}`, {
            cwd: vscode.workspace.rootPath
        });
        if (stderr) {
            throw new Error(stderr);
        }
        return true;
    } catch (error: any) {
        vscode.window.showErrorMessage('Error creating the Vue.js project on Windows: ' + error.message);
        return false;
    }
}

async function installVueCLILinux(): Promise<boolean> {
    try {
        vscode.window.showInformationMessage('Vue CLI is being installed on Linux.');
        // Execute Linux-specific command with sudo-prompt
        const { stdout, stderr } = await execAsync('npm install -g @vue/cli');
        if (stderr) {
            throw new Error(stderr);
        }
        vscode.window.showInformationMessage('Vue CLI has been installed on Linux successfully.');
        return true;
    } catch (error: any) {
        vscode.window.showErrorMessage('Error installing Vue CLI on Linux via npm: ' + error.message);
        return false;
    }
}

async function createVueProjectLinux(projectFolderName: string): Promise<boolean> {
    const projectFolderPath = path.join(vscode.workspace.rootPath || '', projectFolderName);

    try {
        vscode.window.showInformationMessage('Creating Vue.js project on Linux...');
        // Execute Linux-specific Vue project creation command with sudo-prompt
        const { stdout, stderr } = await execAsync(`vue create --preset default ${projectFolderName}`, {
            cwd: vscode.workspace.rootPath
        });
        if (stderr) {
            throw new Error(stderr);
        }
        return true;
    } catch (error: any) {
        vscode.window.showErrorMessage('Error creating the Vue.js project on Linux: ' + error.message);
        return false;
    }
}
