import { api } from '@/api/client'
import { defineStore } from 'pinia'
import { getOrganizationsByIds } from '@/api/orgCache'
import { formatDate, formatTime } from '@/utils/date'

export const usePromocodesStore = defineStore('promocodes', {
  state: () => ({
    orders: [],
    isLoading: false,
  }),

  getters: {
    sortedOrders(state) {
      return [...state.orders].sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate))
    },

    allPromocodes(state) {
      return state.orders.flatMap((order) => order.items).filter((item) => item.promocode)
    },
  },

  actions: {
    async fetchPromocodes() {
      this.isLoading = true
      try {
        const rawOrders = await api.get('/purchased/')

        const orgIds = rawOrders.flatMap((order) =>
          order.items.map((i) => i.service_details.organization),
        )
        const orgsMap = await getOrganizationsByIds(orgIds)

        this.orders = rawOrders.map((order) => ({
          id: order.id,
          rawDate: order.created_at,
          date: formatDate(order.created_at),
          time: formatTime(order.created_at),
          items: order.items.map((item) => {
            const org = item.service_details.organization_details
            const service = item.service_details
            return {
              category: org?.org_type ?? 'hotel',
              orgName: org?.name ?? 'Организация',
              serviceName: service.name,
              qty: item.qty,
              price: Number(service.price),
              image: service.image || service.gallery[0]?.image || null,
              date: formatDate(order.created_at),
              promocode: order.promo_code,
              isRedeemed: item.is_redeemed,
            }
          }),
        }))
      } finally {
        this.isLoading = false
      }
    },
  },
})
