import React, { useEffect, useRef, useState } from "react"

const STEP_REQUEST = "request"
const STEP_VERIFY = "verify"

export default function EmailChangeModal({ sendUrl, confirmUrl, currentEmail, pendingEmail, show, onClose }) {
  const [step, setStep] = useState(pendingEmail ? STEP_VERIFY : STEP_REQUEST)
  const [nextEmail, setNextEmail] = useState(pendingEmail || "")
  const [code, setCode] = useState("")
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (show) {
      setStep(pendingEmail ? STEP_VERIFY : STEP_REQUEST)
      setNextEmail(pendingEmail || "")
      setCode("")
      setError(null)
      setSuccess(null)
      setLoading(false)
      document.body.classList.add("modal-open")
    } else {
      document.body.classList.remove("modal-open")
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.classList.remove("modal-open")
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [show, pendingEmail, loading, onClose])

  if (!show) return null

  const csrfToken = document.querySelector("meta[name=csrf-token]")?.content

  const requestCode = async (email) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(sendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Could not send the verification code.")
        return false
      }

      setNextEmail(data.pending_email || email)
      setStep(STEP_VERIFY)
      setSuccess(data.message || "Verification code sent.")
      return true
    } catch {
      setError("Connection error.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSubmit = async (event) => {
    event.preventDefault()
    await requestCode(nextEmail)
  }

  const handleConfirmSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(confirmUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify({ code })
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Could not confirm the new email.")
        return
      }

      setSuccess(data.message || "Email updated.")
      setCode("")
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        window.location.reload()
      }, 1400)
    } catch {
      setError("Connection error.")
    } finally {
      setLoading(false)
    }
  }

  const handleUseAnotherEmail = () => {
    if (loading) return
    setStep(STEP_REQUEST)
    setCode("")
    setError(null)
    setSuccess(null)
  }

  const handleResend = async () => {
    if (loading) return
    await requestCode(nextEmail)
  }

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onClick={() => !loading && onClose()}>
      <div className="admin-modal__dialog" role="document" onClick={(event) => event.stopPropagation()}>
        <div className="section-card admin-modal__card admin-modal__card--compact admin-email-modal">
          <div className="admin-modal__header">
            <div>
              <h4 className="admin-modal__title">Change email</h4>
              <p className="admin-modal__subtitle">
                {step === STEP_REQUEST
                  ? "New address and code."
                  : "Code from email."}
              </p>
            </div>
            <button type="button" className="admin-modal__close btn-close" aria-label="Close" onClick={() => !loading && onClose()} />
          </div>

          <div className="admin-modal__body admin-email-modal__body">
            {error && <div className="alert alert-danger mb-0">{error}</div>}
            {success && <div className="alert alert-success mb-0">{success}</div>}

            {step === STEP_REQUEST ? (
              <form onSubmit={handleRequestSubmit} className="admin-modal__form admin-email-modal__form">
                <div className="admin-email-modal__grid">
                  <div className="admin-email-modal__field admin-email-modal__field--full">
                    <span className="admin-email-modal__label">Current</span>
                    <div className="admin-email-modal__current">{currentEmail}</div>
                  </div>

                  <label className="admin-email-modal__field admin-email-modal__field--full">
                    <span className="admin-email-modal__label">New</span>
                    <input
                      type="email"
                      className="form-control admin-email-modal__input"
                      value={nextEmail}
                      onChange={(event) => setNextEmail(event.target.value)}
                      required
                      autoComplete="off"
                      placeholder="name@example.com"
                    />
                  </label>
                </div>

                <div className="admin-modal__actions admin-email-modal__actions">
                  <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Sending..." : "Send code"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmSubmit} className="admin-modal__form admin-email-modal__form">
                <div className="admin-email-modal__grid">
                  <div className="admin-email-modal__field admin-email-modal__field--full">
                    <span className="admin-email-modal__label">New email</span>
                    <div className="admin-email-modal__current">{nextEmail}</div>
                  </div>

                  <label className="admin-email-modal__field admin-email-modal__field--full">
                    <span className="admin-email-modal__label">Code</span>
                    <input
                      type="text"
                      className="form-control admin-email-modal__input admin-email-modal__code"
                      value={code}
                      onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="123456"
                    />
                  </label>
                </div>

                <div className="admin-email-modal__footer">
                  <button type="button" className="btn btn-link admin-email-modal__link" onClick={handleUseAnotherEmail} disabled={loading}>
                    Use another email
                  </button>
                  <button type="button" className="btn btn-link admin-email-modal__link" onClick={handleResend} disabled={loading}>
                    Resend code
                  </button>
                </div>

                <div className="admin-modal__actions admin-email-modal__actions">
                  <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Confirming..." : "Confirm email"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
