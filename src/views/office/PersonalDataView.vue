<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useProfileStore } from '@/stores/profile'

const profileStore = useProfileStore()
const isEditing = ref(false)
const errorMessage = ref('')

const draft = reactive({}) //черновик

const genderLabel = computed(() => (profileStore.gender === 'male' ? 'Мужской' : 'Женский'))

onMounted(() => {
  //оказались тут без loginview
  if (!profileStore.lastName) {
    profileStore.fetchProfile()
  }
})

function toggleEdit() {
  if (!isEditing.value) {
    //запись в черновик
    Object.assign(draft, {
      lastName: profileStore.lastName,
      firstName: profileStore.firstName,
      email: profileStore.email,
      gender: profileStore.gender,
      age: profileStore.age,
      phone: profileStore.phone,
      country: profileStore.country,
      city: profileStore.city,
    })
  }
  isEditing.value = !isEditing.value
}

async function save() {
  errorMessage.value = ''
  try {
    await profileStore.updateProfile({ ...draft })
    isEditing.value = false
  } catch (err) {
    errorMessage.value = 'Не удалось сохранить. Проверьте правильность email и телефона.'
    console.error(err)
  }
}
</script>

<template>
  <div class="personal-data">
    <button
      class="personal-data__edit-btn"
      type="button"
      :aria-label="isEditing ? 'Отменить редактирование' : 'Редактировать'"
      @click="toggleEdit"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.6917 8.18117L13.7958 4.33117L15.0792 3.04784C15.4306 2.69645 15.8623 2.52075 16.3744 2.52075C16.8859 2.52075 17.3174 2.69645 17.6687 3.04784L18.9521 4.33117C19.3035 4.68256 19.4868 5.10667 19.5021 5.6035C19.5174 6.09972 19.3493 6.52353 18.9979 6.87492L17.6917 8.18117ZM16.3625 9.53325L6.64583 19.2499H2.75V15.3541L12.4667 5.63742L16.3625 9.53325Z"
          fill="black"
        />
      </svg>
    </button>

    <dl v-if="!isEditing" class="personal-data__grid">
      <div class="personal-data__field">
        <dt>Фамилия</dt>
        <dd>{{ profileStore.lastName }}</dd>
      </div>
      <div class="personal-data__field">
        <dt>Пол</dt>
        <dd>{{ genderLabel }}</dd>
      </div>
      <div class="personal-data__field">
        <dt>Страна</dt>
        <dd>{{ profileStore.country }}</dd>
      </div>

      <div class="personal-data__field">
        <dt>Имя</dt>
        <dd>{{ profileStore.firstName }}</dd>
      </div>
      <div class="personal-data__field">
        <dt>Возраст</dt>
        <dd>{{ profileStore.age }} лет</dd>
      </div>
      <div class="personal-data__field">
        <dt>Город</dt>
        <dd>{{ profileStore.city }}</dd>
      </div>

      <div class="personal-data__field">
        <dt>Email</dt>
        <dd>{{ profileStore.email }}</dd>
      </div>
      <div class="personal-data__field">
        <dt>Телефон</dt>
        <dd>{{ profileStore.phone }}</dd>
      </div>
    </dl>

    <form v-else class="personal-data__grid personal-data__grid--edit" @submit.prevent="save">
      <label class="personal-data__field">
        <span>Фамилия</span>
        <input v-model="draft.lastName" type="text" />
      </label>

      <fieldset class="personal-data__field personal-data__field--radio">
        <span>Пол</span>
        <label><input v-model="draft.gender" type="radio" value="male" /> Мужской</label>
        <label><input v-model="draft.gender" type="radio" value="female" /> Женский</label>
      </fieldset>

      <label class="personal-data__field">
        <span>Страна</span>
        <input v-model="draft.country" type="text" />
      </label>

      <label class="personal-data__field">
        <span>Имя</span>
        <input v-model="draft.firstName" type="text" />
      </label>

      <label class="personal-data__field">
        <span>Возраст</span>
        <input v-model.number="draft.age" type="number" min="0" />
      </label>

      <label class="personal-data__field">
        <span>Город</span>
        <input v-model="draft.city" type="text" />
      </label>

      <label class="personal-data__field">
        <span>Email</span>
        <input v-model="draft.email" type="email" />
      </label>

      <label class="personal-data__field">
        <span>Телефон</span>
        <input v-model="draft.phone" type="tel" />
      </label>

      <p v-if="errorMessage" class="personal-data__error">{{ errorMessage }}</p>

      <button type="submit" class="personal-data__save-btn" :disabled="profileStore.isSaving">
        Сохранить
      </button>
    </form>
  </div>
</template>

<style scoped>
.personal-data {
  position: relative;
}

.personal-data__edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-primary);
  padding: 0;
  margin-bottom: 20px;
}

.personal-data__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 220px));
  gap: 20px 40px;
  margin: 0;
}

.personal-data__field dt {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.personal-data__field dd {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.personal-data__grid--edit .personal-data__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.personal-data__field--radio {
  border: none;
  padding: 0;
  margin: 0;
  flex-direction: row;
  align-items: center;
  gap: 16px;
}

.personal-data__field--radio > span {
  width: 100%;
  margin-bottom: 6px;
}

.personal-data__grid--edit input[type='text'],
.personal-data__grid--edit input[type='email'],
.personal-data__grid--edit input[type='tel'],
.personal-data__grid--edit input[type='number'] {
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: var(--font-size-base);
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
}

.personal-data__grid--edit input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(81, 211, 183, 0.25);
}

.personal-data__field--radio label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 400;
}

.personal-data__field--radio input[type='radio'] {
  accent-color: var(--color-accent);
  cursor: pointer;
}

.personal-data__save-btn {
  grid-column: 1;
  margin-top: 8px;
  padding: 10px 32px;
  align-self: start;
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--color-accent);
  color: var(--color-text-on-dark);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.personal-data__save-btn:hover {
  background-color: var(--color-accent-hover);
}

.personal-data__save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.personal-data__edit-btn {
  transition: opacity 0.15s ease;
}

.personal-data__edit-btn:hover {
  opacity: 0.7;
}

.personal-data__error {
  color: #e5484d;
  font-size: 13px;
  margin: 0 0 12px;
}
</style>
