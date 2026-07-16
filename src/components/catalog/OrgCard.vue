<script setup>
import { computed } from 'vue'
import { ORG_TYPE_LABELS } from '@/constants/orgTypes'

const props = defineProps({
  org: { type: Object, required: true },
})

const typeLabel = computed(() => ORG_TYPE_LABELS[props.org.org_type] ?? props.org.org_type)

const teaser = computed(() => {
  const text = props.org.description || ''
  return text.length > 110 ? text.slice(0, 110) + '…' : text
})
</script>

<template>
  <router-link class="org-card" :to="{ name: 'organization-detail', params: { id: org.id } }">
    <div class="org-card__thumb">
      <img v-if="org.image" :src="org.image" :alt="org.name" />
    </div>

    <div class="org-card__body">
      <h3 class="org-card__name">{{ org.name }}</h3>
      <p class="org-card__type">{{ typeLabel }}</p>
      <p class="org-card__city">{{ org.city }}</p>
      <p v-if="teaser" class="org-card__teaser">{{ teaser }}</p>
      <span class="org-card__link">Подробнее →</span>
    </div>
  </router-link>
</template>

<style scoped>
.org-card {
  display: flex;
  gap: 20px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s ease;
}

.org-card:hover {
  border-color: var(--color-accent);
}

.org-card__thumb {
  width: 180px;
  height: 130px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background-color: var(--color-border);
  overflow: hidden;
}

.org-card__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.org-card__body {
  min-width: 0;
}

.org-card__name {
  margin: 0 0 4px;
  font-size: var(--font-size-heading);
  color: var(--color-accent-hover);
}

.org-card__type {
  margin: 0 0 2px;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
}

.org-card__city {
  margin: 0 0 8px;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.org-card__teaser {
  margin: 0 0 8px;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.org-card__link {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-accent-hover);
}
</style>
