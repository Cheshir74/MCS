import { Controller } from "@hotwired/stimulus"

const ALLOWED_TAGS = new Set([
  "A",
  "B",
  "BLOCKQUOTE",
  "BR",
  "CODE",
  "EM",
  "H3",
  "H4",
  "I",
  "LI",
  "OL",
  "P",
  "PRE",
  "S",
  "STRIKE",
  "STRONG",
  "U",
  "UL"
])
const ALLOWED_ATTRIBUTES = {
  A: new Set(["href", "target", "rel"])
}

export default class extends Controller {
  static targets = ["input", "editor"]

  connect() {
    this.syncEditorFromInput()
    this.ensureLinksAttributes()
    this.togglePlaceholder()
  }

  syncEditorFromInput() {
    if (!this.hasEditorTarget || !this.hasInputTarget) return
    const sanitized = this.sanitize(this.inputTarget.value || "")
    if (this.editorTarget.innerHTML !== sanitized) {
      this.editorTarget.innerHTML = sanitized
    }
    this.normalizeCodeBlocks()
    this.ensureLinksAttributes()
    this.inputTarget.value = this.editorTarget.innerHTML
    this.togglePlaceholder()
  }

  onInput() {
    this.sync()
  }

  onPaste(event) {
    event.preventDefault()
    const text = event.clipboardData?.getData("text/plain")
    if (text) {
      if (typeof document.execCommand === "function" && typeof document.queryCommandSupported === "function" && document.queryCommandSupported("insertText")) {
        document.execCommand("insertText", false, text)
      } else {
        this.insertTextFallback(text)
      }
      this.sync()
    }
  }

  format(event) {
    event.preventDefault()
    const command = event.params.command
    if (!command) return
    const value = event.params.value || null
    this.execCommand(command, value)
    this.focusEditor()
  }

  insertLink(event) {
    event.preventDefault()
    this.editorTarget.focus()

    const selection = window.getSelection()
    const urlInput = window.prompt("Введите адрес ссылки", "https://")
    const normalizedUrl = this.normalizeUrl(urlInput)
    if (!normalizedUrl) {
      window.alert("Не удалось распознать адрес ссылки. Попробуйте ещё раз.")
      return
    }

    if (typeof document.execCommand === "function") {
      if (selection && !selection.isCollapsed) {
        document.execCommand("createLink", false, normalizedUrl)
      } else {
        const text = window.prompt("Текст ссылки")
        if (!text) return
        document.execCommand("insertHTML", false, `<a href="${normalizedUrl}">${this.escapeHTML(text)}</a>`)
      }
    } else {
      this.insertLinkFallback(selection, normalizedUrl)
    }

    this.ensureLinksAttributes()
    this.sync()
  }

  applyBlock(event) {
    const value = event.target.value
    if (!value) return
    this.execCommand("formatBlock", value)
    this.focusEditor()
  }

  sync() {
    if (!this.hasEditorTarget || !this.hasInputTarget) return
    this.normalizeInlineStyles()
    this.normalizeCodeBlocks()
    const sanitized = this.sanitize(this.editorTarget.innerHTML)
    if (this.editorTarget.innerHTML !== sanitized) {
      this.editorTarget.innerHTML = sanitized
    }
    this.ensureLinksAttributes()
    this.inputTarget.value = this.editorTarget.innerHTML
    this.togglePlaceholder()
  }

  sanitize(html) {
    const wrapper = document.createElement("div")
    wrapper.innerHTML = html

    wrapper.querySelectorAll("*").forEach((element) => {
      if (!ALLOWED_TAGS.has(element.tagName)) {
        if (element.tagName === "DIV" || element.tagName === "SPAN") {
          element.replaceWith(...element.childNodes)
        } else if (element.tagName === "SCRIPT" || element.tagName === "STYLE") {
          element.remove()
        } else {
          element.replaceWith(...element.childNodes)
        }
        return
      }

      Array.from(element.attributes).forEach((attr) => {
        const permitted = ALLOWED_ATTRIBUTES[element.tagName]
        if (permitted && permitted.has(attr.name)) return
        element.removeAttribute(attr.name)
      })
    })

    return wrapper.innerHTML
  }

  ensureLinksAttributes() {
    if (!this.hasEditorTarget) return
    this.editorTarget.querySelectorAll("a").forEach((anchor) => {
      const safeHref = this.normalizeUrl(anchor.getAttribute("href"))
      if (!safeHref) {
        anchor.replaceWith(...anchor.childNodes)
        return
      }
      anchor.setAttribute("href", safeHref)
      anchor.setAttribute("target", "_blank")
      anchor.setAttribute("rel", "noopener noreferrer")
    })
  }

  togglePlaceholder() {
    if (!this.hasEditorTarget) return
    const isEmpty = this.editorTarget.textContent.trim() === ""
    this.editorTarget.classList.toggle("rich-text__editor--empty", isEmpty)
  }

