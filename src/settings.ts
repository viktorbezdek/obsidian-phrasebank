import { PluginSettingTab, App, Setting } from "obsidian";
import PhraseShortcodesPlugin from "./main";

export interface PhrasePluginSettings {
	immediateReplace: boolean;
	suggester: boolean;
}

export const DEFAULT_SETTINGS: PhrasePluginSettings = {
	immediateReplace: true,
	suggester: true,
}

export class PhrasePluginSettingTab extends PluginSettingTab {
	plugin: PhraseShortcodesPlugin;

	constructor(app: App, plugin: PhraseShortcodesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Phrasebank Plugin' });

		new Setting(containerEl)
			.setName('Immediate Phrase Replace')
			.setDesc('If this is turned on, Phrase shortcodes will be immediately replaced after typing. Otherwise they are still stored as a shortcode and you only see the Phrase in Preview Mode.')
			.addToggle(cb => {
				cb.setValue(this.plugin.settings.immediateReplace)
					.onChange(async value => {
						this.plugin.settings.immediateReplace = value;
						await this.plugin.saveSettings();
					})
			});

		new Setting(containerEl)
			.setName('Phrase Suggester')
			.setDesc('If this is turned on, a Suggester will appear everytime you type : followed by a letter. This will help you insert Phrases. (Doesn\'t work on mobile yet)')
			.addToggle(cb => {
				cb.setValue(this.plugin.settings.suggester)
					.onChange(async value => {
						this.plugin.settings.suggester = value;
						await this.plugin.saveSettings();
					})
			});

		new Setting(containerEl)
			.setName('Donate')
			.setDesc('If you like this Plugin, consider donating to support continued development:')
			.addButton((bt) => {
				bt.buttonEl.outerHTML = `<a href="https://www.buymeacoffee.com/viktorbezdek"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&slug=viktorbezdek&button_colour=ffd32a&font_colour=1e272e&font_family=Inter&outline_colour=1e272e&coffee_colour=f53b57"></a>`;
			});
	}
}
