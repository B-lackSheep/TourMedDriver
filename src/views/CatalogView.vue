<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api/client'
import { ORG_TYPE_LABELS } from '@/constants/orgTypes'
import OrgCard from '@/components/catalog/OrgCard.vue'

const organizations = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const activeType = ref('all')
const selectedDistricts = ref([])
const selectedRegions = ref([])
const selectedCities = ref([])
const page = ref(1)
const pageSize = 6

async function loadOrganizations() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    organizations.value = await api.get('/organizations/')
  } catch (err) {
    errorMessage.value = 'Не удалось загрузить каталог'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadOrganizations)

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ru'))
}

const availableDistricts = computed(() => uniqueSorted(organizations.value.map((o) => o.federal_district)))
const availableRegions = computed(() => uniqueSorted(organizations.value.map((o) => o.region)))
const availableCities = computed(() => uniqueSorted(organizations.value.map((o) => o.city)))

function toggle(list, value) {
  const idx = list.indexOf(value)
  if (idx === -1) list.push(value)
  else list.splice(idx, 1)
  page.value = 1
}

const filteredOrganizations = computed(() => {
  return organizations.value.filter((org) => {
    if (activeType.value !== 'all' && org.org_type !== activeType.value) return false
    if (selectedDistricts.value.length && !selectedDistricts.value.includes(org.federal_district)) return false
    if (selectedRegions.value.length && !selectedRegions.value.includes(org.region)) return false
    if (selectedCities.value.length && !selectedCities.value.includes(org.city)) return false
    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredOrganizations.value.length / pageSize)))

const pagedOrganizations = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredOrganizations.value.slice(start, start + pageSize)
})

function setType(type) {
  activeType.value = type
  page.value = 1
}
</script>

<template>
  <div class="catalog">
    <h1 class="catalog__title">Каталог</h1>

    <nav class="catalog__tabs">
      <button
        type="button"
        class="catalog__tab"
        :class="{ 'catalog__tab--active': activeType === 'all' }"
        @click="setType('all')"
      >
        Все
      </button>
      <button
        v-for="(label, type) in ORG_TYPE_LABELS"
        :key="type"
        type="button"
        class="catalog__tab"
        :class="{ 'catalog__tab--active': activeType === type }"
        @click="setType(type)"
      >
        {{ label }}
      </button>
    </nav>

    <div class="catalog__layout">
      <aside class="catalog__filters">
        <div v-if="availableDistricts.length" class="filter-group">
          <h3 class="filter-group__title">Федеральный округ</h3>
          <label v-for="d in availableDistricts" :key="d" class="filter-group__option">
            <input
              type="checkbox"
              :checked="selectedDistricts.includes(d)"
              @change="toggle(selectedDistricts, d)"
            />
            {{ d }}
          </label>
        </div>

        <div v-if="availableRegions.length" class="filter-group">
          <h3 class="filter-group__title">Область (республика)</h3>
          <label v-for="r in availableRegions" :key="r" class="filter-group__option">
            <input
              type="checkbox"
              :checked="selectedRegions.includes(r)"
              @change="toggle(selectedRegions, r)"
            />
            {{ r }}
          </label>
        </div>

        <div v-if="availableCities.length" class="filter-group">
          <h3 class="filter-group__title">Город</h3>
          <label v-for="c in availableCities" :key="c" class="filter-group__option">
            <input
              type="checkbox"
              :checked="selectedCities.includes(c)"
              @change="toggle(selectedCities, c)"
            />
            {{ c }}
          </label>
        </div>
      </aside>

      <div class="catalog__main">
        <p v-if="isLoading" class="catalog__empty">Загрузка...</p>
        <p v-else-if="errorMessage" class="catalog__error">{{ errorMessage }}</p>
        <p v-else-if="!filteredOrganizations.length" class="catalog__empty">
          Организаций по заданным фильтрам не найдено
        </p>

        <template v-else>
          <div class="catalog__grid">
            <OrgCard v-for="org in pagedOrganizations" :key="org.id" :org="org" />
          </div>

          <div v-if="totalPages > 1" class="catalog__pagination">
            <button
              v-for="p in totalPages"
              :key="p"
              type="button"
              class="catalog__page-btn"
              :class="{ 'catalog__page-btn--active': p === page }"
              @click="page = p"
            >
              {{ p }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalog {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.catalog__title {
  display: inline-block;
  font-size: var(--font-size-heading);
  color: var(--color-text-primary);
  margin: 0 0 24px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-text-primary);
}

.catalog__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 28px;
}

.catalog__tab {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.catalog__tab--active {
  background-color: var(--color-navy);
  color: var(--color-text-on-dark);
  border-color: var(--color-navy);
}

.catalog__layout {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.catalog__filters {
  width: 220px;
  flex-shrink: 0;
}

.filter-group {
  margin-bottom: 24px;
}

.filter-group__title {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 10px;
}

.filter-group__option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin-bottom: 6px;
  cursor: pointer;
}

.filter-group__option input {
  accent-color: var(--color-accent);
  cursor: pointer;
}

.catalog__main {
  flex: 1;
  min-width: 0;
}

.catalog__grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.catalog__pagination {
  display: flex;
  gap: 8px;
  margin-top: 24px;
}

.catalog__page-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  cursor: pointer;
}

.catalog__page-btn--active {
  border-color: var(--color-accent);
  color: var(--color-accent-hover);
  font-weight: 700;
}

.catalog__empty {
  color: var(--color-text-secondary);
}

.catalog__error {
  color: #e5484d;
}

@media (max-width: 720px) {
  .catalog__layout {
    flex-direction: column;
  }
  .catalog__filters {
    width: 100%;
  }
}
</style>
