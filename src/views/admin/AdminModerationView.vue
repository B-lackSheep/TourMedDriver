<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from '@/api/client'
import { ORG_TYPE_LABELS } from '@/constants/orgTypes'

const submissions = ref([])
const organizations = ref([])
const reviews = ref([])
const allReviews = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

async function reloadEverything() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [subs, orgs, pending, all] = await Promise.all([
      api.get('/admin/submissions/'),
      api.get('/organizations/'),
      api.get('/admin/reviews/'),
      api.get('/admin/reviews/all/'),
    ])
    submissions.value = subs
    organizations.value = orgs
    reviews.value = pending
    allReviews.value = all
  } catch (err) {
    errorMessage.value = 'Не удалось загрузить данные модерации'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(reloadEverything)

//предпросмотр заявки
const expandedSubmissionId = ref(null)

function toggleSubmissionPreview(sub) {
  expandedSubmissionId.value = expandedSubmissionId.value === sub.id ? null : sub.id
}

//заявки на организацию
async function approveSubmission(sub) {
  try {
    await api.post(`/admin/submissions/${sub.id}/approve/`, {})
    await reloadEverything()
  } catch (err) {
    console.error(err)
  }
}

async function rejectSubmission(sub) {
  const comment = prompt('Комментарий к отклонению (необязательно):') ?? ''
  try {
    await api.post(`/admin/submissions/${sub.id}/reject/`, { comment })
    await reloadEverything()
  } catch (err) {
    console.error(err)
  }
}

//отзывы на рассмотрении
async function approveReview(review) {
  await api.post(`/admin/reviews/${review.id}/approve/`, {})
  await reloadEverything()
}

async function rejectReview(review) {
  await api.post(`/admin/reviews/${review.id}/reject/`, {})
  await reloadEverything()
}

//удаление любого отзыва
async function deleteReview(review) {
  if (!confirm('Удалить этот отзыв?')) return
  try {
    await api.delete(`/admin/reviews/${review.id}/delete/`)
    await reloadEverything()
  } catch (err) {
    console.error(err)
  }
}

//организации в каталоге
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

//редактирование организации админом
const editingOrg = ref(null)
const editForm = reactive({
  name: '',
  description: '',
  address: '',
  phone: '',
  working_hours: '',
  perksText: '',
  amenitiesText: '',
  latitude: '',
  longitude: '',
})
const editImageFile = ref(null)
const isSavingOrg = ref(false)

function openOrgEdit(org) {
  editingOrg.value = org
  editForm.name = org.name
  editForm.description = org.description
  editForm.address = org.address
  editForm.phone = org.phone
  editForm.working_hours = org.working_hours
  editForm.perksText = (org.perks || []).join(', ')
  editForm.amenitiesText = (org.general_amenities || []).join(', ')
  editForm.latitude = org.latitude ?? ''
  editForm.longitude = org.longitude ?? ''
  editImageFile.value = null
}

function closeOrgEdit() {
  editingOrg.value = null
}

function onEditImageChange(e) {
  editImageFile.value = e.target.files[0] || null
}

async function saveOrgEdit() {
  isSavingOrg.value = true
  try {
    const fd = new FormData()
    fd.append('name', editForm.name)
    fd.append('description', editForm.description)
    fd.append('address', editForm.address)
    fd.append('phone', editForm.phone)
    fd.append('working_hours', editForm.working_hours)
    fd.append(
      'perks',
      JSON.stringify(
        editForm.perksText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    )
    fd.append(
      'general_amenities',
      JSON.stringify(
        editForm.amenitiesText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    )
    if (editForm.latitude) fd.append('latitude', editForm.latitude)
    if (editForm.longitude) fd.append('longitude', editForm.longitude)
    if (editImageFile.value) fd.append('image', editImageFile.value)

    const updated = await api.patchForm(`/organizations/${editingOrg.value.id}/`, fd)
    Object.assign(editingOrg.value, updated)
    closeOrgEdit()
  } catch (err) {
    console.error(err)
  } finally {
    isSavingOrg.value = false
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

        <div v-for="sub in submissions" :key="sub.id" class="moderation-item">
          <div class="moderation-row">
            <div class="moderation-row__info">
              <div class="moderation-row__name">
                {{ sub.name }}
                <span class="moderation-row__badge">{{
                  sub.organization ? 'правка' : 'новая'
                }}</span>
              </div>
              <div class="moderation-row__meta">
                {{ ORG_TYPE_LABELS[sub.org_type] ?? sub.org_type }} · {{ sub.city }} · услуг:
                {{ sub.services_payload.length }}
              </div>
            </div>

            <div class="moderation-row__actions">
              <button
                type="button"
                class="moderation-row__preview-btn"
                @click="toggleSubmissionPreview(sub)"
              >
                {{ expandedSubmissionId === sub.id ? 'Скрыть' : 'Просмотр' }}
              </button>
              <button
                type="button"
                class="moderation-row__approve-btn"
                @click="approveSubmission(sub)"
              >
                Одобрить
              </button>
              <button
                type="button"
                class="moderation-row__reject-btn"
                @click="rejectSubmission(sub)"
              >
                Отклонить
              </button>
            </div>
          </div>

          <div v-if="expandedSubmissionId === sub.id" class="submission-preview">
            <img
              v-if="sub.image"
              :src="sub.image"
              :alt="sub.name"
              class="submission-preview__image"
            />
            <p>
              <strong>Адрес:</strong> {{ sub.federal_district }}, {{ sub.region }}, г.
              {{ sub.city }},
              {{ sub.address }}
            </p>
            <p><strong>Телефон:</strong> {{ sub.phone }}</p>
            <p v-if="sub.working_hours"><strong>Время работы:</strong> {{ sub.working_hours }}</p>
            <p v-if="sub.description">{{ sub.description }}</p>
            <p v-if="sub.perks.length"><strong>Преференции:</strong> {{ sub.perks.join(', ') }}</p>
            <p v-if="sub.general_amenities.length">
              <strong>Удобства:</strong> {{ sub.general_amenities.join(', ') }}
            </p>

            <table v-if="sub.services_payload.length" class="submission-preview__services">
              <tr v-for="(s, idx) in sub.services_payload" :key="idx">
                <td>{{ s.category || '—' }}</td>
                <td>{{ s.name }}</td>
                <td>{{ s.price }}р</td>
              </tr>
            </table>
          </div>
        </div>

        <p v-if="!submissions.length" class="moderation__empty">Заявок пока нет</p>
      </section>

      <section class="moderation__section">
        <h2 class="moderation__section-title">Отзывы на рассмотрении ({{ reviews.length }})</h2>

        <div v-for="r in reviews" :key="r.id" class="moderation-row">
          <div class="moderation-row__info">
            <div class="moderation-row__name">
              {{ r.user_name }} · ★ {{ r.rating }} · {{ r.organization_name }}
            </div>
            <div class="moderation-row__meta">{{ r.text || 'без текста' }}</div>
          </div>
          <div class="moderation-row__actions">
            <button type="button" class="moderation-row__approve-btn" @click="approveReview(r)">
              Одобрить
            </button>
            <button type="button" class="moderation-row__reject-btn" @click="rejectReview(r)">
              Отклонить
            </button>
          </div>
        </div>

        <p v-if="!reviews.length" class="moderation__empty">Отзывов на рассмотрении нет</p>
      </section>

      <section class="moderation__section">
        <h2 class="moderation__section-title">Все отзывы ({{ allReviews.length }})</h2>

        <div v-for="r in allReviews" :key="r.id" class="moderation-row">
          <div class="moderation-row__info">
            <div class="moderation-row__name">
              {{ r.user_name }} · ★ {{ r.rating }} · {{ r.organization_name }}
              <span
                class="moderation-row__badge"
                :class="{
                  'moderation-row__badge--rejected': r.status === 'rejected',
                  'moderation-row__badge--pending': r.status === 'pending',
                }"
              >
                {{
                  r.status === 'approved'
                    ? 'опубликован'
                    : r.status === 'pending'
                      ? 'на рассмотрении'
                      : 'отклонён'
                }}
              </span>
            </div>
            <div class="moderation-row__meta">{{ r.text || 'без текста' }}</div>
          </div>
          <div class="moderation-row__actions">
            <button type="button" class="moderation-row__reject-btn" @click="deleteReview(r)">
              Удалить
            </button>
          </div>
        </div>

        <p v-if="!allReviews.length" class="moderation__empty">Отзывов пока нет</p>
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
            <button type="button" class="moderation-row__preview-btn" @click="openOrgEdit(org)">
              Редактировать
            </button>
            <button type="button" class="moderation-row__reject-btn" @click="removeOrg(org)">
              Удалить
            </button>
          </div>
        </div>

        <p v-if="!organizations.length" class="moderation__empty">Организаций пока нет</p>
      </section>
    </template>

    <div v-if="editingOrg" class="edit-modal-overlay" @click.self="closeOrgEdit">
      <div class="edit-modal">
        <h3 class="edit-modal__title">{{ editingOrg.name }}</h3>

        <label class="edit-modal__field">
          <span>Название</span>
          <input v-model="editForm.name" type="text" />
        </label>

        <label class="edit-modal__field">
          <span>Описание</span>
          <textarea v-model="editForm.description" rows="3"></textarea>
        </label>

        <label class="edit-modal__field">
          <span>Адрес</span>
          <input v-model="editForm.address" type="text" />
        </label>

        <label class="edit-modal__field">
          <span>Телефон</span>
          <input v-model="editForm.phone" type="text" />
        </label>

        <label class="edit-modal__field">
          <span>Время работы</span>
          <input v-model="editForm.working_hours" type="text" />
        </label>

        <label class="edit-modal__field">
          <span>Преференции (через запятую)</span>
          <input v-model="editForm.perksText" type="text" />
        </label>

        <label class="edit-modal__field">
          <span>Удобства (через запятую)</span>
          <input v-model="editForm.amenitiesText" type="text" />
        </label>

        <label class="edit-modal__field">
          <span>Широта</span>
          <input v-model="editForm.latitude" type="number" step="0.000001" />
        </label>

        <label class="edit-modal__field">
          <span>Долгота</span>
          <input v-model="editForm.longitude" type="number" step="0.000001" />
        </label>

        <label class="edit-modal__field">
          <span>Заменить фото</span>
          <input type="file" accept="image/*" @change="onEditImageChange" />
        </label>

        <div class="edit-modal__actions">
          <button type="button" class="edit-modal__cancel-btn" @click="closeOrgEdit">Отмена</button>
          <button
            type="button"
            class="edit-modal__save-btn"
            :disabled="isSavingOrg"
            @click="saveOrgEdit"
          >
            {{ isSavingOrg ? 'Сохраняем...' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>
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

.moderation-item {
  border-bottom: 1px solid var(--color-border);
}

.moderation-item:last-child {
  border-bottom: none;
}

.moderation-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.moderation-item .moderation-row {
  border-bottom: none;
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

.moderation-row__badge--pending {
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.moderation-row__badge--rejected {
  color: #e5484d;
  border-color: #e5484d;
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
.moderation-row__reject-btn,
.moderation-row__preview-btn {
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

.moderation-row__preview-btn {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.moderation__empty,
.moderation__error {
  color: var(--color-text-secondary);
}

.moderation__error {
  color: #e5484d;
}

.submission-preview {
  padding: 0 0 16px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.submission-preview__image {
  max-width: 240px;
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.submission-preview__services {
  width: 100%;
  margin-top: 8px;
  border-collapse: collapse;
}

.submission-preview__services td {
  padding: 4px 8px;
  border-bottom: 1px solid var(--color-border);
}

.edit-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(8, 54, 106, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.edit-modal {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 28px;
}

.edit-modal__title {
  margin: 0 0 20px;
  font-size: var(--font-size-heading);
  color: var(--color-text-primary);
}

.edit-modal__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  margin-bottom: 14px;
}

.edit-modal__field input,
.edit-modal__field textarea {
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: var(--font-size-base);
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
}

.edit-modal__actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.edit-modal__cancel-btn,
.edit-modal__save-btn {
  flex: 1;
  padding: 10px;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
}

.edit-modal__cancel-btn {
  border: 1px solid var(--color-border);
  background-color: var(--color-bg);
  color: var(--color-text-primary);
}

.edit-modal__save-btn {
  border: none;
  background-color: var(--color-accent);
  color: var(--color-text-on-dark);
}

.edit-modal__save-btn:hover {
  background-color: var(--color-accent-hover);
}

.edit-modal__save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
