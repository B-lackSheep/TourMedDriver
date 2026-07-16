<script setup>
import { computed } from 'vue'
import AppLogo from './AppLogo.vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile.js'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const router = useRouter()

const profileLink = computed(() => {
  if (!authStore.isAuthenticated) return '/login'
  if (profileStore.isAdmin) return '/admin'
  if (profileStore.role === 'org') return '/org-office'
  return '/office'
})

function handleLogout() {
  authStore.logout()
  profileStore.$reset()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <AppLogo :size="48" to="/" />

      <nav class="app-header__nav">
        <router-link class="app-header__link" to="/">Каталог</router-link>
        <router-link class="app-header__link" to="/about">О компании</router-link>
        <router-link class="app-header__link" to="/contacts">Контакты</router-link>

        <router-link class="app-header__profile" :to="profileLink" aria-label="Личный кабинет">
          <svg
            width="27"
            height="27"
            viewBox="0 0 27 27"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.13333 20.1333C6.26667 19.2667 7.53333 18.5831 8.93333 18.0827C10.3333 17.5831 11.8 17.3333 13.3333 17.3333C14.8667 17.3333 16.3333 17.5831 17.7333 18.0827C19.1333 18.5831 20.4 19.2667 21.5333 20.1333C22.3111 19.2222 22.9169 18.1889 23.3507 17.0333C23.7836 15.8778 24 14.6444 24 13.3333C24 10.3778 22.9613 7.86089 20.884 5.78267C18.8058 3.70533 16.2889 2.66667 13.3333 2.66667C10.3778 2.66667 7.86133 3.70533 5.784 5.78267C3.70578 7.86089 2.66667 10.3778 2.66667 13.3333C2.66667 14.6444 2.88356 15.8778 3.31733 17.0333C3.75022 18.1889 4.35556 19.2222 5.13333 20.1333ZM13.3333 14.6667C12.0222 14.6667 10.9164 14.2169 10.016 13.3173C9.11644 12.4169 8.66667 11.3111 8.66667 10C8.66667 8.68889 9.11644 7.58311 10.016 6.68267C10.9164 5.78311 12.0222 5.33333 13.3333 5.33333C14.6444 5.33333 15.7502 5.78311 16.6507 6.68267C17.5502 7.58311 18 8.68889 18 10C18 11.3111 17.5502 12.4169 16.6507 13.3173C15.7502 14.2169 14.6444 14.6667 13.3333 14.6667ZM13.3333 26.6667C11.4889 26.6667 9.75556 26.3164 8.13333 25.616C6.51111 24.9164 5.1 23.9667 3.9 22.7667C2.7 21.5667 1.75022 20.1556 1.05067 18.5333C0.350222 16.9111 0 15.1778 0 13.3333C0 11.4889 0.350222 9.75556 1.05067 8.13333C1.75022 6.51111 2.7 5.1 3.9 3.9C5.1 2.7 6.51111 1.74978 8.13333 1.04933C9.75556 0.349778 11.4889 0 13.3333 0C15.1778 0 16.9111 0.349778 18.5333 1.04933C20.1556 1.74978 21.5667 2.7 22.7667 3.9C23.9667 5.1 24.9164 6.51111 25.616 8.13333C26.3164 9.75556 26.6667 11.4889 26.6667 13.3333C26.6667 15.1778 26.3164 16.9111 25.616 18.5333C24.9164 20.1556 23.9667 21.5667 22.7667 22.7667C21.5667 23.9667 20.1556 24.9164 18.5333 25.616C16.9111 26.3164 15.1778 26.6667 13.3333 26.6667Z"
              fill="#51D3B7"
            />
          </svg>
        </router-link>

        <button
          v-if="authStore.isAuthenticated"
          type="button"
          class="app-header__logout"
          aria-label="Выйти"
          @click="handleLogout"
        >
          Выйти
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: var(--color-navy);
  height: var(--header-height);
}

.app-header__inner {
  max-width: var(--container-max-width);
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--container-padding);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-header__nav {
  display: flex;
  align-items: center;
  gap: var(--nav-gap);
}

.app-header__link {
  color: var(--color-text-on-dark);
  font-size: var(--font-size-nav);
  text-decoration: none;
  opacity: 0.9;
  transition: opacity 0.15s ease;
}

.app-header__link:hover,
.app-header__link.router-link-active {
  opacity: 1;
}

.app-header__profile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-on-dark);
  opacity: 0.9;
  transition: opacity 0.15s ease;
}

.app-header__profile:hover,
.app-header__profile.router-link-active {
  opacity: 1;
}

.app-header__logout {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-sm);
  padding: 6px 14px;
  color: var(--color-text-on-dark);
  font-size: var(--font-size-nav);
  cursor: pointer;
  opacity: 0.9;
  transition:
    opacity 0.15s ease,
    background-color 0.15s ease;
}

.app-header__logout:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.1);
}

@media (max-width: 640px) {
  /*добавить бургер может*/
  .app-header__link {
    display: none;
  }
}
</style>
