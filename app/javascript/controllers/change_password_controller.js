import { Controller } from "@hotwired/stimulus"
import React from "react"
import ReactDOM from "react-dom/client"
import ChangePasswordModal from "../components/ChangePasswordModal"

export default class extends Controller {
  connect() {
    this.root = ReactDOM.createRoot(this.element)
    this.url = this.element.dataset.url
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
      <ChangePasswordModal url={this.url} show={show} onClose={() => this.close()} />
    )
  }
}
