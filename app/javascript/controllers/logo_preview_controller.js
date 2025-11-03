import { Controller } from "@hotwired/stimulus"

// Handles inline preview for the primary logo upload
export default class extends Controller {
  static targets = ["input", "preview", "image", "filename", "currentPreview"]

  preview(event) {
    const [file] = event.target.files ?? []

    if (!file) {
      this.reset()
      return
    }

    if (!file.type.startsWith("image/")) {
      this.reset()
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      this.showPreview(reader.result, file.name)
    }
    reader.readAsDataURL(file)
  }

  reset() {
    if (this.hasPreviewTarget) {
      this.previewTarget.hidden = true
    }
    if (this.hasImageTarget) {
      this.imageTarget.src = ""
    }
    if (this.hasFilenameTarget) {
      this.filenameTarget.textContent = ""
    }
    if (this.hasCurrentPreviewTarget) {
      this.currentPreviewTarget.classList.remove("brand-upload__preview--inactive")
    }
    if (this.hasInputTarget) {
      this.inputTarget.value = ""
    }
  }

  showPreview(src, filename) {
    if (this.hasImageTarget) {
      this.imageTarget.src = src
    }

    if (this.hasFilenameTarget) {
      this.filenameTarget.textContent = filename
    }

    if (this.hasPreviewTarget) {
      this.previewTarget.hidden = false
    }

    if (this.hasCurrentPreviewTarget) {
      this.currentPreviewTarget.classList.add("brand-upload__preview--inactive")
    }
  }
}
