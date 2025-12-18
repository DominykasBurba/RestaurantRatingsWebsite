import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Modal from '../components/Modal'
import { StarIcon } from '../components/SvgIcons'
import './Home.css'

const Home = () => {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reviews, setReviews] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [restaurantsData, reviewsData] = await Promise.all([
        api.get('/restaurants'),
        api.get('/reviews')
      ])
      setRestaurants(restaurantsData)
      setReviews(reviewsData)
      setError(null)
    } catch (err) {
      setError('Nepavyko užkrauti restoranų')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getRestaurantRating = (restaurantId) => {
    const restReviews = reviews.filter(r => r.restaurantId === restaurantId)
    if (!restReviews.length) return null
    const avg = restReviews.reduce((sum, r) => sum + r.rating, 0) / restReviews.length
    return avg
  }

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Kraunama...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle"></i>
        <p>{error}</p>
        <button onClick={fetchData} className="btn-retry">
          Bandyti dar kartą
        </button>
      </div>
    )
  }

  return (
    <div className="home">
      <div className="home-hero">
        <h1>
          <i className="fas fa-utensils"></i>
          Sveiki atvykę į Restaurant Platform
        </h1>
        <p>Atraskite geriausius restoranus ir patiekalus</p>
      </div>

      <div className="restaurants-grid">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="restaurant-card">
            <div className="restaurant-image">
              <i className="fas fa-store"></i>
            </div>
            <div className="restaurant-info">
              <h2>{restaurant.name}</h2>
              <p className="restaurant-address">
                <i className="fas fa-map-marker-alt"></i>
                {restaurant.address || 'Adresas nenurodytas'}
              </p>
              <div className="restaurant-rating">
                <StarIcon className="star-icon" width={20} height={20} filled={true} />
                <span>
                  {(() => {
                    const avg = getRestaurantRating(restaurant.id)
                    return avg ? avg.toFixed(1) : '—'
                  })()}
                </span>
              </div>
            </div>
            <div className="restaurant-actions">
              <Link to={`/restaurant/${restaurant.id}`} className="btn btn-primary">
                <i className="fas fa-eye"></i>
                Peržiūrėti
              </Link>
              <button 
                className="btn btn-secondary"
                onClick={() => handleRestaurantClick(restaurant)}
              >
                <i className="fas fa-info-circle"></i>
                Informacija
              </button>
            </div>
          </div>
        ))}
      </div>

      {restaurants.length === 0 && (
        <div className="empty-state">
          <i className="fas fa-inbox"></i>
          <p>Restoranų nerasta</p>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedRestaurant?.name}
      >
        {selectedRestaurant && (
          <div className="restaurant-modal-content">
            <p><strong>Adresas:</strong> {selectedRestaurant.address || 'Nenurodytas'}</p>
            <p>
              <strong>Įvertinimas:</strong>{' '}
              {(() => {
                const avg = getRestaurantRating(selectedRestaurant.id)
                return avg ? avg.toFixed(1) : '—'
              })()}{' '}
              / 5.0
            </p>
            <Link 
              to={`/restaurant/${selectedRestaurant.id}`} 
              className="btn btn-primary"
              onClick={() => setModalOpen(false)}
            >
              Peržiūrėti detaliau
            </Link>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Home

