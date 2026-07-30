import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["header", "nav", "toggle", "brandTrigger"]

  connect() {
    this.boundSyncHeader = this.syncHeader.bind(this)
    this.boundHandleEscape = this.handleEscape.bind(this)

    this.syncHeader()
    window.addEventListener("scroll", this.boundSyncHeader, { passive: true })
    window.addEventListener("resize", this.boundSyncHeader)
    document.addEventListener("keydown", this.boundHandleEscape)
  }

  disconnect() {
    window.removeEventListener("scroll", this.boundSyncHeader)
    window.removeEventListener("resize", this.boundSyncHeader)
    document.removeEventListener("keydown", this.boundHandleEscape)
  }

  toggleNav() {
    if (!this.hasNavTarget || !this.hasToggleTarget) return

    const isOpen = this.navTarget.classList.toggle("is-open")
    this.toggleTarget.setAttribute("aria-expanded", String(isOpen))
  }

  closeNav() {
    if (!this.hasNavTarget || !this.hasToggleTarget) return

    this.navTarget.classList.remove("is-open")
    this.toggleTarget.setAttribute("aria-expanded", "false")
  }

  syncHeader() {
    if (!this.hasHeaderTarget) return

    this.headerTarget.classList.toggle("is-scrolled", window.scrollY > 24)

    if (!this.hasBrandTriggerTarget) return

    const triggerY = this.brandTriggerTarget.getBoundingClientRect().top + window.scrollY - this.headerTarget.offsetHeight
    this.headerTarget.classList.toggle("is-brand-visible", window.scrollY >= triggerY)

    if (window.innerWidth > 840) {
      this.closeNav()
    }
  }

  handleEscape(event) {
    if (event.key === "Escape") {
      this.closeNav()
    }
  }
}
