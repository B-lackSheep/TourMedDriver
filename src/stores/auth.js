import { defineStore } from 'pinia'
import { api } from '@/api/client'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },

  actions: {
    async login(username, password) {
      const data = await api.post('/token/', { username, password })
      this.setTokens(data.access, data.refresh)
    },

    async register(payload) {
      // payload: { username, password, email, first_name, last_name, role }
      await api.post('/register/', payload)
      // после успешной регистрации сразу логиним тем же логином/паролем
      await this.login(payload.username, payload.password)
    },

    async refresh() {
      if (!this.refreshToken) throw new Error('Нет refresh-токена')
      const data = await api.post('/token/refresh/', { refresh: this.refreshToken })
      this.setTokens(data.access, this.refreshToken)
      return data.access
    },

    setTokens(access, refresh) {
      this.accessToken = access
      this.refreshToken = refresh
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
    },

    logout() {
      this.accessToken = null
      this.refreshToken = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },

    //временено
    _devLogin() {
      this.accessToken = 'dev-token'
      this.refreshToken = null
    },
  },
})
