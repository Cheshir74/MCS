import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["item"]

  connect() {
    this.markActive()
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
}
