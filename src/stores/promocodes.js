import { defineStore } from 'pinia'

export const usePromocodesStore = defineStore('promocodes', {
  state: () => ({
    orders: [
      {
        id: 30556,
        date: '21.06.2023',
        time: '18:34',
        items: [
          {
            category: 'Туроператоры',
            orgName: 'Туроператор Дагестан (1 чел.)',
            serviceName: 'Отель 3 звезды',
            qty: 1,
            price: 200000,
            date: '24.06.2023',
            promocode: '565-0000-12',
            isRedeemed: false,
          },
          {
            category: 'Медицинские центры',
            orgName: 'Клиника "Здоровье" (1 чел.)',
            serviceName: 'Трихоскопия',
            qty: 1,
            price: 5000,
            date: null,
            promocode: null,
            isRedeemed: false,
          },
          {
            category: 'Медицинские центры',
            orgName: 'Клиника "Здоровье" (1 чел.)',
            serviceName: 'Цифровая диагностика',
            qty: 1,
            price: 4000,
            date: '26.06.2023',
            promocode: '565-0000-12',
            isRedeemed: false,
          },
          {
            category: 'Кафе',
            orgName: 'Ресторан "Рестик" (2 чел.)',
            serviceName: 'Пюре с котлеткой',
            qty: 1,
            price: 14000,
            date: '30.06.2023',
            promocode: '565-0000-12',
            isRedeemed: false,
          },
        ],
      },

      {
        id: 63453,
        date: '03.01.2022',
        time: null,
        items: [
          {
            category: 'Медицинские центры',
            orgName: 'Клиника "Здоровье" (1 человек)',
            serviceName: 'ЭКГ',
            qty: 1,
            price: null,
            date: '02.03.2022',
            promocode: '757-0043-37',
            isRedeemed: true,
          },
        ],
      },
    ],

    isLoading: false,
  }),

  getters: {
    sortedOrders(state) {
      const toDate = (order) => {
        const [day, month, year] = order.date.split('.').map(Number)
        return new Date(year, month - 1, day)
      }
      return [...state.orders].sort((a, b) => toDate(b) - toDate(a))
    },

    allPromocodes(state) {
      return state.orders.flatMap((order) => order.items).filter((item) => item.promocode)
    },
  },

  actions: {
    async fetchPromocodes() {
      this.isLoading = true
      try {
        //гет запрос с промокодами из бэка
      } finally {
        this.isLoading = false
      }
    },
  },
})
