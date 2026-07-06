import { defineStore } from 'pinia'

/* как-нибудь заменить псевдоданные на данные с бэка на 3-ей неделе*/
export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: true,
    user: {
      id: 1,
      firstName: 'Андрей',
      lastName: 'Пирожин',
      email: 'blabla@gmail.com',
      role: 'admin', //проверить organization и user
    },
  }),

  getters: {
    isAdmin(state) {
      return state.user?.role === 'admin'
    },
  },

  actions: {
    async login(/*какие-то данные*/) {
      this.isAuthenticated = true
    },

    logout() {
      this.isAuthenticated = false
      this.user = null
    },
  },
})
