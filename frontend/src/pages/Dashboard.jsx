import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import Modal from '../components/Modal'
import { getUserIdFromToken } from '../utils/jwt'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState([])
  const [dishes, setDishes] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [formData, setFormData] = useState({})
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [restaurantsData, dishesData, reviewsData] = await Promise.all([
        api.get('/restaurants'),
        api.get('/dishes'),
        api.get('/reviews')
      ])

      setRestaurants(restaurantsData)
      setDishes(dishesData)
      setReviews(reviewsData)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = user?.role === 'Admin'
  const isOwner = user?.role === 'RestaurantOwner'
  const userId = getUserIdFromToken()

  const handleCreateRestaurant = async (e) => {
    e.preventDefault()
    try {
      await api.post('/restaurants', formData)
      setModalOpen(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Klaida')
    }
  }

  const handleCreateDish = async (e) => {
    e.preventDefault()
    try {
      await api.post('/dishes', formData)
      setModalOpen(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Klaida')
    }
  }

  const handleUpdateDish = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/dishes/${formData.id}`, formData)
      setModalOpen(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Klaida')
    }
  }

  const handleUpdateRestaurantStatus = async (restaurantId, status) => {
    try {
      const restaurant = restaurants.find(r => r.id === restaurantId)
      if (!restaurant) return
      
      await api.put(`/restaurants/${restaurantId}`, {
        id: restaurantId,
        name: restaurant.name,
        address: restaurant.address,
        status: status
      })
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Nepavyko atnaujinti')
    }
  }

  const handleUpdateReviewStatus = async (reviewId, status) => {
    try {
      const review = reviews.find(r => r.id === reviewId)
      if (!review) return
      
      await api.put(`/reviews/${reviewId}`, {
        id: reviewId,
        rating: review.rating,
        comment: review.comment,
        status: status
      })
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Nepavyko atnaujinti')
    }
  }

  const openModal = (type, item = null) => {
    setModalType(type)
    if (item) {
      setFormData(item)
    } else {
      setFormData({})
    }
    setModalOpen(true)
  }

  const handleDelete = async (type, id) => {
    try {
      if (type === 'restaurant') {
        await api.delete(`/restaurants/${id}`)
      } else if (type === 'dish') {
        await api.delete(`/dishes/${id}`)
      } else if (type === 'review') {
        await api.delete(`/reviews/${id}`)
      }
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Nepavyko ištrinti')
    }
  }

  const confirmDelete = (type, id, name) => {
    setItemToDelete({ type, id, name })
    setDeleteConfirmOpen(true)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Kraunama...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>
          <i className="fas fa-tachometer-alt"></i>
          Valdymo skydas
        </h1>
        <p>Sveiki, <strong>{user?.username}</strong>!</p>
        <div className="user-badge">
          <span className={`badge badge-${user?.role?.toLowerCase()}`}>
            {user?.role === 'Admin' && 'Administratorius'}
            {user?.role === 'RestaurantOwner' && 'Restorano savininkas'}
            {user?.role === 'User' && 'Naudotojas'}
          </span>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <i className="fas fa-store"></i>
          <div>
            <h3>{restaurants.length}</h3>
            <p>Restoranai</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-utensils"></i>
          <div>
            <h3>{dishes.length}</h3>
            <p>Patiekalai</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-comments"></i>
          <div>
            <h3>{reviews.length}</h3>
            <p>Atsiliepimai</p>
          </div>
        </div>
      </div>

      {(isAdmin || isOwner) && (
        <div className="dashboard-actions">
          <h2>Veiksmai</h2>
          <div className="action-buttons">
            {(isAdmin || isOwner) && (
              <button className="btn btn-primary" onClick={() => openModal('restaurant')}>
                <i className="fas fa-plus"></i>
                Pridėti restoraną
              </button>
            )}
            {(isAdmin || isOwner) && (
              <button className="btn btn-secondary" onClick={() => openModal('dish')}>
                <i className="fas fa-plus"></i>
                Pridėti patiekalą
              </button>
            )}
          </div>
        </div>
      )}

      <div className="dashboard-content">

        <section className="dashboard-section">
          <h2>
            <i className="fas fa-store"></i>
            Restoranai
          </h2>
          <div className="items-grid">
            {restaurants.map((restaurant) => {
              const canDelete = isAdmin || (isOwner && restaurant.ownerId === userId)

              return (
                <div key={restaurant.id} className="item-card">
                  <div className="item-info">
                    <h3>{restaurant.name}</h3>
                    <p>{restaurant.address}</p>
                    <div className="item-rating">
                      <i className="fas fa-star"></i>
                      {restaurant.averageRating.toFixed(1)}
                    </div>
                  </div>
                  <div className="item-actions">
                    {canDelete && (
                      <button
                        className="btn-delete"
                        onClick={() => confirmDelete('restaurant', restaurant.id, restaurant.name)}
                        title="Ištrinti restoraną"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {(isAdmin || isOwner) && (
          <section className="dashboard-section">
            <h2>
              <i className="fas fa-utensils"></i>
              Patiekalai
            </h2>
            <div className="items-list">
              {dishes.map((dish) => {
                const restaurant = restaurants.find(r => r.id === dish.restaurantId)
                const canEdit = isAdmin || (isOwner && restaurant?.ownerId === userId)
                const canDelete = isAdmin || (isOwner && restaurant?.ownerId === userId)
                
                return (
                  <div key={dish.id} className="item-card">
                    <div className="item-info">
                      <h3>{dish.name}</h3>
                      {dish.description && <p>{dish.description}</p>}
                      {restaurant && <p className="dish-restaurant">Restoranas: {restaurant.name}</p>}
                    </div>
                    <div className="item-actions">
                      {canEdit && (
                        <button
                          className="btn-edit"
                          onClick={() => openModal('edit-dish', { ...dish })}
                          title="Redaguoti patiekalą"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn-delete"
                          onClick={() => confirmDelete('dish', dish.id, dish.name)}
                          title="Ištrinti patiekalą"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {isAdmin && (
          <section className="dashboard-section">
            <h2>
              <i className="fas fa-comments"></i>
              Atsiliepimai
            </h2>
            <div className="reviews-list">
              {reviews.map((review) => {
                const statusText = review.status === 0 ? 'Laukia' : review.status === 1 ? 'Patvirtintas' : 'Atmestas'
                
                return (
                  <div key={review.id} className="review-item">
                    <div className="review-content">
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`fas fa-star ${i < review.rating ? 'filled' : ''}`}
                          ></i>
                        ))}
                      </div>
                      {review.comment && <p>{review.comment}</p>}
                      <div className="status-badge">
                        <span className={`status status-${review.status}`}>{statusText}</span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <div className="status-buttons">
                        {review.status !== 1 && (
                          <button
                            className="btn-status btn-approve"
                            onClick={() => handleUpdateReviewStatus(review.id, 1)}
                            title="Patvirtinti"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                      </div>
                      <button
                        className="btn-delete"
                        onClick={() => confirmDelete('review', review.id, 'atsiliepimas')}
                        title="Ištrinti atsiliepimą"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalType === 'restaurant' ? 'Pridėti restoraną' :
          modalType === 'edit-dish' ? 'Redaguoti patiekalą' :
          'Pridėti patiekalą'
        }
      >
        <form onSubmit={
          modalType === 'restaurant' ? handleCreateRestaurant :
          modalType === 'edit-dish' ? handleUpdateDish :
          handleCreateDish
        }>
          {modalType === 'restaurant' ? (
            <>
              <div className="form-group">
                <label>Pavadinimas</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Adresas</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Pavadinimas</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Aprašymas</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Restoranas</label>
                <select
                  value={formData.restaurantId || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, restaurantId: parseInt(e.target.value) })
                  }
                  required
                  disabled={modalType === 'edit-dish'}
                >
                  <option value="">-- Pasirinkite restoraną --</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Atšaukti
            </button>
            <button type="submit" className="btn btn-primary">
              {modalType === 'edit-dish' ? 'Išsaugoti' : 'Sukurti'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setItemToDelete(null)
        }}
        title="Patvirtinti ištrynimą"
      >
        <div className="delete-confirm">
          <p>Ar tikrai norite ištrinti <strong>{itemToDelete?.name}</strong>?</p>
          <p className="warning-text">Šis veiksmas negrįžtamas.</p>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setDeleteConfirmOpen(false)
                setItemToDelete(null)
              }}
            >
              Atšaukti
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleDelete(itemToDelete?.type, itemToDelete?.id)}
            >
              <i className="fas fa-trash"></i>
              Ištrinti
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Dashboard

