import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["modal", "image", "deleteLink"]

  connect() {
    this.modal = this.hasModalTarget ? this.modalTarget : null
    this.image = this.hasImageTarget ? this.imageTarget : null
    this.deleteLink = this.hasDeleteLinkTarget ? this.deleteLinkTarget : null
    this.boundKeydown = this.handleKeydown.bind(this)
    this.boundBackdropClick = this.handleBackdropClick.bind(this)
    this.boundCloseClick = this.close.bind(this)

    if (this.modal) {
      this.modalPlaceholder = document.createComment("gallery-preview-placeholder")
      this.modal.parentNode.insertBefore(this.modalPlaceholder, this.modal)
      document.body.appendChild(this.modal)
      this.closeButton = this.modal.querySelector(".admin-gallery-preview__control--close")
      this.modal.addEventListener("click", this.boundBackdropClick)
      this.closeButton?.addEventListener("click", this.boundCloseClick)
    }

    window.addEventListener("keydown", this.boundKeydown)
  }

  disconnect() {
    window.removeEventListener("keydown", this.boundKeydown)
    this.modal?.removeEventListener("click", this.boundBackdropClick)
    this.closeButton?.removeEventListener("click", this.boundCloseClick)
    this.clearCloseTimer()
    document.body.classList.remove("admin-gallery-preview-open")

    if (this.modal && this.modalPlaceholder?.parentNode) {
      this.modal.hidden = true
      this.modal.classList.remove("is-open")
      this.modalPlaceholder.parentNode.insertBefore(this.modal, this.modalPlaceholder)
      this.modalPlaceholder.remove()
    }
  }

  open(event) {
    event.preventDefault()

    const trigger = event.currentTarget
    const src = trigger.dataset.previewUrl || trigger.getAttribute("href")
    const deleteUrl = trigger.dataset.previewDeleteUrl

    if (!src || !this.modal || !this.image) return

    this.clearCloseTimer()
    this.image.src = src
    this.image.alt = trigger.dataset.previewAlt || ""
    if (this.deleteLink) {
      this.deleteLink.href = deleteUrl || "#"
      this.deleteLink.hidden = !deleteUrl
    }
    this.modal.hidden = false
    window.requestAnimationFrame(() => {
      this.modal?.classList.add("is-open")
    })
    document.body.classList.add("admin-gallery-preview-open")
  }

  close() {
    if (!this.modal) return

    this.modal.classList.remove("is-open")
    document.body.classList.remove("admin-gallery-preview-open")
    this.clearCloseTimer()
    this.closeTimer = window.setTimeout(() => {
      this.modal.hidden = true
      if (this.image) {
        this.image.removeAttribute("src")
        this.image.alt = ""
      }
      if (this.deleteLink) {
        this.deleteLink.href = "#"
        this.deleteLink.hidden = true
      }
    }, 140)
  }

  handleBackdropClick(event) {
    if (event.target === this.modal) {
      this.close()
    }
  }

  handleKeydown(event) {
    if (event.key === "Escape" && this.modal && !this.modal.hidden) {
      this.close()
    }
  }

  clearCloseTimer() {
    if (this.closeTimer) {
      window.clearTimeout(this.closeTimer)
      this.closeTimer = null
    }
  }
}
