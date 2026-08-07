import React, { useEffect, useRef, useState } from "react"

export default function ChangePasswordModal({ url, show, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (show) {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setError(null)
      setSuccess(null)
      document.body.classList.add("modal-open")
    } else {
      document.body.classList.remove("modal-open")
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
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
  }, [show, onClose])

  if (!show) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword
        })
      })

      const data = await response.json()
      if (response.ok) {
        setSuccess(data.message || "Пароль успешно изменен")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null
          onClose()
        }, 1200)
      } else {
        setError(data.error || "Не удалось изменить пароль")
      }
    } catch {
      setError("Ошибка соединения")
    }
  }

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="admin-modal__dialog" role="document" onClick={(event) => event.stopPropagation()}>
        <div className="section-card admin-modal__card admin-modal__card--compact admin-password-modal">
          <div className="admin-modal__header">
            <div>
              <h4 className="admin-modal__title">Сменить пароль</h4>
              <p className="admin-modal__subtitle">Текущий и новый пароль.</p>
            </div>
            <button type="button" className="admin-modal__close btn-close" aria-label="Закрыть" onClick={onClose}></button>
          </div>
          <div className="admin-modal__body admin-password-modal__body">
            {error && <div className="alert alert-danger mb-0">{error}</div>}
            {success && <div className="alert alert-success mb-0">{success}</div>}

            <form onSubmit={handleSubmit} className="admin-modal__form admin-password-modal__form">
              <div className="admin-password-modal__grid">
                <label className="admin-password-modal__field admin-password-modal__field--full">
                  <span className="admin-password-modal__label">Текущий</span>
                  <input
                    type="password"
                    className="form-control admin-password-modal__input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Текущий пароль"
                  />
                </label>

                <label className="admin-password-modal__field">
                  <span className="admin-password-modal__label">Новый</span>
                  <input
                    type="password"
                    className="form-control admin-password-modal__input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Новый пароль"
                  />
                </label>

                <label className="admin-password-modal__field">
                  <span className="admin-password-modal__label">Повтор</span>
                  <input
                    type="password"
                    className="form-control admin-password-modal__input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Повторите пароль"
                  />
                </label>
              </div>

              <div className="admin-modal__actions admin-password-modal__actions">
                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Отмена</button>
                <button type="submit" className="btn btn-primary">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
