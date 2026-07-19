import { useAuthStore } from '@/stores/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'
const AUTH_PATHS = ['/token/', '/token/refresh/', '/register/']

async function request(path, options = {}, allowRetry = true) {
  const authStore = useAuthStore()
  const isFormData = options.body instanceof FormData

  const headers = { ...options.headers }
  if (!isFormData) headers['Content-Type'] = 'application/json'
  if (authStore.accessToken) headers.Authorization = `Bearer ${authStore.accessToken}`

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (
    response.status === 401 &&
    allowRetry &&
    authStore.refreshToken &&
    !AUTH_PATHS.includes(path)
  ) {
    try {
      await authStore.refresh()
      return request(path, options, false)
    } catch {
      authStore.logout()
    }
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => null)
    throw new Error(
      `API ${options.method ?? 'GET'} ${path} failed: ${response.status} ${errorBody ?? ''}`,
    )
  }

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  postForm: (path, formData) => request(path, { method: 'POST', body: formData }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  patchForm: (path, formData) => request(path, { method: 'PATCH', body: formData }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
