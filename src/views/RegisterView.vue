<script setup>
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const form = reactive({
  username: '',
  password: '',
  email: '',
  firstName: '',
  lastName: '',
  role: 'buyer',
})

const isLoading = ref(false)
const errorMessage = ref('')

const authStore = useAuthStore()
const profileStore = useProfileStore()
const router = useRouter()

function redirectByRole() {
  if (profileStore.isAdmin) return { name: 'admin-moderation' }
  if (profileStore.role === 'org') return { name: 'org-office' }
  return { name: 'office-personal-data' }
}

async function handleRegister() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.register({
      username: form.username,
      password: form.password,
      email: form.email,
      first_name: form.firstName,
      last_name: form.lastName,
      role: form.role,
    })
    await profileStore.fetchProfile()

    router.push(redirectByRole())
  } catch (err) {
    errorMessage.value = 'Не удалось зарегистрироваться. Проверьте данные (возможно, логин занят)'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="register">
    <div class="register__card">
      <h1 class="register__title">Регистрация</h1>

      <form class="register__form" @submit.prevent="handleRegister">
        <label class="register__field">
          <span>Логин</span>
          <input v-model="form.username" type="text" required />
        </label>

        <label class="register__field">
          <span>Пароль</span>
          <input v-model="form.password" type="password" required />
        </label>

        <label class="register__field">
          <span>Email</span>
          <input v-model="form.email" type="email" />
        </label>

        <label class="register__field">
          <span>Имя</span>
          <input v-model="form.firstName" type="text" />
        </label>

        <label class="register__field">
          <span>Фамилия</span>
          <input v-model="form.lastName" type="text" />
        </label>

        <fieldset class="register__field register__field--radio">
          <span>Регистрируюсь как</span>
          <label><input v-model="form.role" type="radio" value="buyer" /> Покупатель</label>
          <label
            ><input v-model="form.role" type="radio" value="org" /> Туристическая организация</label
          >
        </fieldset>

        <button type="submit" class="register__submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Регистрируем...' : 'Зарегистрироваться' }}
        </button>

        <p v-if="errorMessage" class="register__error">{{ errorMessage }}</p>
      </form>

      <p class="register__login-link">
        Уже есть аккаунт?
        <router-link :to="{ name: 'login' }">Войти</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px var(--container-padding);
}

.register__card {
  width: 100%;
  max-width: 400px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 32px;
}

.register__title {
  font-size: var(--font-size-heading);
  color: var(--color-text-primary);
  margin: 0 0 24px;
}

.register__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.register__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.register__field input[type='text'],
.register__field input[type='password'],
.register__field input[type='email'] {
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: var(--font-size-base);
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
}

.register__field--radio {
  border: none;
  padding: 0;
  margin: 0;
  gap: 8px;
}

.register__field--radio label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 400;
  cursor: pointer;
}

.register__submit-btn {
  margin-top: 8px;
  padding: 10px;
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--color-accent);
  color: var(--color-text-on-dark);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
}

.register__submit-btn:hover {
  background-color: var(--color-accent-hover);
}

.register__submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register__error {
  color: #e5484d;
  font-size: 13px;
  margin: 0;
}

.register__login-link {
  margin-top: 16px;
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
}

.register__login-link a {
  color: var(--color-accent-hover);
  font-weight: 600;
}
</style>
