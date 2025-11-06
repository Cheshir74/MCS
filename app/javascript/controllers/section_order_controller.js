import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "item", "list"]

  connect() {
    this.syncFromInput()
    this.setupDragHandlers()
    this.enableDragAndDrop()
  }

  disconnect() {
    this.disableDragAndDrop()
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

  setupDragHandlers() {
    if (this.dragHandlers) return
    this.dragHandlers = {
      start: this.handleDragStart.bind(this),
      over: this.handleDragOver.bind(this),
      enter: this.handleDragEnter.bind(this),
      leave: this.handleDragLeave.bind(this),
      drop: this.handleDrop.bind(this),
      end: this.handleDragEnd.bind(this)
    }
  }

  enableDragAndDrop() {
    if (!this.hasItemTarget) return
    this.itemTargets.forEach((item) => {
      item.setAttribute("draggable", "true")
      item.classList.add("section-order-item--draggable")
      item.addEventListener("dragstart", this.dragHandlers.start)
      item.addEventListener("dragenter", this.dragHandlers.enter)
      item.addEventListener("dragover", this.dragHandlers.over)
      item.addEventListener("dragleave", this.dragHandlers.leave)
      item.addEventListener("drop", this.dragHandlers.drop)
      item.addEventListener("dragend", this.dragHandlers.end)
    })
  }

  disableDragAndDrop() {
    if (!this.dragHandlers || !this.hasItemTarget) return
    this.itemTargets.forEach((item) => {
      item.removeAttribute("draggable")
      item.classList.remove("section-order-item--draggable", "is-dragging", "is-drop-target")
      item.removeEventListener("dragstart", this.dragHandlers.start)
      item.removeEventListener("dragenter", this.dragHandlers.enter)
      item.removeEventListener("dragover", this.dragHandlers.over)
      item.removeEventListener("dragleave", this.dragHandlers.leave)
      item.removeEventListener("drop", this.dragHandlers.drop)
      item.removeEventListener("dragend", this.dragHandlers.end)
    })
  }

  handleDragStart(event) {
    this.draggedItem = event.currentTarget
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", this.draggedItem.dataset.key || "")
    this.draggedItem.classList.add("is-dragging")
    requestAnimationFrame(() => {
      this.draggedItem?.classList.add("is-dragging-active")
    })
  }

  handleDragEnter(event) {
    const target = this.validDropTarget(event.currentTarget)
    if (!target || target === this.draggedItem) return
    target.classList.add("is-drop-target")
  }

  handleDragOver(event) {
    const target = this.validDropTarget(event.currentTarget)
    if (!target) return
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    if (!this.draggedItem || target === this.draggedItem) return

    const bounding = target.getBoundingClientRect()
    const offset = event.clientY - (bounding.top + bounding.height / 2)

    if (offset > 0) {
      this.listTarget.insertBefore(this.draggedItem, target.nextSibling)
    } else {
      this.listTarget.insertBefore(this.draggedItem, target)
    }
  }

  handleDragLeave(event) {
    const target = this.validDropTarget(event.currentTarget)
    if (!target) return
    target.classList.remove("is-drop-target")
  }

  handleDrop(event) {
    event.preventDefault()
    const target = this.validDropTarget(event.currentTarget)
    if (!target) return
    target.classList.remove("is-drop-target")
    this.updateInput()
  }

  handleDragEnd() {
    if (this.draggedItem) {
      this.draggedItem.classList.remove("is-dragging", "is-dragging-active")
    }
    this.clearDropTargets()
    this.draggedItem = null
    this.updateInput()
  }

  validDropTarget(element) {
    if (!element) return null
    return element.matches("[data-section-order-target='item']") ? element : element.closest("[data-section-order-target='item']")
  }

  clearDropTargets() {
    this.itemTargets.forEach((item) => item.classList.remove("is-drop-target"))
  }
}
