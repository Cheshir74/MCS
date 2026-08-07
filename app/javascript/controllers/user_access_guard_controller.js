import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    self: Boolean,
    lastSuperadmin: Boolean
  }

  static targets = [
    "superadmin",
    "supervisor",
    "viewer",
    "warning",
    "superadminState",
    "supervisorState",
    "viewerState",
    "supervisorRow",
    "viewerRow"
  ]

  connect() {
    this.sync()
  }

  enforce(event) {
    if (this.lastSuperadminLocked()) {
      this.superadminTarget.checked = true
    }

    if (this.superadminChecked() && this.hasSupervisorTarget) {
      this.supervisorTarget.checked = true
    }

    if ((this.superadminChecked() || this.supervisorChecked()) && this.hasViewerTarget) {
      this.viewerTarget.checked = true
    }

    if (this.selfValue && !this.superadminChecked() && !this.supervisorChecked()) {
      if (event?.currentTarget) {
        event.currentTarget.checked = true
      }
    }

    this.sync()
  }

  sync() {
    if (this.lastSuperadminLocked()) {
      this.superadminTarget.checked = true
    }

    if (this.superadminChecked() && this.hasSupervisorTarget) {
      this.supervisorTarget.checked = true
    }

    if ((this.superadminChecked() || this.supervisorChecked()) && this.hasViewerTarget) {
      this.viewerTarget.checked = true
    }

    if (this.hasWarningTarget) {
      this.warningTarget.hidden = !this.selfValue
    }

    this.syncInheritedState()
  }

  superadminChecked() {
    return this.hasSuperadminTarget && this.superadminTarget.checked
  }

  supervisorChecked() {
    return this.hasSupervisorTarget && this.supervisorTarget.checked
  }

  lastSuperadminLocked() {
    return this.selfValue && this.lastSuperadminValue && this.hasSuperadminTarget
  }

  syncInheritedState() {
    const superadminInherited = this.lastSuperadminLocked()
    const supervisorInherited = this.superadminChecked()
    const viewerInherited = this.superadminChecked() || this.supervisorChecked()

    if (this.hasSuperadminStateTarget) {
      this.superadminStateTarget.hidden = !superadminInherited
    }

    if (this.hasSupervisorStateTarget) {
      this.supervisorStateTarget.hidden = !supervisorInherited
    }

    if (this.hasViewerStateTarget) {
      this.viewerStateTarget.hidden = !viewerInherited
    }

    if (this.hasSupervisorRowTarget) {
      this.supervisorRowTarget.classList.toggle("is-inherited", supervisorInherited)
    }

    if (this.hasViewerRowTarget) {
      this.viewerRowTarget.classList.toggle("is-inherited", viewerInherited)
    }
  }
}
