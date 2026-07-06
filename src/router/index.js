import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'catalog',
    component: () => import('@/views/CatalogView.vue'),
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
    meta: { requiresAuth: true },
    redirect: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        name: 'admin-organizations',
        component: () => import('@/views/admin/AdminOrganizationsView.vue'),
      },
    ],
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

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.role && to.meta.role !== authStore.user?.role) {
    return { name: 'catalog' }
  }

  return true
})

export default router
