import AppLayout from '@/layout/AppLayout.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Login from '@/pages/auth/Login.vue'
import CategoryList from '@/pages/product-categories/CategoryList.vue'
import { useAuthStore } from '@/stores/auth.store'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),

    routes: [
        {
            path: '/login',
            name: 'login',
            component: Login,
            meta: {
                guest: true
            }
        },
        {
            path: '/',
            component: AppLayout,
            meta: {
                requiresAuth: true
            },
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: Dashboard
                },
                {
                    path: '/product-categories',
                    name: 'product-categories',
                    component: CategoryList
                }
            ]
        }
    ]
})

router.beforeEach(async (to) => {
    const auth = useAuthStore()

    // Kalau sudah login tapi user belum tersedia,
    // ambil data user terlebih dahulu
    if (auth.isAuthenticated && !auth.user) {
        try {
            await auth.fetchUser()
        } catch {
            auth.logout()
            return { name: 'login' }
        }
    }

    // Route yang membutuhkan login
    // tapi user belum login
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return { name: 'login' }
    }

    // Route guest (/login)
    // tapi user sudah login
    if (to.meta.guest && auth.isAuthenticated) {
        return { name: 'dashboard' }
    }

    // Izinkan navigasi
    return true
})

export default router