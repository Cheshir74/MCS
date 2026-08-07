import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createRoot } from "react-dom/client";
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    const rootElement = this.element
    if (!rootElement) return

    const UserForm = () => {
      const [isSent, setIsSent] = useState(false)
      const [isSubmitting, setIsSubmitting] = useState(false)
      const [submitError, setSubmitError] = useState("")
      const {
        register,
        formState: { errors }
      } = useForm({
        criteriaMode: "all"
      })

      const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
      const form = useRef(null)

      const submit = async (event) => {
        event.preventDefault()
        setSubmitError("")
        setIsSubmitting(true)

        try {
          const data = new FormData(form.current)
          const response = await fetch("/message", { method: "POST", body: data })

          if (!response.ok) {
            throw new Error("Unable to send the message right now.")
          }

          await response.json()
          setIsSent(true)
        } catch (error) {
          setSubmitError(error.message || "Unable to send the message right now.")
        } finally {
          setIsSubmitting(false)
        }
      }

      if (isSent) {
        return (
          <div className="contact100-success" role="status" aria-live="polite">
            <div className="contact100-success__icon" aria-hidden="true">
              <svg viewBox="0 0 20 20">
                <path d="M5.4 10.1 8.4 13.1 14.7 6.8" />
              </svg>
            </div>
            <div className="contact100-success__copy">
              <h4 className="contact100-success__title">Message sent</h4>
              <p className="contact100-success__body">Thank you. I will reply by email.</p>
            </div>
          </div>
        )
      }

      return (
        <form className="contact100-form" ref={form} onSubmit={submit}>
          <input type="hidden" name="authenticity_token" value={csrfToken} />

          <div className="wrap-input100">
            <input
              {...register("name", { required: true, minLength: 2 })}
              className="input100 true-validate"
              autoComplete="off"
              placeholder="Full Name"
            />
            {errors.name && errors.name.type === "required" && <p>This is required</p>}
            {errors.name && errors.name.type === "minLength" && <p>At least 2 characters</p>}
          </div>

          <div className="wrap-input100 validate-input" data-validate="Please enter email: e@a.x">
            <input
              {...register("email", {
                required: true,
                pattern: {
                  value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                  message: "Please enter a valid email"
                }
              })}
              type="email"
              className="input100"
              autoComplete="off"
              name="email"
              placeholder="Email"
            />
            {errors.email && <p>Please enter a valid email</p>}
          </div>

          <div className="wrap-input100 validate-input" data-validate="Please enter your message">
            <textarea
              {...register("body", { required: true, minLength: 10 })}
              className="input100"
              name="body"
              placeholder="Your Message"
            ></textarea>
            {errors.body && errors.body.type === "required" && <p>This is required</p>}
            {errors.body && errors.body.type === "minLength" && <p>At least 10 characters</p>}
          </div>

          {submitError ? <div className="contact100-submit-error">{submitError}</div> : null}

          <div className="container-contact100-form-btn">
            <button className="contact100-form-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Email"}
            </button>
          </div>
        </form>
      )
    }

    this.root = createRoot(rootElement)
    this.root.render(<UserForm />)
  }

  disconnect() {
    this.root?.unmount()
    this.root = null
  }
}
