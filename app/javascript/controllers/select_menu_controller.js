import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    if (this.element.tagName !== "SELECT" || this.wrapper) return

    this.boundDocumentClick = this.handleDocumentClick.bind(this)
    this.boundDocumentKeydown = this.handleDocumentKeydown.bind(this)
    this.boundNativeChange = this.syncFromSelect.bind(this)

    this.build()
  }

  disconnect() {
    this.close(false)
    this.removeListeners()

    this.wrapper?.remove()
    this.element.classList.remove("admin-select-menu__native")
    this.element.removeAttribute("tabindex")
    this.element.hidden = false
    this.wrapper = null
    this.trigger = null
    this.triggerLabel = null
    this.chevron = null
    this.panel = null
    this.optionButtons = []
  }

  build() {
    this.wrapper = document.createElement("div")
    this.wrapper.className = "admin-select-menu"

    if (this.element.classList.contains("form-select-sm")) {
      this.wrapper.classList.add("admin-select-menu--compact")
    }

    this.trigger = document.createElement("button")
    this.trigger.type = "button"
    this.trigger.className = "admin-select-menu__trigger"
    this.trigger.setAttribute("aria-haspopup", "listbox")
    this.trigger.setAttribute("aria-expanded", "false")
    this.trigger.addEventListener("click", () => this.toggle())
    this.trigger.addEventListener("keydown", (event) => this.handleTriggerKeydown(event))

    if (this.element.getAttribute("aria-label")) {
      this.trigger.setAttribute("aria-label", this.element.getAttribute("aria-label"))
    }

    this.triggerLabel = document.createElement("span")
    this.triggerLabel.className = "admin-select-menu__label"

    this.chevron = document.createElement("span")
    this.chevron.className = "admin-select-menu__chevron"
    this.chevron.setAttribute("aria-hidden", "true")

    this.trigger.append(this.triggerLabel, this.chevron)

    this.panel = document.createElement("div")
    this.panel.className = "admin-select-menu__panel"
    this.panel.hidden = true
    this.panel.setAttribute("role", "listbox")
    this.panel.addEventListener("keydown", (event) => this.handlePanelKeydown(event))

    const panelId = `${this.element.id || `admin-select-${Math.random().toString(36).slice(2, 8)}`}-panel`
    this.panel.id = panelId
    this.trigger.setAttribute("aria-controls", panelId)

    this.element.insertAdjacentElement("afterend", this.wrapper)
    this.wrapper.append(this.trigger, this.panel)

    this.element.classList.add("admin-select-menu__native")
    this.element.tabIndex = -1
    this.element.hidden = true
    this.element.addEventListener("change", this.boundNativeChange)

    this.renderOptions()
    this.syncFromSelect()

    document.addEventListener("click", this.boundDocumentClick)
    document.addEventListener("keydown", this.boundDocumentKeydown)
  }

  renderOptions() {
    this.panel.innerHTML = ""
    this.optionButtons = []

    Array.from(this.element.options).forEach((option, index) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "admin-select-menu__option"
      button.dataset.index = String(index)
      button.setAttribute("role", "option")
      button.disabled = option.disabled

      const label = document.createElement("span")
      label.className = "admin-select-menu__option-label"
      label.textContent = option.textContent.trim()

      const marker = document.createElement("span")
      marker.className = "admin-select-menu__option-marker"
      marker.setAttribute("aria-hidden", "true")

      button.append(label, marker)
      button.addEventListener("click", () => this.selectIndex(index))

      this.optionButtons.push(button)
      this.panel.append(button)
    })
  }

  syncFromSelect() {
    const selectedOption = this.element.selectedOptions[0] || this.element.options[0]
    this.triggerLabel.textContent = selectedOption?.textContent?.trim() || "Select"
    this.wrapper.classList.toggle("is-placeholder", !this.element.value)
    this.wrapper.classList.toggle("is-disabled", this.element.disabled)
    this.trigger.disabled = this.element.disabled

    this.optionButtons.forEach((button, index) => {
      const active = index === this.element.selectedIndex
      button.classList.toggle("is-selected", active)
      button.setAttribute("aria-selected", String(active))
      button.tabIndex = active ? 0 : -1
    })
  }

  toggle() {
    if (this.element.disabled) return
    this.isOpen ? this.close() : this.open()
  }

  open(focusIndex = this.element.selectedIndex) {
    if (this.element.disabled || this.isOpen) return

    this.isOpen = true
    this.wrapper.classList.add("is-open")
    this.panel.hidden = false
    this.trigger.setAttribute("aria-expanded", "true")

    const targetIndex = this.findEnabledIndex(focusIndex, 1)
    if (targetIndex >= 0) {
      this.focusOption(targetIndex)
    }
  }

  close(returnFocus = true) {
    if (!this.isOpen) return

    this.isOpen = false
    this.wrapper.classList.remove("is-open")
    this.panel.hidden = true
    this.trigger.setAttribute("aria-expanded", "false")

    if (returnFocus) {
      this.trigger.focus()
    }
  }

  selectIndex(index) {
    const option = this.element.options[index]
    if (!option || option.disabled) return

    this.element.selectedIndex = index
    this.syncFromSelect()
    this.element.dispatchEvent(new Event("change", { bubbles: true }))
    this.close()
  }

  focusOption(index) {
    const button = this.optionButtons[index]
    if (!button || button.disabled) return

    this.optionButtons.forEach((optionButton) => {
      optionButton.tabIndex = -1
    })

    button.tabIndex = 0
    button.focus()
    button.scrollIntoView({ block: "nearest" })
  }

  handleTriggerKeydown(event) {
    if (this.element.disabled) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      const nextIndex = this.findEnabledIndex(this.element.selectedIndex + 1, 1)
      this.open(nextIndex >= 0 ? nextIndex : this.element.selectedIndex)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      const previousIndex = this.findEnabledIndex(this.element.selectedIndex - 1, -1)
      this.open(previousIndex >= 0 ? previousIndex : this.element.selectedIndex)
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      this.toggle()
    }
  }

  handlePanelKeydown(event) {
    const currentIndex = Number(event.target.dataset.index)

    if (event.key === "ArrowDown") {
      event.preventDefault()
      const nextIndex = this.findEnabledIndex(currentIndex + 1, 1)
      if (nextIndex >= 0) this.focusOption(nextIndex)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      const previousIndex = this.findEnabledIndex(currentIndex - 1, -1)
      if (previousIndex >= 0) this.focusOption(previousIndex)
    } else if (event.key === "Home") {
      event.preventDefault()
      const firstIndex = this.findEnabledIndex(0, 1)
      if (firstIndex >= 0) this.focusOption(firstIndex)
    } else if (event.key === "End") {
      event.preventDefault()
      const lastIndex = this.findEnabledIndex(this.optionButtons.length - 1, -1)
      if (lastIndex >= 0) this.focusOption(lastIndex)
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      this.selectIndex(currentIndex)
    } else if (event.key === "Tab") {
      this.close(false)
    } else if (event.key === "Escape") {
      event.preventDefault()
      this.close()
    }
  }

  handleDocumentClick(event) {
    if (!this.wrapper.contains(event.target)) {
      this.close(false)
    }
  }

  handleDocumentKeydown(event) {
    if (event.key === "Escape") {
      this.close()
    }
  }

  findEnabledIndex(startIndex, direction) {
    const options = Array.from(this.element.options)
    if (options.length === 0) return -1

    let index = Math.min(Math.max(startIndex, 0), options.length - 1)

    while (index >= 0 && index < options.length) {
      if (!options[index].disabled) return index
      index += direction
    }

    return -1
  }

  removeListeners() {
    this.element.removeEventListener("change", this.boundNativeChange)
    document.removeEventListener("click", this.boundDocumentClick)
    document.removeEventListener("keydown", this.boundDocumentKeydown)
  }
}
