<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useOrgAccountStore } from '@/stores/orgAccount'
import { ORG_TYPE_LABELS, ROOM_TYPE_ORG_TYPES, TOUR_ORG_TYPES } from '@/constants/orgTypes'

const orgStore = useOrgAccountStore()

const mode = ref('loading') // loading | pick-type | form | pending | live
const isSubmitting = ref(false)
const submitError = ref('')

const form = reactive({
  org_type: '',
  name: '',
  description: '',
  federal_district: '',
  region: '',
  city: '',
  address: '',
  latitude: '',
  longitude: '',
  phone: '',
  working_hours: '',
  perksText: '',
  amenitiesText: '',
  services: [],
})
const imageFile = ref(null)

function blankService() {
  return {
    category: '',
    name: '',
    description: '',
    price: '',
    capacity: '',
    amenitiesText: '',
    date_start: '',
    date_end: '',
    includedText: '',
    itineraryText: '',
  }
}

function addService() {
  form.services.push(blankService())
}

function removeService(idx) {
  form.services.splice(idx, 1)
}

const isRoomType = computed(() => ROOM_TYPE_ORG_TYPES.includes(form.org_type))
const isTourType = computed(() => TOUR_ORG_TYPES.includes(form.org_type))

function fillFormFrom(org) {
  form.org_type = org.org_type
  form.name = org.name
  form.description = org.description
  form.federal_district = org.federal_district
  form.region = org.region
  form.city = org.city
  form.address = org.address
  form.latitude = org.latitude ?? ''
  form.longitude = org.longitude ?? ''
  form.phone = org.phone
  form.working_hours = org.working_hours
  form.perksText = (org.perks || []).join(', ')
  form.amenitiesText = (org.general_amenities || []).join(', ')
  form.services = (org.services || []).map((s) => ({
    category: s.category || '',
    name: s.name,
    description: s.description || '',
    price: s.price,
    capacity: s.capacity ?? '',
    amenitiesText: (s.amenities || []).join(', '),
    date_start: s.date_start || '',
    date_end: s.date_end || '',
    includedText: (s.included || []).join(', '),
    itineraryText: (s.itinerary || []).join('\n'),
  }))
}

function pickType(type) {
  form.org_type = type
  form.services = [blankService()]
  mode.value = 'form'
}

function startEdit() {
  fillFormFrom(orgStore.organization)
  mode.value = 'form'
}

function onImageChange(e) {
  imageFile.value = e.target.files[0] || null
}

async function submitForm() {
  isSubmitting.value = true
  submitError.value = ''
  try {
    const fd = new FormData()
    fd.append('org_type', form.org_type)
    fd.append('name', form.name)
    fd.append('description', form.description)
    fd.append('federal_district', form.federal_district)
    fd.append('region', form.region)
    fd.append('city', form.city)
    fd.append('address', form.address)
    fd.append('phone', form.phone)
    fd.append('working_hours', form.working_hours)
    if (imageFile.value) fd.append('image', imageFile.value)
    if (form.latitude) fd.append('latitude', form.latitude)
    if (form.longitude) fd.append('longitude', form.longitude)

    const perks = form.perksText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const amenities = form.amenitiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    fd.append('perks', JSON.stringify(perks))
    fd.append('general_amenities', JSON.stringify(amenities))

    const servicesPayload = form.services.map((s) => ({
      category: s.category,
      name: s.name,
      description: s.description,
      price: Number(s.price) || 0,
      capacity: s.capacity ? Number(s.capacity) : null,
      amenities: s.amenitiesText
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      date_start: s.date_start || null,
      date_end: s.date_end || null,
      included: s.includedText
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      itinerary: s.itineraryText
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean),
    }))
    fd.append('services_payload', JSON.stringify(servicesPayload))

    await orgStore.submit(fd)
    mode.value = 'pending'
  } catch (err) {
    submitError.value = 'Не удалось отправить заявку. Проверьте заполненные поля.'
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}

function resolveMode() {
  if (orgStore.hasPendingSubmission) {
    mode.value = 'pending'
    return
  }
  if (orgStore.organization) {
    mode.value = 'live'
    return
  }
  mode.value = 'pick-type'
}

onMounted(async () => {
  await orgStore.fetchAll()
  resolveMode()
})
</script>

