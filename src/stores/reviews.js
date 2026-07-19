import { defineStore } from 'pinia'
import { api } from '@/api/client'

export const useReviewsStore = defineStore('reviews', {
  state: () => ({
    items: [],       // одобренные отзывы
    myReview: null,  // отзыв текущего юзера 
    isLoading: false,
    isSubmitting: false,
  }),

  actions: {
    async fetchByOrg(orgId) {
      this.isLoading = true
      try {
        this.items = await api.get(`/reviews/?organization=${orgId}`)
      } finally {
        this.isLoading = false
      }
    },

    async fetchMyReview(orgId) {
      this.myReview = await api.get(`/my-review/?organization=${orgId}`)
    },

    async submit(orgId, rating, text) {
      this.isSubmitting = true
      try {
        await api.post('/submit-review/', { organization: orgId, rating, text })
        await Promise.all([this.fetchByOrg(orgId), this.fetchMyReview(orgId)])
      } finally {
        this.isSubmitting = false
      }
    },
  },
})
