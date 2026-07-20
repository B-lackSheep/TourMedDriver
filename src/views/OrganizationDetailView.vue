<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import {
  ORG_TYPE_LABELS,
  ROOM_TYPE_ORG_TYPES,
  TOUR_ORG_TYPES,
  CTA_LABELS,
} from '@/constants/orgTypes'
import { useReviewsStore } from '@/stores/reviews'
import { formatDateRange } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const reviewsStore = useReviewsStore()

const reviewDraft = reactive({ rating: 5, text: '' })
const reviewPage = ref(1)
const REVIEWS_PER_PAGE = 3

const org = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const selectedImage = ref(null)
const expandedTourId = ref(null)
const roomImageIndex = ref({})

const mapEmbedUrl = computed(() => {
  if (!org.value?.latitude || !org.value?.longitude) return ''
  const lat = Number(org.value.latitude)
  const lon = Number(org.value.longitude)
  const d = 0.005
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - d}%2C${lat - d}%2C${lon + d}%2C${lat + d}&marker=${lat}%2C${lon}`
})

const totalReviewPages = computed(() =>
  Math.max(1, Math.ceil(reviewsStore.items.length / REVIEWS_PER_PAGE)),
)

const pagedReviews = computed(() => {
  const start = (reviewPage.value - 1) * REVIEWS_PER_PAGE
  return reviewsStore.items.slice(start, start + REVIEWS_PER_PAGE)
})

async function submitReview() {
  await reviewsStore.submit(org.value.id, reviewDraft.rating, reviewDraft.text)
  reviewDraft.text = ''
  reviewPage.value = 1
}

async function loadOrganization() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    org.value = await api.get(`/organizations/${route.params.id}/`)
    selectedImage.value = org.value.image || org.value.gallery[0]?.image || null
    await Promise.all([
      reviewsStore.fetchByOrg(org.value.id),
      authStore.isAuthenticated ? reviewsStore.fetchMyReview(org.value.id) : Promise.resolve(),
    ])
  } catch (err) {
    errorMessage.value = 'Организация не найдена'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadOrganization)

const typeLabel = computed(() =>
  org.value ? (ORG_TYPE_LABELS[org.value.org_type] ?? org.value.org_type) : '',
)
const isRoomType = computed(() => org.value && ROOM_TYPE_ORG_TYPES.includes(org.value.org_type))
const isTourType = computed(() => org.value && TOUR_ORG_TYPES.includes(org.value.org_type))
const ctaLabel = computed(() =>
  org.value ? (CTA_LABELS[org.value.org_type] ?? 'Купить') : 'Купить',
)

const gallery = computed(() => {
  if (!org.value) return []
  const images = [org.value.image, ...org.value.gallery.map((g) => g.image)]
  return [...new Set(images.filter(Boolean))]
})

// группировка услуг по category + порядок появления
const sections = computed(() => {
  if (!org.value) return []
  const order = []
  const map = new Map()
  org.value.services.forEach((service) => {
    const key = service.category || 'Услуги'
    if (!map.has(key)) {
      map.set(key, [])
      order.push(key)
    }
    map.get(key).push(service)
  })
  return order.map((title) => ({ title, services: map.get(title) }))
})

function sectionAnchor(title) {
  return 'section-' + title.replace(/\s+/g, '-')
}

function scrollToSection(title) {
  const el = document.getElementById(sectionAnchor(title))
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function toggleItinerary(serviceId) {
  expandedTourId.value = expandedTourId.value === serviceId ? null : serviceId
}

// покупка услуги
const activeService = ref(null)
const purchaseQty = ref(1)
const isSubmitting = ref(false)
const submitError = ref('')
const submitSuccess = ref(false)

function openPurchase(service) {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  activeService.value = service
  purchaseQty.value = 1
  submitError.value = ''
  submitSuccess.value = false
}

function closePurchase() {
  activeService.value = null
}

async function confirmPurchase() {
  isSubmitting.value = true
  submitError.value = ''
  try {
    await cartStore.addItem(activeService.value.id, purchaseQty.value)
    submitSuccess.value = true
  } catch (err) {
    submitError.value = 'Не удалось оформить'
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}

function shiftRoomImage(service, delta) {
  const total = service.gallery.length
  if (!total) return
  const current = roomImageIndex.value[service.id] ?? 0
  roomImageIndex.value[service.id] = (current + delta + total) % total
}
</script>

<template>
  <div class="org-detail">
    <p v-if="isLoading" class="org-detail__empty">Загрузка...</p>
    <p v-else-if="errorMessage" class="org-detail__error">{{ errorMessage }}</p>

    <template v-else-if="org">
      <router-link :to="{ name: 'catalog' }" class="org-detail__back">
        <span class="org-detail__back-icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 9H3M3 9L8 4M3 9L8 14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </router-link>

      <div class="org-detail__header">
        <div class="org-detail__gallery">
          <div class="org-detail__main-image">
            <img v-if="selectedImage" :src="selectedImage" :alt="org.name" />
          </div>
          <div v-if="gallery.length > 1" class="org-detail__thumbs">
            <button
              v-for="img in gallery"
              :key="img"
              type="button"
              class="org-detail__thumb"
              :class="{ 'org-detail__thumb--active': img === selectedImage }"
              @click="selectedImage = img"
            >
              <img :src="img" alt="" />
            </button>
          </div>
        </div>

        <div class="org-detail__info">
          <h1 class="org-detail__name">{{ org.name }}</h1>
          <p class="org-detail__type">{{ typeLabel }}</p>
          <p v-if="org.description" class="org-detail__description">{{ org.description }}</p>
        </div>

        <aside class="org-detail__meta">
          <div v-if="org.working_hours" class="org-detail__meta-block">
            <h4>Время работы</h4>
            <p>{{ org.working_hours }}</p>
          </div>
          <div class="org-detail__meta-block">
            <h4>Адрес</h4>
            <p>{{ org.federal_district }}, {{ org.region }}</p>
            <p>г. {{ org.city }}, {{ org.address }}</p>
          </div>
          <div class="org-detail__meta-block">
            <h4>Телефон</h4>
            <p>{{ org.phone }}</p>
          </div>
        </aside>
      </div>

      <div class="org-detail__body">
        <nav v-if="sections.length > 1" class="org-detail__sidenav">
          <button
            v-for="section in sections"
            :key="section.title"
            type="button"
            class="org-detail__sidenav-link"
            @click="scrollToSection(section.title)"
          >
            {{ section.title }}
          </button>
        </nav>

        <div class="org-detail__main">
          <section v-if="org.perks.length" class="org-detail__perks">
            <span v-for="perk in org.perks" :key="perk" class="perk-badge">{{ perk }}</span>
          </section>

          <section v-if="org.general_amenities.length" class="org-detail__amenities">
            <h2 class="org-detail__section-title">Услуги и удобства</h2>
            <div class="amenities-grid">
              <span v-for="a in org.general_amenities" :key="a" class="amenity-chip"
                >✓ {{ a }}</span
              >
            </div>
          </section>

          <section class="org-detail__services">
            <h2 class="org-detail__section-title">
              {{ isTourType ? 'Туры' : isRoomType ? 'Номера' : 'Услуги' }}
            </h2>

            <div
              v-for="section in sections"
              :key="section.title"
              :id="sectionAnchor(section.title)"
              class="service-section"
            >
              <h3 v-if="sections.length > 1" class="service-section__title">{{ section.title }}</h3>

              <!-- Номера отеля/санатория/спорт-базы -->
              <template v-if="isRoomType">
                <div v-for="service in section.services" :key="service.id" class="room-row">
                  <div class="room-row__thumb">
                    <img
                      v-if="service.gallery.length"
                      :src="service.gallery[roomImageIndex[service.id] ?? 0]?.image"
                      :alt="service.name"
                    />
                    <img v-else-if="service.image" :src="service.image" :alt="service.name" />
                    <template v-if="service.gallery.length > 1">
                      <button
                        type="button"
                        class="room-row__thumb-nav room-row__thumb-nav--prev"
                        @click.stop="shiftRoomImage(service, -1)"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        class="room-row__thumb-nav room-row__thumb-nav--next"
                        @click.stop="shiftRoomImage(service, 1)"
                      >
                        ›
                      </button>
                    </template>
                  </div>

                  <div class="room-row__name">
                    {{ service.name
                    }}<span v-if="service.capacity"> ({{ service.capacity }} человек)</span>
                  </div>

                  <ul v-if="service.amenities.length" class="room-row__amenities">
                    <li v-for="a in service.amenities" :key="a">✓ {{ a }}</li>
                  </ul>

                  <div class="room-row__price">
                    <span class="room-row__price-amount">{{ service.price }}р</span>
                    <span class="room-row__price-period">за сутки</span>
                  </div>

                  <button type="button" class="service-buy-btn" @click="openPurchase(service)">
                    {{ ctaLabel }}
                  </button>
                </div>
              </template>

              <!-- Туры -->
              <template v-else-if="isTourType">
                <div v-for="service in section.services" :key="service.id" class="tour-card">
                  <div class="tour-card__main">
                    <div class="tour-card__thumb">
                      <img
                        v-if="service.gallery.length"
                        :src="service.gallery[roomImageIndex[service.id] ?? 0]?.image"
                        :alt="service.name"
                      />
                      <img v-else-if="service.image" :src="service.image" :alt="service.name" />
                      <template v-if="service.gallery.length > 1">
                        <button
                          type="button"
                          class="room-row__thumb-nav room-row__thumb-nav--prev"
                          @click.stop="shiftRoomImage(service, -1)"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          class="room-row__thumb-nav room-row__thumb-nav--next"
                          @click.stop="shiftRoomImage(service, 1)"
                        >
                          ›
                        </button>
                      </template>
                    </div>

                    <div class="tour-card__name-block">
                      <div class="tour-card__name">{{ service.name }}</div>
                      <div v-if="service.date_start" class="tour-card__dates">
                        {{ formatDateRange(service.date_start, service.date_end) }}
                      </div>
                    </div>

                    <ul v-if="service.included.length" class="tour-card__included">
                      <li v-for="i in service.included" :key="i">✓ {{ i }}</li>
                    </ul>

                    <div class="tour-card__price">
                      <span class="tour-card__price-amount">{{ service.price }}р</span>
                      <span v-if="service.capacity" class="tour-card__price-period"
                        >({{ service.capacity }} человек)</span
                      >
                    </div>

                    <button type="button" class="service-buy-btn" @click="openPurchase(service)">
                      {{ ctaLabel }}
                    </button>
                  </div>

                  <button
                    v-if="service.itinerary.length"
                    type="button"
                    class="tour-card__toggle"
                    @click="toggleItinerary(service.id)"
                  >
                    {{
                      expandedTourId === service.id
                        ? 'Скрыть программу'
                        : 'Показать программу по дням'
                    }}
                  </button>

                  <div v-if="expandedTourId === service.id" class="tour-card__itinerary">
                    <p v-for="(day, idx) in service.itinerary" :key="idx">{{ day }}</p>
                  </div>
                </div>
              </template>

              <!-- Остальные типы-->
              <template v-else>
                <div v-for="service in section.services" :key="service.id" class="service-row">
                  <div class="service-row__thumb">
                    <img v-if="service.image" :src="service.image" :alt="service.name" />
                  </div>
                  <div class="service-row__info">
                    <div class="service-row__name">{{ service.name }}</div>
                    <div v-if="service.description" class="service-row__description">
                      {{ service.description }}
                    </div>
                  </div>
                  <div class="service-row__price">{{ service.price }}р</div>
                  <button type="button" class="service-buy-btn" @click="openPurchase(service)">
                    {{ ctaLabel }}
                  </button>
                </div>
              </template>
            </div>

            <p v-if="!org.services.length" class="org-detail__empty">Услуги пока не добавлены</p>
          </section>

          <section class="org-detail__map-reviews">
            <div class="reviews-col">
              <h2 class="org-detail__section-title">Отзывы</h2>

              <div v-if="pagedReviews.length" class="reviews-col__list">
                <div v-for="r in pagedReviews" :key="r.id" class="review-item">
                  <div class="review-item__head">
                    <strong class="review-item__name">{{ r.user_name }}</strong>
                    <span class="review-item__rating">★ {{ r.rating }}</span>
                  </div>
                  <p class="review-item__text">{{ r.text }}</p>
                </div>
              </div>
              <p v-else class="org-detail__empty">Отзывов пока нет</p>

              <div v-if="totalReviewPages > 1" class="reviews-col__pagination">
                <button
                  v-for="p in totalReviewPages"
                  :key="p"
                  type="button"
                  class="reviews-col__page-btn"
                  :class="{ 'reviews-col__page-btn--active': p === reviewPage }"
                  @click="reviewPage = p"
                >
                  {{ p }}
                </button>
              </div>

              <div v-if="authStore.isAuthenticated" class="review-form">
                <p v-if="reviewsStore.myReview?.status === 'pending'" class="review-form__notice">
                  Ваш отзыв на рассмотрении администратора
                </p>
                <p
                  v-else-if="reviewsStore.myReview?.status === 'rejected'"
                  class="review-form__notice review-form__notice--rejected"
                >
                  Предыдущий отзыв был отклонён
                </p>

                <div class="review-form__rating">
                  <span>Оценка:</span>
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    class="review-form__star"
                    :class="{ 'review-form__star--active': n <= reviewDraft.rating }"
                    @click="reviewDraft.rating = n"
                  >
                    ★
                  </button>
                </div>

                <label class="review-form__field">
                  <span>Мой отзыв:</span>
                  <textarea
                    v-model="reviewDraft.text"
                    rows="4"
                    placeholder="Ваш отзыв..."
                  ></textarea>
                </label>

                <button
                  type="button"
                  class="review-form__submit-btn"
                  :disabled="reviewsStore.isSubmitting"
                  @click="submitReview"
                >
                  {{ reviewsStore.isSubmitting ? 'Отправляем...' : 'Отправить' }}
                </button>
              </div>
            </div>

            <div class="map-col">
              <iframe
                v-if="org.latitude && org.longitude"
                class="map-col__frame"
                :src="mapEmbedUrl"
                loading="lazy"
              ></iframe>
              <div v-else class="org-detail__placeholder">
                Организация пока не указала координаты
              </div>
            </div>
          </section>
        </div>
      </div>

      <div v-if="activeService" class="purchase-modal-overlay" @click.self="closePurchase">
        <div class="purchase-modal">
          <h3 class="purchase-modal__title">{{ activeService.name }}</h3>
          <p class="purchase-modal__price">{{ activeService.price }}р</p>

          <template v-if="!submitSuccess">
            <label class="purchase-modal__field">
              <span>Количество</span>
              <input v-model.number="purchaseQty" type="number" min="1" />
            </label>

            <p v-if="submitError" class="purchase-modal__error">{{ submitError }}</p>

            <div class="purchase-modal__actions">
              <button type="button" class="purchase-modal__cancel-btn" @click="closePurchase">
                Отмена
              </button>
              <button
                type="button"
                class="purchase-modal__confirm-btn"
                :disabled="isSubmitting"
                @click="confirmPurchase"
              >
                {{ isSubmitting ? 'Добавляем...' : 'Добавить в корзину' }}
              </button>
            </div>
          </template>

          <template v-else>
            <p class="purchase-modal__success">Услуга добавлена в корзину</p>
            <div class="purchase-modal__actions">
              <button type="button" class="purchase-modal__cancel-btn" @click="closePurchase">
                Продолжить выбор
              </button>
              <router-link :to="{ name: 'office-cart' }" class="purchase-modal__confirm-btn">
                Перейти в корзину
              </router-link>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.org-detail {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding) 64px;
}

.org-detail__back {
  display: inline-block;
  margin-bottom: 20px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-base);
}

.org-detail__back:hover {
  color: var(--color-accent-hover);
}

.org-detail__header {
  display: grid;
  grid-template-columns: 320px 1fr 220px;
  gap: 32px;
  margin-bottom: 32px;
}

.org-detail__main-image {
  width: 100%;
  height: 220px;
  border-radius: var(--radius-md);
  background-color: var(--color-border);
  overflow: hidden;
}

.org-detail__main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.org-detail__thumbs {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.org-detail__thumb {
  width: 60px;
  height: 45px;
  border-radius: var(--radius-sm);
  border: 2px solid transparent;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  background: none;
}

.org-detail__thumb--active {
  border-color: var(--color-accent);
}

.org-detail__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.org-detail__name {
  font-size: var(--font-size-heading);
  color: var(--color-text-primary);
  margin: 0 0 6px;
}

.org-detail__type {
  font-weight: 600;
  color: var(--color-accent-hover);
  margin: 0 0 12px;
}

.org-detail__description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  line-height: 1.5;
}

.org-detail__meta-block {
  margin-bottom: 16px;
}

.org-detail__meta-block h4 {
  margin: 0 0 4px;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.org-detail__meta-block p {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.org-detail__body {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.org-detail__sidenav {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  top: 24px;
}

.org-detail__sidenav-link {
  text-align: left;
  padding: 0 0 6px;
  border: none;
  border-bottom: 2px solid var(--color-accent);
  background: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  width: fit-content;
}

.org-detail__main {
  flex: 1;
  min-width: 0;
}

.org-detail__perks {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.perk-badge {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background-color: rgba(81, 211, 183, 0.15);
  color: var(--color-accent-hover);
  font-weight: 600;
  font-size: 13px;
}

.org-detail__amenities {
  margin-bottom: 32px;
}

.amenities-grid {
  columns: 4;
  column-gap: 24px;
}

.amenity-chip {
  display: block;
  margin-bottom: 8px;
  break-inside: avoid;
  color: var(--color-accent-hover);
  font-size: var(--font-size-base);
  font-weight: 500;
}

.org-detail__section-title {
  display: inline-block;
  font-size: var(--font-size-heading);
  font-weight: 700;
  color: var(--color-text-primary);
  padding-bottom: 6px;
  border-bottom: 2px solid var(--color-text-primary);
  margin: 0 0 16px;
}

.org-detail__services {
  margin-bottom: 40px;
}

.service-section {
  margin-bottom: 28px;
  scroll-margin-top: 20px;
}

.service-section__title {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-accent-hover);
  margin: 0 0 12px;
}

/* обычная услуга */
.service-row {
  display: grid;
  grid-template-columns: 80px 1fr 100px 160px;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.service-row:last-child {
  border-bottom: none;
}

.service-row__thumb {
  width: 80px;
  height: 60px;
  border-radius: var(--radius-sm);
  background-color: var(--color-border);
  overflow: hidden;
}

.service-row__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-row__name {
  font-weight: 700;
  color: var(--color-text-primary);
}

.service-row__description {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.service-row__price {
  font-weight: 700;
  color: var(--color-text-primary);
  text-align: right;
}

/* номер отеля/санатория/спорт-базы */
.room-row {
  display: grid;
  grid-template-columns: 120px 200px 1fr 130px 160px;
  align-items: center;
  gap: 20px;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border);
}

.room-row:last-child {
  border-bottom: none;
}

.room-row__thumb {
  position: relative;
  width: 120px;
  height: 90px;
  border-radius: var(--radius-sm);
  background-color: var(--color-border);
  overflow: hidden;
}

.room-row__thumb-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border: none;
  border-radius: var(--radius-full);
  background-color: rgba(8, 54, 106, 0.55);
  color: var(--color-text-on-dark);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.room-row__thumb-nav--prev {
  left: 4px;
}

.room-row__thumb-nav--next {
  right: 4px;
}

.room-row__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-row__name {
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.room-row__amenities {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  font-size: 13px;
  color: var(--color-accent-hover);
}

.room-row__price {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.room-row__price-amount {
  font-weight: 700;
  font-size: var(--font-size-heading);
  color: var(--color-text-primary);
}

.room-row__price-period {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* тур */
.tour-card {
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
}

.tour-card:last-child {
  border-bottom: none;
}

.tour-card__main {
  display: grid;
  grid-template-columns: 120px 200px 1fr 140px 160px;
  align-items: center;
  gap: 16px;
}

.tour-card__thumb {
  position: relative;
  width: 120px;
  height: 90px;
  border-radius: var(--radius-sm);
  background-color: var(--color-border);
  overflow: hidden;
}

.tour-card__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tour-card__name {
  font-weight: 700;
  color: var(--color-text-primary);
}

.tour-card__dates {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 2px 0 6px;
}

.tour-card__included {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  font-size: 13px;
  color: var(--color-accent-hover);
}

.tour-card__price {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tour-card__price-amount {
  font-weight: 700;
  font-size: var(--font-size-heading);
  color: var(--color-text-primary);
}

.tour-card__price-period {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.tour-card__toggle {
  margin-top: 10px;
  background: none;
  border: none;
  color: var(--color-accent-hover);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.tour-card__itinerary {
  margin-top: 10px;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.tour-card__itinerary p {
  margin: 0;
  padding: 10px 16px;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  background-color: rgba(81, 211, 183, 0.08);
}

.tour-card__itinerary p:nth-child(even) {
  background-color: rgba(81, 211, 183, 0.15);
}

.service-buy-btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--color-accent);
  color: var(--color-text-on-dark);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
  white-space: nowrap;
}

.service-buy-btn:hover {
  background-color: var(--color-accent-hover);
}

.org-detail__map-reviews {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  margin-bottom: 40px;
}

.reviews-col {
  flex: 1;
  min-width: 0;
}

.reviews-col__list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.review-item__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.review-item__name {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.review-item__rating {
  color: var(--color-accent-hover);
  font-weight: 600;
  font-size: 13px;
}

.review-item__text {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  line-height: 1.5;
}

.reviews-col__pagination {
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
}

.reviews-col__page-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  cursor: pointer;
}

.reviews-col__page-btn--active {
  border-color: var(--color-accent);
  color: var(--color-accent-hover);
  font-weight: 700;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-form__notice {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.review-form__notice--rejected {
  color: #e5484d;
}

.review-form__rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.review-form__star {
  background: none;
  border: none;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: var(--color-border);
  padding: 0;
}

.review-form__star--active {
  color: var(--color-accent);
}

.review-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.review-form__field textarea {
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: var(--font-size-base);
  padding: 10px 12px;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  resize: vertical;
}

.review-form__submit-btn {
  align-self: flex-start;
  padding: 10px 28px;
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--color-accent);
  color: var(--color-text-on-dark);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.review-form__submit-btn:hover {
  background-color: var(--color-accent-hover);
}

.review-form__submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.org-detail__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: var(--color-text-primary);
  text-decoration: none;
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: color 0.15s ease;
}

.org-detail__back-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease,
    color 0.15s ease;
}

.org-detail__back:hover .org-detail__back-icon {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-text-on-dark);
  transform: translateX(-3px);
}

.org-detail__back:hover .org-detail__back-label {
  color: var(--color-accent-hover);
}

.map-col {
  flex: 1.1;
  min-width: 0;
}

.map-col__frame {
  width: 100%;
  height: 360px;
  border: none;
  border-radius: var(--radius-md);
}

.org-detail__placeholder {
  padding: 40px;
  text-align: center;
  color: var(--color-text-secondary);
  background-color: var(--color-bg);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
}

.org-detail__empty {
  color: var(--color-text-secondary);
}

.org-detail__error {
  color: #e5484d;
}

.purchase-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(8, 54, 106, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.purchase-modal {
  width: 100%;
  max-width: 360px;
  background-color: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 28px;
}

.purchase-modal__title {
  margin: 0 0 4px;
  font-size: var(--font-size-heading);
  color: var(--color-text-primary);
}

.purchase-modal__price {
  margin: 0 0 20px;
  font-weight: 700;
  color: var(--color-accent-hover);
}

.purchase-modal__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  margin-bottom: 20px;
}

.purchase-modal__field input {
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.purchase-modal__error {
  color: #e5484d;
  font-size: 13px;
  margin: 0 0 12px;
}

.purchase-modal__success {
  color: var(--color-accent-hover);
  font-weight: 600;
  margin-bottom: 20px;
}

.purchase-modal__actions {
  display: flex;
  gap: 12px;
}

.purchase-modal__cancel-btn,
.purchase-modal__confirm-btn {
  flex: 1;
  text-align: center;
  padding: 10px;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}

.purchase-modal__cancel-btn {
  border: 1px solid var(--color-border);
  background-color: var(--color-bg);
  color: var(--color-text-primary);
}

.purchase-modal__confirm-btn {
  border: none;
  background-color: var(--color-accent);
  color: var(--color-text-on-dark);
}

.purchase-modal__confirm-btn:hover {
  background-color: var(--color-accent-hover);
}

.purchase-modal__confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .org-detail__header {
    grid-template-columns: 1fr;
  }
  .org-detail__body {
    flex-direction: column;
  }
  .org-detail__sidenav {
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    position: static;
  }

  .org-detail__map-reviews {
    flex-direction: column;
  }

  .service-row,
  .room-row,
  .tour-card__main {
    grid-template-columns: 60px 1fr auto;
    grid-template-areas:
      'thumb info price'
      'thumb info buy';
    row-gap: 6px;
  }
}
</style>
