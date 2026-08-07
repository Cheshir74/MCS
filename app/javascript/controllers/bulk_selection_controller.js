import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["master", "checkbox", "count", "action", "row", "roleModal", "rolePreset", "roleOption", "roleNote"]

  connect() {
    this.refresh()
    this.boundHandleKeydown = this.handleKeydown.bind(this)
    window.addEventListener("keydown", this.boundHandleKeydown)
  }

  disconnect() {
    window.removeEventListener("keydown", this.boundHandleKeydown)
    document.body.classList.remove("modal-open")
  }

  toggleAll(event) {
    const checked = event.currentTarget.checked
    this.checkboxTargets.forEach((checkbox) => {
      checkbox.checked = checked
    })
    this.refresh()
  }

  toggleOne() {
    this.refresh()
  }

  openRoleModal() {
    if (!this.hasRoleModalTarget || this.selectedCount === 0) return

    this.syncRoleOptions()
    this.roleModalTarget.hidden = false
    document.body.classList.add("modal-open")
  }

  closeRoleModal() {
    if (!this.hasRoleModalTarget) return

    this.roleModalTarget.hidden = true
    document.body.classList.remove("modal-open")
  }

  closeRoleModalOnBackdrop(event) {
    if (event.target === this.roleModalTarget) {
      this.closeRoleModal()
    }
  }

  setRolePreset(event) {
    const preset = event.currentTarget.dataset.rolePreset
    if (!preset || !this.hasRolePresetTarget) return

    this.rolePresetTarget.value = preset
    this.closeRoleModal()
  }

  refresh() {
    const selectedCount = this.checkboxTargets.filter((checkbox) => checkbox.checked).length
    const totalCount = this.checkboxTargets.length
    this.selectedCount = selectedCount

    this.countTargets.forEach((element) => {
      element.textContent = `${selectedCount} selected`
    })

    this.actionTargets.forEach((element) => {
      element.disabled = selectedCount === 0
    })

    if (this.hasMasterTarget) {
      this.masterTarget.checked = totalCount > 0 && selectedCount === totalCount
      this.masterTarget.indeterminate = selectedCount > 0 && selectedCount < totalCount
    }

    this.rowTargets.forEach((row, index) => {
      row.classList.toggle("is-selected", this.checkboxTargets[index]?.checked)
    })

    this.syncRoleOptions()
  }

  handleKeydown(event) {
    if (event.key === "Escape" && this.hasRoleModalTarget && !this.roleModalTarget.hidden) {
      this.closeRoleModal()
    }
  }

  syncRoleOptions() {
    if (!this.hasRoleOptionTarget) return

    const selectedRows = this.rowTargets.filter((row, index) => this.checkboxTargets[index]?.checked)
    const includesCurrentUser = selectedRows.some((row) => row.dataset.currentUser === "true")
    const includesLastSuperadmin = selectedRows.some((row) => row.dataset.lastSuperadmin === "true")

    this.roleOptionTargets.forEach((button) => {
      const preset = button.dataset.rolePreset
      const disabled =
        (preset === "viewer" && (includesCurrentUser || includesLastSuperadmin)) ||
        (preset === "editor" && includesLastSuperadmin)

      button.disabled = disabled
      button.classList.toggle("is-disabled", disabled)
    })

    if (!this.hasRoleNoteTarget) return

    let note = ""
    if (includesLastSuperadmin) {
      note = "The selected set includes the last superadmin. Viewer and Editor are locked."
    } else if (includesCurrentUser) {
      note = "Your account is selected. Viewer is locked for self-protection."
    }

    this.roleNoteTarget.textContent = note
    this.roleNoteTarget.hidden = note.length === 0
  }
}