<template>
  <div class="org-office">
    <h1 class="org-office__title">Кабинет организации</h1>

    <p v-if="mode === 'loading'" class="org-office__empty">Загрузка...</p>

    <!-- Ещё нет ни организации, ни заявки -->
    <div v-else-if="mode === 'pick-type'" class="org-office__pick">
      <p class="org-office__hint">Выберите, к какому типу вы себя относите</p>
      <div class="org-office__type-grid">
        <button
          v-for="(label, type) in ORG_TYPE_LABELS"
          :key="type"
          type="button"
          class="org-office__type-btn"
          @click="pickType(type)"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <!-- Заявка на рассмотрении -->
    <div v-else-if="mode === 'pending'" class="org-office__banner">
      <p>Ваша заявка находится на рассмотрении администратора.</p>
      <p v-if="orgStore.submission?.status === 'rejected'" class="org-office__banner-rejected">
        Предыдущая заявка была отклонена{{
          orgStore.submission.admin_comment ? ': ' + orgStore.submission.admin_comment : ''
        }}.
      </p>
      <p class="org-office__banner-name">{{ orgStore.submission?.name }}</p>
    </div>

    <!-- Есть подтверждённая организация -->
    <div v-else-if="mode === 'live'" class="org-office__live">
      <div class="org-office__live-header">
        <h2>{{ orgStore.organization.name }}</h2>
        <button type="button" class="org-office__edit-btn" @click="startEdit">Редактировать</button>
      </div>
      <p class="org-office__live-type">{{ ORG_TYPE_LABELS[orgStore.organization.org_type] }}</p>
      <p>{{ orgStore.organization.city }}, {{ orgStore.organization.address }}</p>
      <p v-if="orgStore.organization.description">{{ orgStore.organization.description }}</p>
      <p class="org-office__services-count">
        Услуг в каталоге: {{ orgStore.organization.services.length }}
      </p>
    </div>

    <!-- Форма создания/редактирования -->
    <form v-else-if="mode === 'form'" class="org-form" @submit.prevent="submitForm">
      <div class="org-form__grid">
        <label class="org-form__field">
          <span>Название</span>
          <input v-model="form.name" type="text" required />
        </label>

        <label class="org-form__field">
          <span>Телефон</span>
          <input v-model="form.phone" type="text" required />
        </label>

        <label class="org-form__field org-form__field--wide">
          <span>Описание</span>
          <textarea v-model="form.description" rows="3"></textarea>
        </label>

        <label class="org-form__field">
          <span>Федеральный округ</span>
          <input v-model="form.federal_district" type="text" required />
        </label>

        <label class="org-form__field">
          <span>Область/Республика</span>
          <input v-model="form.region" type="text" required />
        </label>

        <label class="org-form__field">
          <span>Город</span>
          <input v-model="form.city" type="text" required />
        </label>

        <label class="org-form__field">
          <span>Адрес</span>
          <input v-model="form.address" type="text" required />
        </label>

        <label class="org-form__field">
          <span>Время работы</span>
          <input v-model="form.working_hours" type="text" placeholder="Пн-вс: 9:00 - 21:00" />
        </label>

        <label class="org-form__field">
          <span>Главное фото</span>
          <input type="file" accept="image/*" @change="onImageChange" />
        </label>

        <label class="org-form__field org-form__field--wide">
          <span>Преференции для клиентов платформы (через запятую)</span>
          <input
            v-model="form.perksText"
            type="text"
            placeholder="Скидка 10%, Бесплатный завтрак"
          />
        </label>

        <label class="org-form__field org-form__field--wide">
          <span>Услуги и удобства (через запятую)</span>
          <input
            v-model="form.amenitiesText"
            type="text"
            placeholder="Телевизор, Кухня, Мини-бар"
          />
        </label>

        <label class="org-form__field">
          <span>Широта</span>
          <input v-model="form.latitude" type="number" step="0.000001" placeholder="55.751244" />
        </label>

        <label class="org-form__field">
          <span>Долгота</span>
          <input v-model="form.longitude" type="number" step="0.000001" placeholder="37.618423" />
        </label>
      </div>

      <h3 class="org-form__services-title">
        {{ isTourType ? 'Туры' : isRoomType ? 'Номера' : 'Услуги' }}
      </h3>

      <div v-for="(service, idx) in form.services" :key="idx" class="org-form__service">
        <div class="org-form__grid">
          <label class="org-form__field">
            <span>Категория/раздел</span>
            <input
              v-model="service.category"
              type="text"
              placeholder="Стандарт / Гастроэнтерология"
            />
          </label>

          <label class="org-form__field">
            <span>Название</span>
            <input v-model="service.name" type="text" required />
          </label>

          <label class="org-form__field">
            <span>Цена</span>
            <input v-model="service.price" type="number" min="0" step="0.01" required />
          </label>

          <label v-if="isRoomType || isTourType" class="org-form__field">
            <span>Вместимость (человек)</span>
            <input v-model="service.capacity" type="number" min="1" />
          </label>

          <label v-if="isRoomType" class="org-form__field org-form__field--wide">
            <span>Состав номера (через запятую)</span>
            <input
              v-model="service.amenitiesText"
              type="text"
              placeholder="1 кровать, Душевая кабина, Окно"
            />
          </label>

          <template v-if="isTourType">
            <label class="org-form__field">
              <span>Дата начала</span>
              <input v-model="service.date_start" type="date" />
            </label>
            <label class="org-form__field">
              <span>Дата окончания</span>
              <input v-model="service.date_end" type="date" />
            </label>
            <label class="org-form__field org-form__field--wide">
              <span>Что включено (через запятую)</span>
              <input
                v-model="service.includedText"
                type="text"
                placeholder="Отель 5 звезд, Экскурсии, Перелет"
              />
            </label>
            <label class="org-form__field org-form__field--wide">
              <span>Программа по дням (каждый день с новой строки)</span>
              <textarea
                v-model="service.itineraryText"
                rows="4"
                placeholder="День 1: Прилёт, трансфер в отель"
              ></textarea>
            </label>
          </template>

          <label v-if="!isRoomType && !isTourType" class="org-form__field org-form__field--wide">
            <span>Описание услуги</span>
            <textarea v-model="service.description" rows="2"></textarea>
          </label>
        </div>

        <button type="button" class="org-form__remove-service-btn" @click="removeService(idx)">
          Удалить услугу
        </button>
      </div>

      <button type="button" class="org-form__add-service-btn" @click="addService">
        + Добавить {{ isTourType ? 'тур' : isRoomType ? 'номер' : 'услугу' }}
      </button>

      <p v-if="submitError" class="org-form__error">{{ submitError }}</p>

      <button type="submit" class="org-form__submit-btn" :disabled="isSubmitting">
        {{ isSubmitting ? 'Отправляем...' : 'Отправить на модерацию' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.org-office {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 32px var(--container-padding) 64px;
}

.org-office__title {
  display: inline-block;
  font-size: var(--font-size-heading);
  color: var(--color-text-primary);
  margin: 0 0 24px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-text-primary);
}

.org-office__empty {
  color: var(--color-text-secondary);
}

.org-office__hint {
  margin-bottom: 16px;
  color: var(--color-text-secondary);
}

.org-office__type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.org-office__type-btn {
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  cursor: pointer;
}

.org-office__type-btn:hover {
  border-color: var(--color-accent);
}

.org-office__banner {
  padding: 20px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
}

.org-office__banner-rejected {
  color: #e5484d;
  margin-top: 8px;
}

.org-office__banner-name {
  margin-top: 12px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.org-office__live-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 8px;
}

.org-office__edit-btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--color-accent);
  color: var(--color-text-on-dark);
  font-weight: 600;
  cursor: pointer;
}

.org-office__live-type {
  color: var(--color-accent-hover);
  font-weight: 600;
  margin: 0 0 12px;
}

.org-office__services-count {
  margin-top: 12px;
  color: var(--color-text-secondary);
}

.org-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 24px;
  margin-bottom: 20px;
}

.org-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.org-form__field--wide {
  grid-column: 1 / -1;
}

.org-form__field input,
.org-form__field textarea {
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: var(--font-size-base);
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
}

.org-form__services-title {
  font-size: var(--font-size-heading);
  color: var(--color-text-primary);
  margin: 24px 0 16px;
}

.org-form__service {
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}

.org-form__remove-service-btn {
  background: none;
  border: none;
  color: #e5484d;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}

.org-form__add-service-btn {
  padding: 8px 16px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: none;
  color: var(--color-accent-hover);
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 24px;
}

.org-form__error {
  color: #e5484d;
  margin-bottom: 12px;
}

.org-form__submit-btn {
  padding: 12px 28px;
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--color-accent);
  color: var(--color-text-on-dark);
  font-weight: 600;
  cursor: pointer;
}

.org-form__submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
