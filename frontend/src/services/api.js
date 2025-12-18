const API_BASE_URL = 'https://kturestaurant-api-b0fvgtegandhhhew.germanywestcentral-01.azurewebsites.net/api'

class ApiService {
  constructor() {
    this.token = null
  }

  setToken(token) {
    this.token = token
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, config)
      // Kai kurie endpoint'ai (pvz., DELETE) grąžina 204 No Content,
      // todėl negalima aklai kviesti response.json().
      const text = await response.text()
      let data = null
      if (text) {
        try {
          data = JSON.parse(text)
        } catch {
          // jei ne JSON, paliekam kaip tekstą
          data = text
        }
      }

      if (!response.ok) {
        throw { response: { data, status: response.status } }
      }

      return data
    } catch (error) {
      if (error.response) {
        throw error
      }
      throw { response: { data: { error: 'Network error' }, status: 500 } }
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

const api = new ApiService()
export default api

