import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    url: String
  }

  connect() {
    this.draggedItem = null
    this.handleDragStart = this.onDragStart.bind(this)
    this.handleDragOver = this.onDragOver.bind(this)
    this.handleDrop = this.onDrop.bind(this)
    this.handleDragEnd = this.onDragEnd.bind(this)
    this.items.forEach((item) => this.enableItem(item))
  }

  disconnect() {
    this.items.forEach((item) => this.disableItem(item))
  }

  onDragStart(event) {
    if (event.target.closest("button, a, label, input")) {
      event.preventDefault()
      return
    }

    this.draggedItem = event.currentTarget
    this.draggedItem.classList.add("is-dragging")
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", this.draggedItem.dataset.id || "")
  }

  onDragOver(event) {
    event.preventDefault()

    const target = event.target.closest("[data-id]")
    if (!target || target === this.draggedItem || target.parentElement !== this.element) return

    const targetRect = target.getBoundingClientRect()
    const targetCenterY = targetRect.top + targetRect.height / 2
    const targetCenterX = targetRect.left + targetRect.width / 2
    const shouldInsertAfter =
      event.clientY > targetCenterY || (Math.abs(event.clientY - targetCenterY) < targetRect.height / 4 && event.clientX > targetCenterX)

    this.element.insertBefore(this.draggedItem, shouldInsertAfter ? target.nextSibling : target)
  }

  onDrop(event) {
    event.preventDefault()
    this.persistOrder()
  }

  onDragEnd() {
    this.draggedItem?.classList.remove("is-dragging")
    this.draggedItem = null
  }

  persistOrder() {
    if (!this.hasUrlValue) return

    const params = new URLSearchParams()
    this.items.forEach((item) => {
      if (item.dataset.id) params.append("images[]", item.dataset.id)
    })

    fetch(this.urlValue, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "X-CSRF-Token": this.csrfToken(),
        "Accept": "text/vnd.turbo-stream.html, text/html, application/xhtml+xml"
      },
      body: params.toString(),
      credentials: "same-origin"
    })
  }

  csrfToken() {
    return document.querySelector("meta[name='csrf-token']")?.content || ""
  }

  enableItem(item) {
    item.setAttribute("draggable", "true")
    item.addEventListener("dragstart", this.handleDragStart)
    item.addEventListener("dragover", this.handleDragOver)
    item.addEventListener("drop", this.handleDrop)
    item.addEventListener("dragend", this.handleDragEnd)
  }

  disableItem(item) {
    item.removeAttribute("draggable")
    item.classList.remove("is-dragging")
    item.removeEventListener("dragstart", this.handleDragStart)
    item.removeEventListener("dragover", this.handleDragOver)
    item.removeEventListener("drop", this.handleDrop)
    item.removeEventListener("dragend", this.handleDragEnd)
  }

  get items() {
    return Array.from(this.element.querySelectorAll(":scope > [data-id]"))
  }
}
