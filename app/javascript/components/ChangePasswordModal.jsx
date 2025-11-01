import React, { useEffect, useRef, useState } from "react";

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
        <div className="section-card admin-modal__card admin-modal__card--compact">
          <div className="admin-modal__header">
            <div>
              <h4 className="admin-modal__title">Сменить пароль</h4>
              <p className="admin-modal__subtitle">Введите текущий пароль и новый, чтобы обновить учетные данные</p>
            </div>
            <button type="button" className="admin-modal__close btn-close" aria-label="Закрыть" onClick={onClose}></button>
          </div>
          <div className="admin-modal__body">
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            {success && <div className="alert alert-success mb-3">{success}</div>}

            <form onSubmit={handleSubmit} className="admin-modal__form">
              <div className="input-card input-card--mini">
                <h5 className="input-card__title">Текущий пароль</h5>
                <p className="input-card__hint">Укажите пароль, который используется сейчас</p>
                <input
                  type="password"
                  className="form-control input-card__control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="input-card input-card--mini">
                <h5 className="input-card__title">Новый пароль</h5>
                <p className="input-card__hint">Минимум 8 символов, используйте буквы и цифры</p>
                <input
                  type="password"
                  className="form-control input-card__control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="input-card input-card--mini">
                <h5 className="input-card__title">Подтверждение</h5>
                <p className="input-card__hint">Повторно введите новый пароль для подтверждения</p>
                <input
                  type="password"
                  className="form-control input-card__control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="admin-modal__actions">
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
