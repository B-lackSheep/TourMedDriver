<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api/client'

const stats = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

async function loadStats() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    stats.value = await api.get('/admin-stats/')
  } catch (err) {
    errorMessage.value = 'Не удалось загрузить статистику'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadStats)
</script>

<template>
  <div class="stats">
    <p v-if="isLoading" class="stats__empty">Загрузка...</p>
    <p v-else-if="errorMessage" class="stats__error">{{ errorMessage }}</p>

    <template v-else>
      <div v-for="row in stats" :key="row.org_name" class="stats-row">
        <div class="stats-row__name">{{ row.org_name }}</div>
        <div class="stats-row__count">{{ row.orders_count }} заказ(ов)</div>
        <div class="stats-row__rating">
          <template v-if="row.avg_rating">★ {{ row.avg_rating }}</template>
          <template v-else>—</template>
        </div>
        <div class="stats-row__sum">{{ row.total_sum }}р</div>
      </div>

      <p v-if="!stats.length" class="stats__empty">Данных пока нет</p>
    </template>
  </div>
</template>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: 1fr 140px 100px 120px;
  align-items: center;
  gap: 20px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.stats-row:last-child {
  border-bottom: none;
}

.stats-row__name {
  font-weight: 700;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.stats-row__count {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.stats-row__rating {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-accent-hover);
  text-align: center;
}

.stats-row__sum {
  font-weight: 700;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  text-align: right;
}

.stats__empty {
  color: var(--color-text-secondary);
}

.stats__error {
  color: #e5484d;
}
</style>
