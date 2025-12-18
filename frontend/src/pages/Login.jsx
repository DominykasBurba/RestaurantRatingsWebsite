import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const { login, register, isAuthenticated } = useAuth()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const validateForm = () => {
    if (isLoginMode) {
      if (!formData.username || !formData.password) {
        setError('Prašome užpildyti visus laukus')
        return false
      }
    } else {
      if (!formData.email || !formData.username || !formData.password) {
        setError('Prašome užpildyti visus laukus')
        return false
      }
      if (formData.password.length < 6) {
        setError('Slaptažodis turi būti bent 6 simbolių')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Slaptažodžiai nesutampa')
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      let result
      if (isLoginMode) {
        result = await login(formData.username, formData.password)
      } else {
        result = await register(formData.email, formData.username, formData.password)
      }

      if (result.success) {
        setSuccessModalOpen(true)
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Įvyko klaida. Bandykite dar kartą.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>
            <i className={`fas ${isLoginMode ? 'fa-sign-in-alt' : 'fa-user-plus'}`}></i>
            {isLoginMode ? 'Prisijungti' : 'Registruotis'}
          </h1>
          <p>
            {isLoginMode 
              ? 'Prisijunkite prie savo paskyros' 
              : 'Sukurkite naują paskyrą'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i>
                El. paštas
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vardas@example.com"
                required={!isLoginMode}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">
              <i className="fas fa-user"></i>
              Vartotojo vardas
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Įveskite vartotojo vardą"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i>
              Slaptažodis
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Įveskite slaptažodį"
              required
            />
          </div>

          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <i className="fas fa-lock"></i>
                Patvirtinti slaptažodį
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Pakartokite slaptažodį"
                required={!isLoginMode}
              />
            </div>
          )}

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Apdorojama...
              </>
            ) : (
              <>
                <i className={`fas ${isLoginMode ? 'fa-sign-in-alt' : 'fa-user-plus'}`}></i>
                {isLoginMode ? 'Prisijungti' : 'Registruotis'}
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            className="toggle-mode"
            onClick={() => {
              setIsLoginMode(!isLoginMode)
              setError('')
              setFormData({
                email: '',
                username: '',
                password: '',
                confirmPassword: ''
              })
            }}
          >
            {isLoginMode ? (
              <>
                Neturite paskyros? <strong>Registruotis</strong>
              </>
            ) : (
              <>
                Jau turite paskyrą? <strong>Prisijungti</strong>
              </>
            )}
          </button>
        </div>
      </div>

      <Modal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Sėkmė!"
      >
        <div className="success-content">
          <i className="fas fa-check-circle"></i>
          <p>
            {isLoginMode 
              ? 'Sėkmingai prisijungėte!' 
              : 'Paskyra sėkmingai sukurta!'}
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default Login

