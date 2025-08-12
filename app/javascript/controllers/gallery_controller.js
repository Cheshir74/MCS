import { Controller } from "@hotwired/stimulus"
import React from "react"
import { createRoot } from "react-dom/client"
import GalleryApp from "../components/GalleryApp"

export default class extends Controller {
  connect() {
    this.container = document.createElement("div")
    this.container.id = "react-gallery-container"
    this.element.appendChild(this.container)

    const node = document.getElementById("app_gallery")
    const apiUrl = node?.getAttribute("data-url-path") + ".json"
    const direction = node?.getAttribute("data-direction") || "column"

    this.root = createRoot(this.container)

    fetch(apiUrl)
      .then(res => {
        if (!res.ok) throw new Error("Ошибка загрузки фото")
        return res.json()
      })
      .then(photos => {
        this.root.render(
          <GalleryApp photos={photos} direction={direction} />
        )
      })
      .catch(e => {
        this.container.innerHTML = `<div class="error">Ошибка: ${e.message}</div>`
      })
  }

  disconnect() {
    if (this.root) this.root.unmount()
    if (this.container) this.container.remove()
  }
}
