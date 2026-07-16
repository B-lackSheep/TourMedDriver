import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

const routes = [
  {
    path: '/',
    name: 'catalog',
    component: () => import('@/views/CatalogView.vue'),
  },
  {
    path: '/organizations/:id',
    name: 'organization-detail',
    component: () => import('@/views/OrganizationDetailView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
  },
  {
    path: '/contacts',
    name: 'contacts',
    component: () => import('@/views/ContactsView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
  },

  {
    path: '/office',
    component: () => import('@/views/office/OfficeView.vue'),
    meta: { requiresAuth: true },
    redirect: { name: 'office-personal-data' },
    children: [
      {
        path: 'personal-data',
        name: 'office-personal-data',
        component: () => import('@/views/office/PersonalDataView.vue'),
      },
      {
        path: 'cart',
        name: 'office-cart',
        component: () => import('@/views/office/CartView.vue'),
      },
      {
        path: 'promocodes',
        name: 'office-promocodes',
        component: () => import('@/views/office/PromocodesView.vue'),
      },
    ],
  },

  {
    path: '/admin',
    component: () => import('@/views/admin/AdminOfficeView.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    redirect: { name: 'admin-moderation' },
    children: [
      {
        path: 'moderation',
        name: 'admin-moderation',
        component: () => import('@/views/admin/AdminModerationView.vue'),
      },
      {
        path: 'stats',
        name: 'admin-stats',
        component: () => import('@/views/admin/AdminStatsView.vue'),
      },
    ],
  },

  {
    path: '/org-office',
    name: 'org-office',
    component: () => import('@/views/org/OrgOfficeView.vue'),
    meta: { requiresAuth: true, role: 'org' },
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const profileStore = useProfileStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.role && authStore.isAuthenticated) {
    if (profileStore.role === null && !profileStore.isLoading) {
      await profileStore.fetchProfile()
    }
    if (to.meta.role !== profileStore.role) {
      return { name: 'catalog' }
    }
  }

  return true
})

export default router
