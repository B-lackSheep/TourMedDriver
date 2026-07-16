import { api } from '@/api/client'
import { defineStore } from 'pinia'
import { ORG_TYPE_LABELS } from '@/constants/orgTypes'

export const CART_CATEGORY_LABELS = ORG_TYPE_LABELS

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    isLoading: false,
  }),

  getters: {
    groupByCategory(state) {
      return Object.keys(CART_CATEGORY_LABELS).reduce((acc, category) => {
        const categoryItems = state.items.filter((item) => item.category === category)
        if (categoryItems.length) acc[category] = categoryItems
        return acc
      }, {})
    },

    totalAmount(state) {
      return state.items.reduce((sum, item) => sum + item.price * item.qty, 0)
    },

    platformFee() {
      return Math.round(this.totalAmount * 0.1)
    },
  },

  actions: {
    async fetchCart() {
      this.isLoading = true
      try {
        const order = await api.get('/cart/')
        this.items = order.items.map((item) => {
          const org = item.service_details.organization_details
          const service = item.service_details
          return {
            id: item.id,
            category: org?.org_type ?? 'hotel',
            orgName: org?.name ?? 'Организация',
            detail: service.name,
            price: Number(service.price),
            qty: item.qty,
            image: service.image || service.gallery[0]?.image || null,
          }
        })
      } finally {
        this.isLoading = false
      }
    },

    async addItem(serviceId, qty = 1) {
      await api.post('/cart/items/', { service: serviceId, qty })
      await this.fetchCart()
    },

    async removeItem(id) {
      await api.delete(`/cart/items/${id}/`)
      await this.fetchCart()
    },

    async payPlatformFee() {
      const result = await api.post('/cart/pay/', {})
      this.items = []
      return result
    },
  },
})
