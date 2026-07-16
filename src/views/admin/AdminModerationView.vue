<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api/client'
import { ORG_TYPE_LABELS } from '@/constants/orgTypes'

const submissions = ref([])
const organizations = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

async function loadAll() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [subs, orgs] = await Promise.all([
      api.get('/admin/submissions/'),
      api.get('/organizations/'),
    ])
    submissions.value = subs
    organizations.value = orgs
  } catch (err) {
    errorMessage.value = 'Не удалось загрузить данные модерации'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadAll)

async function approveSubmission(sub) {
  try {
    await api.post(`/admin/submissions/${sub.id}/approve/`, {})
    await loadAll()
  } catch (err) {
    console.error(err)
  }
}

async function rejectSubmission(sub) {
  const comment = prompt('Комментарий к отклонению (необязательно):') ?? ''
  try {
    await api.post(`/admin/submissions/${sub.id}/reject/`, { comment })
    await loadAll()
  } catch (err) {
    console.error(err)
  }
}

async function quickApprove(org) {
  try {
    const updated = await api.patch(`/organizations/${org.id}/`, { is_verified: true })
    org.is_verified = updated.is_verified
  } catch (err) {
    console.error(err)
  }
}

async function removeOrg(org) {
  if (!confirm(`Удалить "${org.name}" из каталога?`)) return
  try {
    await api.delete(`/organizations/${org.id}/`)
    organizations.value = organizations.value.filter((o) => o.id !== org.id)
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <div class="moderation">
    <p v-if="isLoading" class="moderation__empty">Загрузка...</p>
    <p v-else-if="errorMessage" class="moderation__error">{{ errorMessage }}</p>

    <template v-else>
      <section class="moderation__section">
        <h2 class="moderation__section-title">Заявки на рассмотрении ({{ submissions.length }})</h2>

        <div v-for="sub in submissions" :key="sub.id" class="moderation-row">
          <div class="moderation-row__info">
            <div class="moderation-row__name">
              {{ sub.name }}
              <span class="moderation-row__badge">{{ sub.organization ? 'правка' : 'новая' }}</span>
            </div>
            <div class="moderation-row__meta">
              {{ ORG_TYPE_LABELS[sub.org_type] ?? sub.org_type }} · {{ sub.city }} · услуг:
              {{ sub.services_payload.length }}
            </div>
          </div>

          <div class="moderation-row__actions">
            <button
              type="button"
              class="moderation-row__approve-btn"
              @click="approveSubmission(sub)"
            >
              Одобрить
            </button>
            <button type="button" class="moderation-row__reject-btn" @click="rejectSubmission(sub)">
              Отклонить
            </button>
          </div>
        </div>

        <p v-if="!submissions.length" class="moderation__empty">Заявок пока нет</p>
      </section>

      <section class="moderation__section">
        <h2 class="moderation__section-title">
          Организации в каталоге ({{ organizations.length }})
        </h2>

        <div v-for="org in organizations" :key="org.id" class="moderation-row">
          <div class="moderation-row__info">
            <div class="moderation-row__name">{{ org.name }}</div>
            <div class="moderation-row__meta">
              {{ ORG_TYPE_LABELS[org.org_type] ?? org.org_type }} · {{ org.city }} ·
              {{ org.is_verified ? 'Подтверждена' : 'Не подтверждена' }}
            </div>
          </div>

          <div class="moderation-row__actions">
            <button
              v-if="!org.is_verified"
              type="button"
              class="moderation-row__approve-btn"
              @click="quickApprove(org)"
            >
              Подтвердить
            </button>
            <button type="button" class="moderation-row__reject-btn" @click="removeOrg(org)">
              Удалить
            </button>
          </div>
        </div>

        <p v-if="!organizations.length" class="moderation__empty">Организаций пока нет</p>
      </section>
    </template>
  </div>
</template>

<style scoped>
.moderation__section {
  margin-bottom: 32px;
}

.moderation__section-title {
  display: inline-block;
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-text-primary);
  padding-bottom: 6px;
  border-bottom: 2px solid var(--color-text-primary);
  margin: 0 0 14px;
}

.moderation-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.moderation-row:last-child {
  border-bottom: none;
}

.moderation-row__name {
  font-weight: 700;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.moderation-row__badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-accent-hover);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  padding: 1px 6px;
  margin-left: 6px;
}

.moderation-row__meta {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.moderation-row__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.moderation-row__approve-btn,
.moderation-row__reject-btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
}

.moderation-row__approve-btn {
  background-color: var(--color-accent);
  color: var(--color-text-on-dark);
}

.moderation-row__approve-btn:hover {
  background-color: var(--color-accent-hover);
}

.moderation-row__reject-btn {
  background-color: var(--color-bg);
  color: #e5484d;
  border: 1px solid #e5484d;
}

.moderation__empty,
.moderation__error {
  color: var(--color-text-secondary);
}

.moderation__error {
  color: #e5484d;
}
</style>
