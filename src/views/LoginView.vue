<script setup>
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const authStore = useAuthStore()
const profileStore = useProfileStore()
const router = useRouter()
const route = useRoute()

async function handleLogin() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.login(username.value, password.value)
    await profileStore.fetchProfile()
    redirectAfterLogin()
  } catch (err) {
    errorMessage.value = 'Не удалось войти. Проверьте логин и пароль или попробуйте позже'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function redirectByRole() {
  if (profileStore.isAdmin) return { name: 'admin-moderation' }
  if (profileStore.role === 'org') return { name: 'org-office' }
  return { name: 'office-personal-data' }
}

function redirectAfterLogin() {
  if (route.query.redirect) {
    router.push(route.query.redirect)
    return
  }

  router.push(redirectByRole())
}

// локальный обход для проверки вёрстки кабинетов без реального бэка
function devLoginAs(role) {
  authStore._devLogin()
  profileStore._devSetRole(role)
  redirectAfterLogin()
}
</script>

<template>
  <div class="login">
    <div class="login__card">
      <h1 class="login__title">Вход</h1>

      <form class="login__form" @submit.prevent="handleLogin">
        <label class="login__field">
          <span>Логин</span>
          <input v-model="username" type="text" placeholder="ivanov" required />
        </label>

        <label class="login__field">
          <span>Пароль</span>
          <input v-model="password" type="password" placeholder="••••••••" required />
        </label>

        <button type="submit" class="login__submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Входим...' : 'Войти' }}
        </button>

        <p v-if="errorMessage" class="login__error">{{ errorMessage }}</p>
      </form>

      <p class="login__register-link">
        Нет аккаунта?
        <router-link :to="{ name: 'register' }">Зарегистрироваться</router-link>
      </p>

      <div class="login__dev">
        <p class="login__dev-label">локальный выбор роли (без реального бэка)</p>
        <div class="login__dev-buttons">
          <button type="button" class="login__dev-btn" @click="devLoginAs('buyer')">
            Прикинуться пользователем
          </button>
          <button
            type="button"
            class="login__dev-btn login__dev-btn--admin"
            @click="devLoginAs('admin')"
          >
            Прикинуться администратором
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px var(--container-padding);
}

.login__card {
  width: 100%;
  max-width: 360px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 32px;
}

.login__title {
  font-size: var(--font-size-heading);
  color: var(--color-text-primary);
  margin: 0 0 24px;
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.login__field input {
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: var(--font-size-base);
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
}

.login__field input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(81, 211, 183, 0.25);
}

.login__submit-btn {
  margin-top: 8px;
  padding: 10px;
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--color-accent);
  color: var(--color-text-on-dark);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.login__submit-btn:hover {
  background-color: var(--color-accent-hover);
}

.login__submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login__error {
  color: #e5484d;
  font-size: 13px;
  margin: 0;
}

.login__register-link {
  margin-top: 16px;
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
}

.login__register-link a {
  color: var(--color-accent-hover);
  font-weight: 600;
}

.login__dev {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px dashed var(--color-border);
}

.login__dev-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0 0 10px;
}

.login__dev-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.login__dev-btn {
  padding: 9px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-navy);
  background-color: var(--color-bg);
  color: var(--color-navy);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.login__dev-btn:hover {
  background-color: var(--color-navy);
  color: var(--color-text-on-dark);
}

.login__dev-btn--admin {
  border-color: var(--color-accent-hover);
  color: var(--color-accent-hover);
}

.login__dev-btn--admin:hover {
  background-color: var(--color-accent-hover);
  color: var(--color-text-on-dark);
}
</style>
