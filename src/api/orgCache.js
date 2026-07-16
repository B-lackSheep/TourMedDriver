import { api } from '@/api/client'

// простой кэш организаций в рамках сессии, чтобы не дёргать
// /organizations/{id}/ повторно для каждой услуги в каждом заказе
const cache = new Map()

async function getOrganization(id) {
  if (!id) return null
  if (cache.has(id)) return cache.get(id)
  const promise = api.get(`/organizations/${id}/`)
  cache.set(id, promise)
  const org = await promise
  cache.set(id, org)
  return org
}

export async function getOrganizationsByIds(ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean))]
  const orgs = await Promise.all(uniqueIds.map((id) => getOrganization(id)))
  const map = new Map()
  uniqueIds.forEach((id, idx) => map.set(id, orgs[idx]))
  return map
}
