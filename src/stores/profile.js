import { defineStore } from 'pinia'
import { api } from '@/api/client'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    first_name: '',
    last_name: '',
    email: '',
    gender: 'male',
    age: null,
    phone: '',
    country: '',
    city: '',
    role: null,

    isLoading: false,
    isSaving: false,
  }),

  getters: {
    isAdmin(state) {
      return state.role === 'admin'
    },
  },

  actions: {
    async fetchProfile() {
      this.isLoading = true
      try {
        const data = await api.get('/profile/')
        this.lastName = data.last_name
        this.firstName = data.first_name
        this.email = data.email
        this.gender = data.gender
        this.age = data.age
        this.phone = data.phone
        this.country = data.country
        this.city = data.city
        this.role = data.role
      } finally {
        this.isLoading = false
      }
    },

    async updateProfile(payload) {
      this.isSaving = true
      try {
        const data = await api.patch('/profile/', {
          last_name: payload.lastName,
          first_name: payload.firstName,
          email: payload.email,
          gender: payload.gender,
          age: payload.age,
          phone: payload.phone,
          country: payload.country,
          city: payload.city,
        })
        this.lastName = data.last_name
        this.firstName = data.first_name
        this.email = data.email
        this.gender = data.gender
        this.age = data.age
        this.phone = data.phone
        this.country = data.country
        this.city = data.city
        this.role = data.role
      } finally {
        this.isSaving = false
      }
    },

    _devSetRole(role) {
      this.role = role
    },
  },
})
