import { Controller } from "@hotwired/stimulus"
import React from "react"
import ReactDOM from "react-dom/client"
import EmailChangeModal from "../components/EmailChangeModal"

export default class extends Controller {
  connect() {
    this.root = ReactDOM.createRoot(this.element)
    this.sendUrl = this.element.dataset.sendUrl
    this.confirmUrl = this.element.dataset.confirmUrl
    this.currentEmail = this.element.dataset.currentEmail
    this.pendingEmail = this.element.dataset.pendingEmail
    this.render(false)
  }

  open() {
    this.render(true)
  }

  close() {
    this.render(false)
  }

  render(show) {
    this.root.render(
      <EmailChangeModal
        sendUrl={this.sendUrl}
        confirmUrl={this.confirmUrl}
        currentEmail={this.currentEmail}
        pendingEmail={this.pendingEmail}
        show={show}
        onClose={() => this.close()}
      />
    )
  }
}
