import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface DoubleSwitchSettings {
	myDarkModeThemeName: string;
	myLightModeThemeName: string;
}

const NOSWITCH = "Don't switch";

const DEFAULT_SETTINGS: DoubleSwitchSettings = {
	myDarkModeThemeName: NOSWITCH,
	myLightModeThemeName: NOSWITCH
}

export default class DoubleSwitchPlugin extends Plugin {
	settings: DoubleSwitchSettings;
	darkModeBefore = document.body.hasClass("theme-dark");

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new MySettingTab(this.app, this));

		// Core logic of the app
		this.registerEvent(this.app.workspace.on('css-change',
			() => {
				const darkModeNow = document.body.hasClass("theme-dark");
				if (this.darkModeBefore != darkModeNow) {
					this.darkModeBefore = darkModeNow;
					if (darkModeNow) {
						this.setTheme(this.settings.myDarkModeThemeName);
					} else {
						this.setTheme(this.settings.myLightModeThemeName);
					}
				}
			}));

	}

	setTheme(themeName: string) {
		if (themeName !== NOSWITCH) {
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


class MySettingTab extends PluginSettingTab {
	plugin: DoubleSwitchPlugin;
	DEFAULT_THEME_KEY = "";
	DEFAULT_THEME_TEXT = "Default";

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
				dropdown.addOption(NOSWITCH, NOSWITCH)
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
				dropdown.addOption(NOSWITCH, NOSWITCH)
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
