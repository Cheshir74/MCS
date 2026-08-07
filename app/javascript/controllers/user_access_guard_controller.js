import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    self: Boolean,
    lastSuperadmin: Boolean
  }

  static targets = ["superadmin", "supervisor", "warning"]

  connect() {
    this.sync()
  }

  enforce(event) {
    if (!this.selfValue) return

    if (this.lastSuperadminValue && this.hasSuperadminTarget) {
      this.superadminTarget.checked = true
      this.superadminTarget.disabled = true
    }

    if (!this.superadminChecked() && !this.supervisorChecked()) {
      if (event?.currentTarget) {
        event.currentTarget.checked = true
      }
    }

    this.sync()
  }

  sync() {
    if (!this.selfValue || !this.hasWarningTarget) return

    if (this.lastSuperadminValue && this.hasSuperadminTarget) {
      this.superadminTarget.checked = true
      this.superadminTarget.disabled = true
    }

    this.warningTarget.hidden = false
  }

  superadminChecked() {
    return this.hasSuperadminTarget && this.superadminTarget.checked
  }

  supervisorChecked() {
    return this.hasSupervisorTarget && this.supervisorTarget.checked
  }
}
