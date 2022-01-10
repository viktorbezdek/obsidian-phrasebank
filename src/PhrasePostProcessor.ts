import { MarkdownPostProcessor } from "obsidian"
import { phrases } from "./phraseList"

export default class PhrasePostProcessor {
  static processor: MarkdownPostProcessor = (el: HTMLElement) => {
    el.innerText
      .match(/[:][^\s:][^ \n:]*[:]/g)
      ?.forEach((e: keyof typeof phrases) =>
        PhrasePostProcessor.replace(e, el)
      )
  }

  static replace(shortcode: any, el: HTMLElement) {
    if (
      typeof el.tagName === "string" &&
      (el.tagName.indexOf("CODE") !== -1 || el.tagName.indexOf("MJX") !== -1)
    ) {
      return false
    }
    if (el.hasChildNodes()) {
      el.childNodes.forEach((child: ChildNode) =>
        this.replace(shortcode, child as HTMLElement)
      )
    } else {
      el.textContent = el.textContent.replace(
        shortcode,
        phrases[shortcode] ?? shortcode
      )
    }
  }
}
