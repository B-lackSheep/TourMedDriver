import { defineStore } from 'pinia'
import { api } from '@/api/client'

export const useOrgAccountStore = defineStore('orgAccount', {
  state: () => ({
    organization: null,
    submission: null,
    isLoading: false,
  }),

  getters: {
    hasPendingSubmission: (state) => state.submission?.status === 'pending',
  },

  actions: {
    async fetchAll() {
      this.isLoading = true
      try {
        const [org, submission] = await Promise.all([
          api.get('/my-organization/'),
          api.get('/my-submission/'),
        ])
        this.organization = org
        this.submission = submission
      } finally {
        this.isLoading = false
      }
    },

    async submit(formData) {
      const created = await api.postForm('/submit-organization/', formData)
      this.submission = created
      return created
    },
  },
})
