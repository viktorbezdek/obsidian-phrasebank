import {
  Editor,
  EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, Plugin, TFile
} from "obsidian"
import { Key } from "readline"
import { phrases, Phrases } from './phraseList';
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
    let query = context.query.replace(":", "")
    return Object.keys(phrases).filter(p => p.includes(query))
  }

  renderSuggestion(suggestion: string, el: HTMLElement): void {
    const outer = el.createDiv({ cls: "phrasebank-suggester-container" })
    outer
      .createDiv({ cls: "phrasebank-shortcode" })
      .setText(suggestion.replace(/:/g, ""))
    outer.createDiv({ cls: "phrasebank-item" }).setText(phrases[suggestion])
  }

  selectSuggestion(suggestion: keyof Phrases): void {
    if (this.context) {
      const editor: Editor = (this.context.editor as Editor)
      const phrase = phrases[suggestion];
      editor.replaceRange(
        this.plugin.settings.immediateReplace
          ? phrase
          : `${suggestion} `,
        this.context.start,
        this.context.end
      )

      console.log(this.context.start, phrase.indexOf('$1'))
      const { ch, line } = this.context.start

      editor.setCursor({ line, ch: ch + phrase.indexOf('$1') })
      editor.setSelection(
        { line, ch: ch + phrase.indexOf('$1') }, { line, ch: ch + phrase.indexOf('$1') + 2 }
      )
    }

  }
}
