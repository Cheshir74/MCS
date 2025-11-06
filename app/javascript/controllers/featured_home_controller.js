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
  }

  syncRadios() {
    this.itemTargets.forEach((item) => {
      const radio = item.querySelector("input[type='radio']")
      if (!radio) return
      radio.checked = item.classList.contains("is-active")
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
