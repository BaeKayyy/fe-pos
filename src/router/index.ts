import AppLayout from '@/layout/AppLayout.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Login from '@/pages/auth/Login.vue'
import CategoryForm from '@/pages/product-categories/CategoryForm.vue'
import CategoryList from '@/pages/product-categories/CategoryList.vue'
import CustomerForm from '@/pages/customers/CustomerForm.vue'
import CustomerList from '@/pages/customers/CustomerList.vue'
import ProductForm from '@/pages/products/ProductForm.vue'
import ProductList from '@/pages/products/ProductList.vue'
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
                },
                {
                    path: '/product-categories/create',
                    name: 'product-categories-create',
                    component: CategoryForm
                },
                {
                    path: '/product-categories/:id/edit',
                    name: 'product-categories-edit',
                    component: CategoryForm
                },
                {
                    path: '/products',
                    name: 'products',
                    component: ProductList
                },
                {
                    path: '/products/create',
                    name: 'products-create',
                    component: ProductForm
                },
                {
                    path: '/products/:id/edit',
                    name: 'products-edit',
                    component: ProductForm
                },
                {
                    path: '/customers',
                    name: 'customers',
                    component: CustomerList
                },
                {
                    path: '/customers/create',
                    name: 'customers-create',
                    component: CustomerForm
                },
                {
                    path: '/customers/:id/edit',
                    name: 'customers-edit',
                    component: CustomerForm
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