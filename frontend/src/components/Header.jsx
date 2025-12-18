import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UtensilsIcon } from './SvgIcons'
import './Header.css'

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <UtensilsIcon className="logo-svg" width={28} height={28} />
          <span>Restaurant Platform</span>
        </Link>

        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            <i className="fas fa-home"></i>
            <span>Pagrindinis</span>
          </Link>
          
          {isAuthenticated ? (
            <>
              {(user?.role === 'Admin' || user?.role === 'RestaurantOwner') && (
                <Link to="/dashboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <i className="fas fa-tachometer-alt"></i>
                  <span>Valdymas</span>
                </Link>
              )}
              <div className="user-info">
                <i className="fas fa-user"></i>
                <span>{user?.username}</span>
                {user?.role === 'Admin' && (
                  <span className="badge badge-admin">Admin</span>
                )}
                {user?.role === 'RestaurantOwner' && (
                  <span className="badge badge-owner">Savininkas</span>
                )}
                {user?.role === 'User' && (
                  <span className="badge badge-user">User</span>
                )}
              </div>
              <button className="btn-logout" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Atsijungti</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-sign-in-alt"></i>
              <span>Prisijungti</span>
            </Link>
          )}
        </nav>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
          <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>
    </header>
  )
}

export default Header

