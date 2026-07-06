import { defineStore } from 'pinia'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    firstName: 'Андрей',
    lastName: 'Пирожин',
    email: 'blablabla@gmail.com',
    gender: 'male',
    age: 20,
    phone: '80295553535',
    country: 'Россия',
    city: 'Уфа',

    isLoading: false,
    isSaving: false,
  }),

  actions: {
    async fetchProfile() {
      this.isLoading = true
      try {
        // гет запрос из бэка Полины на профиль
      } finally {
        this.isLoading = false
      }
    },

    async updateProfile(payload) {
      this.isSaving = true
      try {
        // пут запрос на профиль, тоже полина, с payload
        Object.assign(this, payload)
      } finally {
        this.isSaving = false
      }
    },
  },
})