  normalizeUrl(url) {
    if (!url) return null
    const trimmed = url.trim()
    if (trimmed === "") return null
    if (trimmed.toLowerCase().startsWith("mailto:")) {
      return trimmed
    }

    const withProtocol = trimmed.includes("://") ? trimmed : `https://${trimmed}`

    try {
      const parsed = new URL(withProtocol)
      if (!["http:", "https:"].includes(parsed.protocol)) return null
      return parsed.href
    } catch (e) {
      return null
    }
  }

  escapeHTML(value) {
    const div = document.createElement("div")
    div.textContent = value
    return div.innerHTML
  }

  execCommand(command, value = null) {
    if (command === "formatBlock" && value && !value.startsWith("<")) {
      value = `<${value}>`
    }

    const supportsExec = typeof document.execCommand === "function"
    if (supportsExec) {
      document.execCommand(command, false, value)
    } else {
      this.execFallback(command, value)
    }

    this.sync()
  }

  insertTextFallback(text) {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(document.createTextNode(text))
    range.collapse(false)
  }

  insertLinkFallback(selection, url) {
    const workingSelection = selection || window.getSelection()
    if (!workingSelection || workingSelection.rangeCount === 0) return
    const range = workingSelection.getRangeAt(0)

    let linkText = workingSelection.isCollapsed ? window.prompt("Текст ссылки") : workingSelection.toString()
    if (!linkText) return

    range.deleteContents()
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.textContent = linkText
    range.insertNode(anchor)
    workingSelection.removeAllRanges()
    const newRange = document.createRange()
    newRange.selectNode(anchor)
    workingSelection.addRange(newRange)
  }

  execFallback(command, value) {
    switch (command) {
      case "bold":
      case "italic":
      case "underline":
      case "strikeThrough":
        this.wrapSelectionInline(command)
        break
      case "formatBlock":
        this.wrapSelectionBlock(command, value)
        break
      case "removeFormat":
        this.removeFormatting()
        break
      default:
        break
    }
  }

  wrapSelectionInline(command) {
    const tagMap = {
      bold: "strong",
      italic: "em",
      underline: "u",
      strikeThrough: "s"
    }
    const tag = tagMap[command]
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || !tag) return
    const range = selection.getRangeAt(0)
    if (selection.isCollapsed) return
    const wrapper = document.createElement(tag)
    wrapper.appendChild(range.extractContents())
    range.insertNode(wrapper)
    selection.removeAllRanges()
    const newRange = document.createRange()
    newRange.selectNode(wrapper)
    selection.addRange(newRange)
  }

  wrapSelectionBlock(command, value) {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    if (selection.isCollapsed) return

    let tagName = "p"
    if (command === "formatBlock" && value) {
      tagName = value.replace(/[<>]/g, "")
    }

    const wrapper = document.createElement(tagName)
    wrapper.appendChild(range.extractContents())
    range.insertNode(wrapper)
    selection.removeAllRanges()
    const newRange = document.createRange()
    newRange.selectNode(wrapper)
    selection.addRange(newRange)
  }

  removeFormatting() {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    const fragment = range.cloneContents()
    const div = document.createElement("div")
    div.appendChild(fragment)
    const textContent = div.textContent || ""
    range.deleteContents()
    range.insertNode(document.createTextNode(textContent))
  }

  focusEditor() {
    if (!this.hasEditorTarget) return
    this.editorTarget.focus({ preventScroll: true })
  }

  normalizeInlineStyles() {
    if (!this.hasEditorTarget) return
    this.editorTarget.querySelectorAll("span").forEach((span) => {
      const style = span.getAttribute("style")
      if (!style) {
        span.replaceWith(...span.childNodes)
        return
      }
      const normalized = style.toLowerCase()
      const hasUnderline = normalized.includes("underline")
      const hasStrike = normalized.includes("line-through")

      if (hasUnderline && hasStrike) {
        const underline = document.createElement("u")
        const strike = document.createElement("s")
        strike.innerHTML = span.innerHTML
        underline.appendChild(strike)
        span.replaceWith(underline)
        return
      }

      if (hasUnderline || hasStrike) {
        const replacementTag = hasUnderline ? "u" : "s"
        const replacement = document.createElement(replacementTag)
        replacement.innerHTML = span.innerHTML
        span.replaceWith(replacement)
        return
      }

      span.replaceWith(...span.childNodes)
    })
  }

  normalizeCodeBlocks() {
    if (!this.hasEditorTarget) return
    this.editorTarget.querySelectorAll("pre").forEach((pre) => {
      if (pre.children.length === 1 && pre.firstElementChild?.tagName === "CODE") return
      const code = document.createElement("code")
      code.innerHTML = pre.innerHTML
      pre.innerHTML = ""
      pre.appendChild(code)
    })
  }
}
