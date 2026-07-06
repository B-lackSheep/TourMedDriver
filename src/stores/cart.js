import { defineStore } from 'pinia'

export const CART_CATEGORY_LABELS = {
  //как вариант это вынести для реального проекта
  hostels: 'Отели',
  medical: 'Мед. центры',
  restaurants: 'Рестораны/Кафе',
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [
      {
        id: 1,
        category: 'hostels',
        image: "/images/test_img1.png", //путь к фотке из макета
        orgName: 'Отель "Comfortee"',
        detail: 'Стандарт (1 человек)',
        date: '29.06.2026 - 05.07.2026',
        price: 1240,
      },
      {
        id: 2,
        category: 'medical',
        image: null, //путь к фотке из макета
        orgName: 'Медицинский центр "FamilyMed"',
        detail: 'Консультация гастроэнерголога',
        date: '29.06.2026 19:30',
        price: 1500,
      },
      {
        id: 3,
        category: 'restaurants',
        image: null, //путь к фотке из макета
        orgName: 'Ресторан "Устрица"',
        detail: 'Омлет с мидиями, Бонито, Спринг ролл, Чай "Молочный улун"',
        date: '05.07.2026',
        price: 4360,
      },
    ],

    isLoading: false,
  }),

  getters: {
    groupByCategory(state) {
      return Object.keys(CART_CATEGORY_LABELS).reduce((acc, category) => {
        const categoryItems = state.items.filter((item) => item.category === category)

        if (categoryItems.length) {
          acc[category] = categoryItems
        }
        return acc
      }, {})
    },

    totalAmount(state) {
      return state.items.reduce((sum, item) => sum + item.price, 0)
    },

    platformFee() {
      //там в заметках в макете сказано про 10% комиссии платформе
      return Math.round(this.totalAmount * 0.1)
    },
  },

  actions: {
    async fetchCart() {
      this.isLoading = true
      try {
        //гет запрос на корзину от полины
      } finally {
        this.isLoading = false
      }
    },

    removeItem(id) {
      //делит запрос на конкретный товар в корзине на бэк
      this.items = this.items.filter((item) => item.id !== id)
    },

    async payPlatformFee() {
      //пост запрос на бэк с оплатой + при успехе очистка корзины + промо на почту
    },
  },
})
