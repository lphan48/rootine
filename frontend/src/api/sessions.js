import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000' })

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const startSession = (type = 'focus') =>
  api.post('/sessions/start', { session_type: type, duration_minutes: type === 'focus' ? 25 : 5 })

export const completeSession = (id) =>
  api.patch(`/sessions/${id}/complete`)