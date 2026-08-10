import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    url: String,
    cover: Boolean
  }

  connect() {
    this.draggedItem = null
    this.orderChanged = false
    this.handleDragStart = this.onDragStart.bind(this)
    this.handleDragOver = this.onDragOver.bind(this)
    this.handleDrop = this.onDrop.bind(this)
    this.handleDragEnd = this.onDragEnd.bind(this)
    this.element.addEventListener("dragover", this.handleDragOver)
    this.element.addEventListener("drop", this.handleDrop)
    this.items.forEach((item) => this.enableItem(item))
    this.updateCoverClass()
  }

  disconnect() {
    this.element.removeEventListener("dragover", this.handleDragOver)
    this.element.removeEventListener("drop", this.handleDrop)
    this.items.forEach((item) => this.disableItem(item))
    this.placeholder?.remove()
    this.indicator?.remove()
    this.element.classList.remove("is-sorting")
  }

  onDragStart(event) {
    if (this.blockedDragTarget(event.target)) {
      event.preventDefault()
      return
    }

    this.draggedItem = event.currentTarget
    this.orderChanged = false
    this.initialOrder = this.serializedOrder()
    this.pendingReferenceItem = this.draggedItem.nextElementSibling
    if (this.staticIndicatorMode) {
      this.indicator = this.createIndicator()
      this.element.appendChild(this.indicator)
      this.positionIndicator(this.pendingReferenceItem)
    } else {
      this.placeholder = this.createPlaceholder(this.draggedItem)
      this.element.insertBefore(this.placeholder, this.draggedItem.nextSibling)
    }
    this.element.classList.add("is-sorting")
    this.draggedItem.classList.add("is-dragging")
    this.updateCoverClass()
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move"
      event.dataTransfer.setData("text/plain", this.draggedItem.dataset.id || "")
    }
    if (!this.staticIndicatorMode) {
      requestAnimationFrame(() => this.draggedItem?.classList.add("is-dragging-hidden"))
    }
  }

  onDragOver(event) {
    if (!this.draggedItem) return

    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move"

    if (this.staticIndicatorMode) {
      const referenceItem = this.columnReferenceItemFor(event.clientX, event.clientY)
      if (referenceItem === this.pendingReferenceItem) return

      this.pendingReferenceItem = referenceItem
      this.positionIndicator(referenceItem)
      this.orderChanged = true
      this.updateCoverClass()
      return
    }

    if (!this.placeholder) return

    const referenceItem = this.referenceItemFor(event.clientX, event.clientY)
    if (referenceItem === this.placeholder?.nextElementSibling) return
    this.element.insertBefore(this.placeholder, referenceItem)
    this.orderChanged = true
    this.updateCoverClass()
  }

  onDrop(event) {
    if (!this.draggedItem) return

    event.preventDefault()
    this.commitDragPosition()
    this.updateCoverClass()
    if (this.shouldPersistOrder()) {
      this.persistOrder()
      this.orderChanged = false
    }
    this.cleanupDrag()
  }

  onDragEnd() {
    if (!this.draggedItem) return

    if (this.staticIndicatorMode) {
      this.cleanupDrag()
      return
    }

    this.commitDragPosition()
    this.updateCoverClass()
    if (this.shouldPersistOrder()) {
      this.persistOrder()
    }
    this.cleanupDrag()
  }

  commitDragPosition() {
    this.draggedItem?.classList.remove("is-dragging-hidden")
    if (this.staticIndicatorMode) {
      this.element.insertBefore(this.draggedItem, this.pendingReferenceItem)
    } else if (this.placeholder?.parentElement) {
      this.element.insertBefore(this.draggedItem, this.placeholder)
    }
  }

  cleanupDrag() {
    this.draggedItem?.classList.remove("is-dragging", "is-dragging-hidden")
    this.placeholder?.remove()
    this.indicator?.remove()
    this.element.classList.remove("is-sorting")
    this.draggedItem = null
    this.placeholder = null
    this.indicator = null
    this.pendingReferenceItem = null
    this.orderChanged = false
    this.initialOrder = null
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

  blockedDragTarget(target) {
    return !target.closest("[data-gallery-sort-handle]")
  }

  referenceItemFor(pointerX, pointerY) {
    const candidates = this.items.filter((item) => item !== this.draggedItem)
    if (candidates.length === 0) return null

    const rows = candidates.reduce((collection, item) => {
      const rect = item.getBoundingClientRect()
      const centerY = rect.top + rect.height / 2
      const row = collection.find((entry) => Math.abs(entry.centerY - centerY) <= Math.min(entry.height, rect.height) / 2)

      if (row) {
        row.items.push({ item, rect })
        row.top = Math.min(row.top, rect.top)
        row.bottom = Math.max(row.bottom, rect.bottom)
        row.height = Math.max(row.height, rect.height)
        row.centerY = row.top + (row.bottom - row.top) / 2
      } else {
        collection.push({
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
          centerY,
          items: [{ item, rect }]
        })
      }

      return collection
    }, []).sort((first, second) => first.top - second.top)

    const firstRow = rows[0]
    const lastRow = rows[rows.length - 1]
    let row = rows.find((entry) => pointerY >= entry.top && pointerY <= entry.bottom)

    if (!row) {
      if (pointerY < firstRow.top) row = firstRow
      else if (pointerY > lastRow.bottom) return null
      else row = rows.find((entry) => pointerY < entry.top) || lastRow
    }

    const rowItems = row.items.sort((first, second) => first.rect.left - second.rect.left)
    const target = rowItems.find(({ rect }) => pointerX < rect.left + rect.width / 2)
    if (target) return target.item

    const rowIndex = rows.indexOf(row)
    const nextRow = rows[rowIndex + 1]
    if (!nextRow) return null

    return nextRow.items.sort((first, second) => first.rect.left - second.rect.left)[0]?.item || null
  }

  columnReferenceItemFor(pointerX, pointerY) {
    const candidates = this.items.filter((item) => item !== this.draggedItem)
    if (candidates.length === 0) return null

    const containingItem = candidates.find((item) => {
      const rect = item.getBoundingClientRect()
      return pointerX >= rect.left && pointerX <= rect.right && pointerY >= rect.top && pointerY <= rect.bottom
    })

    if (containingItem) {
      const rect = containingItem.getBoundingClientRect()
      return pointerY < rect.top + rect.height / 2 ? containingItem : this.nextCandidateAfter(candidates, containingItem)
    }

    const closest = candidates.reduce((best, item) => {
      const rect = item.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distance = (pointerX - centerX) ** 2 + (pointerY - centerY) ** 2

      if (!best || distance < best.distance) return { item, rect, centerY, distance }
      return best
    }, null)

    return pointerY < closest.centerY ? closest.item : this.nextCandidateAfter(candidates, closest.item)
  }

  nextCandidateAfter(candidates, item) {
    return candidates[candidates.indexOf(item) + 1] || null
  }

  serializedOrder() {
    return this.items.map((item) => item.dataset.id).join(",")
  }

  shouldPersistOrder() {
    return this.orderChanged && this.serializedOrder() !== this.initialOrder
  }

  updateCoverClass() {
    if (!this.coverValue) return

    const firstItem = this.currentOrderedItems()[0]
    this.items.forEach((item) => item.classList.remove("admin-gallery-tile--cover"))
    firstItem?.classList.add("admin-gallery-tile--cover")
  }

  currentOrderedItems() {
    if (this.staticIndicatorMode && this.draggedItem) {
      const orderedItems = this.items.filter((item) => item !== this.draggedItem)
      const index = this.pendingReferenceItem ? orderedItems.indexOf(this.pendingReferenceItem) : orderedItems.length
      orderedItems.splice(index >= 0 ? index : orderedItems.length, 0, this.draggedItem)
      return orderedItems
    }

    return Array.from(this.element.children).reduce((orderedItems, child) => {
      if (child === this.placeholder) {
        if (this.draggedItem) orderedItems.push(this.draggedItem)
        return orderedItems
      }

      if (child === this.draggedItem && this.placeholder?.parentElement) return orderedItems
      if (child.dataset.id) orderedItems.push(child)

      return orderedItems
    }, [])
  }

  createPlaceholder(item) {
    const placeholder = document.createElement("div")
    placeholder.className = "admin-gallery-tile admin-gallery-sort-placeholder"
    placeholder.style.minHeight = `${item.getBoundingClientRect().height}px`
    placeholder.setAttribute("aria-hidden", "true")
    return placeholder
  }

  createIndicator() {
    const indicator = document.createElement("div")
    indicator.className = "admin-gallery-sort-indicator"
    indicator.setAttribute("aria-hidden", "true")
    return indicator
  }

  positionIndicator(referenceItem) {
    if (!this.indicator) return

    const candidates = this.items.filter((item) => item !== this.draggedItem)
    const target = referenceItem || candidates[candidates.length - 1]
    if (!target) {
      Object.assign(this.indicator.style, { opacity: "0" })
      return
    }

    const containerRect = this.element.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const placeAfter = !referenceItem
    const top = (placeAfter ? targetRect.bottom : targetRect.top) - containerRect.top + this.element.scrollTop
    const left = targetRect.left - containerRect.left + this.element.scrollLeft

    Object.assign(this.indicator.style, {
      opacity: "1",
      top: `${top}px`,
      left: `${left}px`,
      width: `${targetRect.width}px`
    })
  }

  get staticIndicatorMode() {
    return this.element.classList.contains("admin-gallery-grid--site-preview")
  }

  enableItem(item) {
    item.setAttribute("draggable", "true")
    item.addEventListener("dragstart", this.handleDragStart)
    item.addEventListener("dragend", this.handleDragEnd)
  }

  disableItem(item) {
    item.removeAttribute("draggable")
    item.classList.remove("is-dragging", "is-dragging-hidden")
    item.removeEventListener("dragstart", this.handleDragStart)
    item.removeEventListener("dragend", this.handleDragEnd)
  }

  get items() {
    return Array.from(this.element.querySelectorAll(":scope > [data-id]"))
  }
}
