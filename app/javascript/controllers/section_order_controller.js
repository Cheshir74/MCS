import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "item", "list"]

  connect() {
    this.syncFromInput()
  }

  moveUp(event) {
    event.preventDefault()
    const item = event.currentTarget.closest("[data-section-order-target='item']")
    if (!item) return
    const prev = item.previousElementSibling
    if (prev) {
      this.listTarget.insertBefore(item, prev)
      this.updateInput()
    }
  }

  moveDown(event) {
    event.preventDefault()
    const item = event.currentTarget.closest("[data-section-order-target='item']")
    if (!item) return
    const next = item.nextElementSibling
    if (next) {
      this.listTarget.insertBefore(next, item)
      this.updateInput()
    }
  }

  syncFromInput() {
    if (!this.hasInputTarget) return
    const order = (this.inputTarget.value || "").split(",").map((value) => value.trim()).filter(Boolean)
    const items = Array.from(this.itemTargets)
    order.forEach((key) => {
      const item = items.find((candidate) => candidate.dataset.key === key)
      if (item) {
        this.listTarget.appendChild(item)
      }
    })
    this.updateInput()
  }

  updateInput() {
    if (!this.hasInputTarget) return
    const keys = Array.from(this.listTarget.querySelectorAll("[data-section-order-target='item']")).map(
      (element) => element.dataset.key
    )
    this.inputTarget.value = keys.join(",")
  }
}
