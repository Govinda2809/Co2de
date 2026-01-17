import * as vscode from 'vscode';
import { calculateEnergyMetrics } from './calculator';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
	console.log('CO2DE Extension is now active!');

	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'co2de.analyze';
	context.subscriptions.push(statusBarItem);

	let disposable = vscode.commands.registerCommand('co2de.analyze', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const content = document.getText();
			const fileName = document.fileName;
			const fileSize = Buffer.byteLength(content, 'utf8');

			const metrics = calculateEnergyMetrics(fileSize, fileName, content);
			
			const message = `[CO2DE] Protocol Audit: 
- Carbon Footprint: ${metrics.estimatedCO2}g CO2e
- Energy Draw: ${metrics.estimatedEnergy} kWh
- Structural Complexity: O(${metrics.complexity.toFixed(2)})
- Recursion: ${metrics.recursionDetected ? 'ALERT: High Intensity' : 'None detected'}`;

			vscode.window.showInformationMessage(message, "View Dashboard").then(selection => {
				if (selection === "View Dashboard") {
					vscode.env.openExternal(vscode.Uri.parse("http://localhost:3000/analyze"));
				}
			});
			
			updateStatusBar(metrics.estimatedCO2);
		} else {
			vscode.window.showWarningMessage("Please open a source file to analyze CO2 footprint.");
		}
	});

	context.subscriptions.push(disposable);

	vscode.workspace.onDidChangeTextDocument(e => {
		if (vscode.window.activeTextEditor && e.document === vscode.window.activeTextEditor.document) {
			const content = e.document.getText();
			const metrics = calculateEnergyMetrics(
				Buffer.byteLength(content, 'utf8'),
				e.document.fileName,
				content
			);
			updateStatusBar(metrics.estimatedCO2);
		}
	});

	if (vscode.window.activeTextEditor) {
		const doc = vscode.window.activeTextEditor.document;
		const metrics = calculateEnergyMetrics(
			Buffer.byteLength(doc.getText(), 'utf8'),
			doc.fileName,
			doc.getText()
		);
		updateStatusBar(metrics.estimatedCO2);
	}
}

function updateStatusBar(co2: number) {
	statusBarItem.text = `$(leaf) ${co2}g CO2`;
	statusBarItem.tooltip = `Estimated Carbon Footprint for this file (Updated in Real-time)`;
	statusBarItem.show();
}

export function deactivate() {}
