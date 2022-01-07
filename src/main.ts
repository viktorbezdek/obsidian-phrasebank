import {
	Editor,
	EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, Plugin, TFile
} from "obsidian"
import { phrases } from "./phraseList"
import PhraseMarkdownPostProcessor from "./PhrasePostProcessor"
import {
	DEFAULT_SETTINGS,
	PhrasePluginSettings,
	PhrasePluginSettingTab
} from "./settings"

export default class PhraseShortcodesPlugin extends Plugin {
  settings: PhrasePluginSettings

  async onload() {
    await this.loadSettings()
    this.addSettingTab(new PhrasePluginSettingTab(this.app, this))
    this.registerEditorSuggest(new PhraseSuggester(this))

    this.registerMarkdownPostProcessor(PhraseMarkdownPostProcessor.processor)
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}

class PhraseSuggester extends EditorSuggest<string> {
  plugin: PhraseShortcodesPlugin

  constructor(plugin: PhraseShortcodesPlugin) {
    super(plugin.app)
    this.plugin = plugin
  }

  onTrigger(
    cursor: EditorPosition,
    editor: Editor,
    _: TFile
  ): EditorSuggestTriggerInfo | null {
    if (this.plugin.settings.suggester) {
      const sub = editor.getLine(cursor.line).substring(0, cursor.ch)
      const match = sub.match(/:\S+$/)?.first()
      if (match) {
        return {
          end: cursor,
          start: {
            ch: sub.lastIndexOf(match),
            line: cursor.line,
          },
          query: match,
        }
      }
    }
    return null
  }

  getSuggestions(context: EditorSuggestContext): string[] {
    let Phrase_query = context.query.replace(":", "")
    return Object.keys(phrases).filter(p => p.includes(Phrase_query))
  }

  renderSuggestion(suggestion: string, el: HTMLElement): void {
    const outer = el.createDiv({ cls: "ES-suggester-container" })
    outer
      .createDiv({ cls: "ES-shortcode" })
      .setText(suggestion.replace(/:/g, ""))
    //@ts-expect-error
    outer.createDiv({ cls: "ES-Phrase" }).setText(phrases[suggestion])
  }

  selectSuggestion(suggestion: string): void {
    if (this.context) {
      ;(this.context.editor as Editor).replaceRange(
        this.plugin.settings.immediateReplace
          ? phrases[suggestion]
          : `${suggestion} `,
        this.context.start,
        this.context.end
      )
    }
  }
}
