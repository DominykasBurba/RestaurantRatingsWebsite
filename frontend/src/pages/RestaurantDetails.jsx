import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import Modal from '../components/Modal'
import { getUserIdFromToken } from '../utils/jwt'
import './RestaurantDetails.css'

const RestaurantDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [restaurant, setRestaurant] = useState(null)
  const [dishes, setDishes] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [dishModalOpen, setDishModalOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState(null)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    restaurantId: null,
    dishId: null
  })
  const [targetType, setTargetType] = useState('restaurant') // 'restaurant' | 'dish'
  const [editReviewOpen, setEditReviewOpen] = useState(false)
  const [editForm, setEditForm] = useState({ id: null, rating: 5, comment: '' })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState(null)

  useEffect(() => {
    fetchRestaurantDetails()
    fetchDishes()
    fetchReviews()
  }, [id])

  const fetchRestaurantDetails = async () => {
    try {
      const data = await api.get(`/restaurants/${id}`)
      setRestaurant(data)
    } catch (err) {
      setError('Nepavyko užkrauti restorano informacijos')
      console.error(err)
    }
  }

  const fetchDishes = async () => {
    try {
      const data = await api.get(`/restaurants/${id}/dishes`)
      setDishes(data)
    } catch (err) {
      console.error('Nepavyko užkrauti patiekalų')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const data = await api.get('/reviews')
      setReviews(data) // saugome visus, kad galėtume skaičiuoti patiekalų reitingus
    } catch (err) {
      console.error('Nepavyko užkrauti atsiliepimų')
    }
  }

  const getRestaurantRating = () => {
    const restReviews = reviews.filter(r => r.restaurantId === parseInt(id))
    if (!restReviews.length) return null
    return restReviews.reduce((sum, r) => sum + r.rating, 0) / restReviews.length
  }

  const getDishRating = (dishId) => {
    const dishReviews = reviews.filter(r => r.dishId === dishId)
    if (!dishReviews.length) return null
    return dishReviews.reduce((sum, r) => sum + r.rating, 0) / dishReviews.length
  }

  const userId = getUserIdFromToken()
  const canModifyReview = (review) => isAuthenticated && userId != null && review.userId === userId

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      const payload =
        targetType === 'dish'
          ? {
              ...reviewForm,
              dishId: reviewForm.dishId ? parseInt(reviewForm.dishId) : null,
              restaurantId: null
            }
          : {
              ...reviewForm,
              restaurantId: parseInt(id),
              dishId: null
            }

      await api.post('/reviews', {
        ...payload
      })
      setReviewModalOpen(false)
      setReviewForm({ rating: 5, comment: '', restaurantId: null, dishId: null })
      setTargetType('restaurant')
      fetchReviews()
    } catch (err) {
      alert(err.response?.data?.error || 'Nepavyko pateikti atsiliepimo')
    }
  }

  const openEditReview = (review) => {
    setEditForm({
      id: review.id,
      rating: review.rating,
      comment: review.comment || ''
    })
    setEditReviewOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/reviews/${editForm.id}`, {
        id: editForm.id,
        rating: parseInt(editForm.rating),
        comment: editForm.comment
      })
      setEditReviewOpen(false)
      setEditForm({ id: null, rating: 5, comment: '' })
      fetchReviews()
    } catch (err) {
      alert(err.response?.data?.error || 'Nepavyko atnaujinti atsiliepimo')
    }
  }

  const confirmDeleteReview = (review) => {
    setReviewToDelete(review)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return
    try {
      await api.delete(`/reviews/${reviewToDelete.id}`)
      setDeleteConfirmOpen(false)
      setReviewToDelete(null)
      fetchReviews()
    } catch (err) {
      alert(err.response?.data?.error || 'Nepavyko ištrinti atsiliepimo')
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Kraunama...</p>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle"></i>
        <p>{error || 'Restoranas nerastas'}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Grįžti į pagrindinį
        </button>
      </div>
    )
  }

  return (
    <div className="restaurant-details">
      <button onClick={() => navigate('/')} className="btn-back">
        <i className="fas fa-arrow-left"></i>
        Grįžti
      </button>

      <div className="restaurant-header">
        <div className="restaurant-header-image">
          <i className="fas fa-store"></i>
        </div>
        <div className="restaurant-header-info">
          <h1>{restaurant.name}</h1>
          <p className="restaurant-address">
            <i className="fas fa-map-marker-alt"></i>
            {restaurant.address || 'Adresas nenurodytas'}
          </p>
          <div className="restaurant-rating-large">
            <i className="fas fa-star"></i>
            <span>{(getRestaurantRating() ?? restaurant.averageRating ?? 0).toFixed(1)}</span>
            <span className="rating-text">/ 5.0</span>
          </div>
        </div>
      </div>

      <div className="restaurant-content">
        <section className="dishes-section">
          <h2>
            <i className="fas fa-utensils"></i>
            Patiekalai
          </h2>
          {dishes.length > 0 ? (
            <div className="dishes-grid">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="dish-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedDish(dish)
                    setDishModalOpen(true)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedDish(dish)
                      setDishModalOpen(true)
                    }
                  }}
                >
                  <div className="dish-icon">
                    <i className="fas fa-drumstick-bite"></i>
                  </div>
                  <h3>{dish.name}</h3>
                  {dish.description && <p>{dish.description}</p>}
                  <div className="dish-rating">
                    <i className="fas fa-star"></i>
                    <span>{(getDishRating(dish.id) ?? 0).toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">Patiekalų nėra</p>
          )}
        </section>

        <section className="reviews-section">
          <div className="reviews-header">
            <h2>
              <i className="fas fa-comments"></i>
              Atsiliepimai
            </h2>
            {isAuthenticated && (
              <button 
                className="btn btn-primary"
                onClick={() => setReviewModalOpen(true)}
              >
                <i className="fas fa-plus"></i>
                Pridėti atsiliepimą
              </button>
            )}
          </div>

          {reviews.filter(r => r.restaurantId === parseInt(id)).length > 0 ? (
            <div className="reviews-list">
              {reviews
                .filter((review) => review.restaurantId === parseInt(id))
                .map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <i 
                          key={i} 
                          className={`fas fa-star ${i < review.rating ? 'filled' : ''}`}
                        ></i>
                      ))}
                    </div>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString('lt-LT')}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="review-comment">{review.comment}</p>
                  )}
                  {canModifyReview(review) && (
                    <div className="review-actions">
                      <button className="btn-icon btn-edit" onClick={() => openEditReview(review)} title="Redaguoti">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => confirmDeleteReview(review)} title="Ištrinti">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">Atsiliepimų nėra</p>
          )}
        </section>
      </div>

      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Pridėti atsiliepimą"
      >
        <form onSubmit={handleReviewSubmit} className="review-form">
          <div className="form-group">
            <label>
              <i className="fas fa-toggle-on"></i>
              Kur paliekate atsiliepimą?
            </label>
            <div className="toggle-row">
              <label className="toggle-option">
                <input
                  type="radio"
                  name="targetType"
                  value="restaurant"
                  checked={targetType === 'restaurant'}
                  onChange={() => {
                    setTargetType('restaurant')
                    setReviewForm({ ...reviewForm, dishId: null })
                  }}
                />
                <span>Restoranui</span>
              </label>
              <label className="toggle-option">
                <input
                  type="radio"
                  name="targetType"
                  value="dish"
                  checked={targetType === 'dish'}
                  onChange={() => setTargetType('dish')}
                />
                <span>Patiekalo</span>
              </label>
            </div>
          </div>

          {targetType === 'dish' && (
            <div className="form-group">
              <label htmlFor="dishId">
                <i className="fas fa-drumstick-bite"></i>
                Pasirinkite patiekalą
              </label>
              <select
                id="dishId"
                value={reviewForm.dishId ?? ''}
                onChange={(e) => setReviewForm({ ...reviewForm, dishId: e.target.value })}
                required
              >
                <option value="">-- Pasirinkite patiekalą --</option>
                {dishes.map((dish) => (
                  <option key={dish.id} value={dish.id}>
                    {dish.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="rating">
              <i className="fas fa-star"></i>
              Įvertinimas
            </label>
            <select
              id="rating"
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
              required
            >
              <option value={1}>1 - Labai blogai</option>
              <option value={2}>2 - Blogai</option>
              <option value={3}>3 - Vidutiniškai</option>
              <option value={4}>4 - Gerai</option>
              <option value={5}>5 - Puikiai</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="comment">
              <i className="fas fa-comment"></i>
              Komentaras
            </label>
            <textarea
              id="comment"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              rows="4"
              placeholder="Parašykite savo atsiliepimą..."
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setReviewModalOpen(false)}>
              Atšaukti
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-check"></i>
              Pateikti
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={dishModalOpen}
        onClose={() => {
          setDishModalOpen(false)
          setSelectedDish(null)
        }}
        title={selectedDish ? `Atsiliepimai: ${selectedDish.name}` : 'Atsiliepimai apie patiekalą'}
      >
        {selectedDish ? (
          (() => {
            const dishReviews = reviews.filter(r => r.dishId === selectedDish.id)
            if (!dishReviews.length) {
              return <p className="empty-message">Šiam patiekalui atsiliepimų nėra</p>
            }
            return (
              <div className="reviews-list">
                {dishReviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`fas fa-star ${i < review.rating ? 'filled' : ''}`}
                          ></i>
                        ))}
                      </div>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString('lt-LT')}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="review-comment">{review.comment}</p>
                    )}
                    {canModifyReview(review) && (
                      <div className="review-actions">
                        <button className="btn-icon btn-edit" onClick={() => openEditReview(review)} title="Redaguoti">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => confirmDeleteReview(review)} title="Ištrinti">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          })()
        ) : (
          <p className="empty-message">Pasirinkite patiekalą</p>
        )}
      </Modal>

      <Modal
        isOpen={editReviewOpen}
        onClose={() => {
          setEditReviewOpen(false)
          setEditForm({ id: null, rating: 5, comment: '' })
        }}
        title="Redaguoti atsiliepimą"
      >
        <form onSubmit={handleEditSubmit} className="review-form">
          <div className="form-group">
            <label htmlFor="editRating">
              <i className="fas fa-star"></i>
              Įvertinimas
            </label>
            <select
              id="editRating"
              value={editForm.rating}
              onChange={(e) => setEditForm({ ...editForm, rating: parseInt(e.target.value) })}
              required
            >
              <option value={1}>1 - Labai blogai</option>
              <option value={2}>2 - Blogai</option>
              <option value={3}>3 - Vidutiniškai</option>
              <option value={4}>4 - Gerai</option>
              <option value={5}>5 - Puikiai</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="editComment">
              <i className="fas fa-comment"></i>
              Komentaras
            </label>
            <textarea
              id="editComment"
              value={editForm.comment}
              onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
              rows="4"
            ></textarea>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setEditReviewOpen(false)}>
              Atšaukti
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-save"></i>
              Išsaugoti
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setReviewToDelete(null)
        }}
        title="Patvirtinti ištrynimą"
      >
        <div className="delete-confirm">
          <p>Ar tikrai norite ištrinti šį atsiliepimą?</p>
          <p className="warning-text">Šis veiksmas negrįžtamas.</p>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setDeleteConfirmOpen(false)
                setReviewToDelete(null)
              }}
            >
              Atšaukti
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDeleteReview}>
              <i className="fas fa-trash"></i>
              Ištrinti
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default RestaurantDetails

