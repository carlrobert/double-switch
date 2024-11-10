import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface DoubleSwitchSettings {
	myDarkModeThemeName: string;
	myLightModeThemeName: string;
}

const DEFAULT_SETTINGS: DoubleSwitchSettings = {
	myDarkModeThemeName: 'Blackbird',
	myLightModeThemeName: 'Primary'
}

export default class DoubleSwitchPlugin extends Plugin {
	settings: DoubleSwitchSettings;
	inDarkMode = document.body.hasClass("theme-dark");

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.app.workspace.on("css-change", () => {
			const darkModeNow = document.body.hasClass("theme-dark");
			if (this.inDarkMode != darkModeNow) {
				this.inDarkMode = darkModeNow;
				if (darkModeNow) {
					this.setTheme(this.settings.myDarkModeThemeName);
				} else {
					this.setTheme(this.settings.myLightModeThemeName);
				}
			}
		});

	}

	setTheme(themeName: string) {
		if (themeName !== "Don't switch") {
			//@ts-ignore
			this.app.customCss.setTheme(themeName);
		}
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: DoubleSwitchPlugin;
	DEFAULT_THEME_KEY = "";
	DEFAULT_THEME_TEXT = "Don't switch";

	constructor(app: App, plugin: DoubleSwitchPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(this.containerEl)
			.setName('Theme to use with light mode').setDesc('Pick from installed themes')
			.addDropdown(async dropdown => {
				for (const key of Object.values(this.getThemes())) {
					dropdown.addOption(key, this.getThemeNames(key));
				}
				dropdown.setValue(this.plugin.settings.myLightModeThemeName);
				dropdown.onChange(async (value) => {
					this.plugin.settings.myLightModeThemeName = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(this.containerEl)
			.setName('Theme to use with dark mode').setDesc('Pick from installed themes')
			.addDropdown(async dropdown => {
				for (const key of Object.values(this.getThemes())) {
					dropdown.addOption(key, this.getThemeNames(key));
				}
				dropdown.setValue(this.plugin.settings.myDarkModeThemeName);
				dropdown.onChange(async (value) => {
					this.plugin.settings.myDarkModeThemeName = value;
					await this.plugin.saveSettings();
				});
			});

	}

	getThemes(): any[] {
		//@ts-ignore
		return [this.DEFAULT_THEME_KEY, ...Object.keys(this.app.customCss.themes), ...this.app.customCss.oldThemes];
	}

	getThemeNames(item: any): string {
		if (item === this.DEFAULT_THEME_KEY) {
			return this.DEFAULT_THEME_TEXT;
		} else {
			return item;
		}
	}


}
