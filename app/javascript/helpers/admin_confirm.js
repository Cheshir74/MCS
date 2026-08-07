import { Turbo } from "@hotwired/turbo-rails"

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(", ")

const DELETE_ICON = `
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M7.2 4.1h5.6"></path>
    <path d="M3.8 5.7h12.4"></path>
    <path d="M6.3 6.1v7.2c0 .98.8 1.78 1.78 1.78h3.84c.98 0 1.78-.8 1.78-1.78V6.1"></path>
    <path d="M8.6 8.3v4.1"></path>
    <path d="M11.4 8.3v4.1"></path>
  </svg>
`

let activeDialogCloser = null

Turbo.setConfirmMethod((message, element, submitter) => {
  if (!document.body.classList.contains("admin-layout")) {
    return Promise.resolve(window.confirm(message))
  }

  return openAdminConfirm({ message, element, submitter })
})

function openAdminConfirm({ message, element, submitter }) {
  if (activeDialogCloser) {
    activeDialogCloser(false)
    activeDialogCloser = null
  }

  return new Promise((resolve) => {
    const destructive = isDestructiveAction(element, submitter, message)
    const previousFocus = document.activeElement
    const backdrop = document.createElement("div")
    const eyebrow = destructive ? "Delete" : "Confirm"
    const title = destructive ? "Delete this item?" : "Continue with this action?"
    const confirmLabel = destructive ? "Delete" : "Continue"

    backdrop.className = "admin-modal-backdrop admin-confirm-backdrop"
    backdrop.setAttribute("role", "dialog")
    backdrop.setAttribute("aria-modal", "true")
    backdrop.setAttribute("aria-labelledby", "admin-confirm-title")
    backdrop.innerHTML = `
      <div class="admin-modal__dialog admin-confirm__dialog" role="document">
        <div class="section-card admin-modal__card admin-confirm__card">
          <button type="button" class="admin-modal__close admin-confirm__close btn-close" data-admin-confirm-close aria-label="Close"></button>
          <div class="admin-confirm__hero">
            <div class="admin-confirm__icon" aria-hidden="true">${DELETE_ICON}</div>
            <div class="admin-confirm__copy">
              <p class="admin-confirm__eyebrow">${eyebrow}</p>
              <h4 class="admin-modal__title admin-confirm__title" id="admin-confirm-title">${title}</h4>
              <p class="admin-confirm__message"></p>
            </div>
          </div>
          <div class="admin-modal__actions admin-confirm__actions">
            <button type="button" class="btn btn-outline-secondary" data-admin-confirm-cancel>Cancel</button>
            <button type="button" class="btn admin-confirm__confirm" data-admin-confirm-confirm>${confirmLabel}</button>
          </div>
        </div>
      </div>
    `

    const messageNode = backdrop.querySelector(".admin-confirm__message")
    const cancelButton = backdrop.querySelector("[data-admin-confirm-cancel]")
    const closeButton = backdrop.querySelector("[data-admin-confirm-close]")
    const confirmButton = backdrop.querySelector("[data-admin-confirm-confirm]")
    let settled = false

    if (messageNode) {
      messageNode.textContent = message
    }

    const finish = (result) => {
      if (settled) return
      settled = true
      activeDialogCloser = null

      backdrop.classList.remove("is-open")
      document.body.classList.remove("modal-open")
      window.removeEventListener("keydown", handleKeydown)
      backdrop.removeEventListener("click", handleBackdropClick)
      cancelButton?.removeEventListener("click", handleCancel)
      closeButton?.removeEventListener("click", handleCancel)
      confirmButton?.removeEventListener("click", handleConfirm)

      window.setTimeout(() => {
        backdrop.remove()
        if (previousFocus && typeof previousFocus.focus === "function") {
          previousFocus.focus()
        }
        resolve(result)
      }, 160)
    }

    const handleCancel = () => finish(false)
    const handleConfirm = () => finish(true)

    const handleBackdropClick = (event) => {
      if (event.target === backdrop) {
        handleCancel()
      }
    }

    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault()
        handleCancel()
        return
      }

      if (event.key === "Tab") {
        trapFocus(event, backdrop)
      }
    }

    activeDialogCloser = finish
    document.body.appendChild(backdrop)
    document.body.classList.add("modal-open")

    backdrop.addEventListener("click", handleBackdropClick)
    cancelButton?.addEventListener("click", handleCancel)
    closeButton?.addEventListener("click", handleCancel)
    confirmButton?.addEventListener("click", handleConfirm)
    window.addEventListener("keydown", handleKeydown)

    window.requestAnimationFrame(() => {
      backdrop.classList.add("is-open")
      confirmButton?.focus()
    })
  })
}

function isDestructiveAction(element, submitter, message) {
  const candidates = [
    submitter?.dataset?.turboMethod,
    submitter?.getAttribute?.("formmethod"),
    element?.dataset?.turboMethod,
    element?.getAttribute?.("method")
  ]

  return candidates.some((value) => typeof value === "string" && value.toLowerCase() === "delete") ||
    /remove|delete|permanent/i.test(message)
}

function trapFocus(event, container) {
  const focusableElements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter((node) => !node.hasAttribute("hidden"))

  if (focusableElements.length === 0) return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}
