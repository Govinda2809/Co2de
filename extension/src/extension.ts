import * as vscode from 'vscode';
import { calculateEnergyMetrics } from './calculator';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
	console.log('CO2DE Extension is now active!');

	// 1. Create Status Bar Item
	statusBarItem = vscode.StatusBarItem.create(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'co2de.analyze';
	context.subscriptions.push(statusBarItem);

	// 2. Register Analysis Command
	let disposable = vscode.commands.registerCommand('co2de.analyze', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const content = document.getText();
			const fileName = document.fileName;
			const fileSize = Buffer.byteLength(content, 'utf8');

			const metrics = calculateEnergyMetrics(fileSize, fileName, content);
			
			vscode.window.showInformationMessage(
				`CO2DE Analysis: ${metrics.estimatedCO2} ${metrics.co2Unit} | Score: ${Math.round(10 - metrics.complexity)}/10`
			);
			
			updateStatusBar(metrics.estimatedCO2);
		}
	});

	context.subscriptions.push(disposable);

	// 3. Update on text change
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

	// Trigger initial update
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
	statusBarItem.tooltip = `Estimated Carbon Footprint for this file`;
	statusBarItem.show();
}

export function deactivate() {}
