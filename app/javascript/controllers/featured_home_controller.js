import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["item", "list"]

  connect() {
    this.markActive()
    this.syncRadios()
    this.listTarget?.addEventListener("mouseenter", this.handleHover.bind(this), true)
    this.listTarget?.addEventListener("mouseleave", this.clearHover.bind(this), true)
  }

  markActive() {
    const items = this.itemTargets
    items.forEach((item) => item.classList.remove("is-active"))

    const activeRadio = this.element.querySelector("input[type='radio']:checked")
    if (!activeRadio) return

    const label = activeRadio.closest("[data-featured-home-target='item']")
    if (label) {
      label.classList.add("is-active")
    }

    this.syncAria()
  }

  select(event) {
    const item = event.currentTarget
    const radio = item.querySelector("input[type='radio']")
    if (!radio || radio.disabled) return

    event.preventDefault()
    this.itemTargets.forEach((target) => {
      const targetRadio = target.querySelector("input[type='radio']")
      if (targetRadio) targetRadio.checked = false
    })
    radio.checked = true
    this.markActive()
  }

  syncRadios() {
    this.itemTargets.forEach((item) => {
      const radio = item.querySelector("input[type='radio']")
      if (!radio) return
      radio.checked = item.classList.contains("is-active")
    })
  }

  syncAria() {
    this.itemTargets.forEach((item) => {
      item.setAttribute("aria-checked", item.classList.contains("is-active") ? "true" : "false")
    })
  }

  handleHover(event) {
    const item = event.target.closest("[data-featured-home-target='item']")
    if (!item) return
    this.itemTargets.forEach((element) => element.classList.remove("is-hover"))
    item.classList.add("is-hover")
  }

  clearHover(event) {
    if (!event.relatedTarget || !this.element.contains(event.relatedTarget)) {
      this.itemTargets.forEach((element) => element.classList.remove("is-hover"))
    }
  }
}
