import AppLayout from '@/layout/AppLayout.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Login from '@/pages/auth/Login.vue'
import CategoryForm from '@/pages/product-categories/CategoryForm.vue'
import CategoryList from '@/pages/product-categories/CategoryList.vue'
import CustomerForm from '@/pages/customers/CustomerForm.vue'
import CustomerList from '@/pages/customers/CustomerList.vue'
import TransactionDetail from '@/pages/transactions/TransactionDetail.vue'
import TransactionList from '@/pages/transactions/TransactionList.vue'
import ProductForm from '@/pages/products/ProductForm.vue'
import ProductList from '@/pages/products/ProductList.vue'
import POSView from '@/pages/pos/POSView.vue'
import { useAuthStore } from '@/stores/auth.store'
import { createRouter, createWebHistory } from 'vue-router'

import Forbidden from '@/pages/auth/Forbidden.vue'
import StockMonitoring from '@/pages/inventory/StockMonitoring.vue'
import StockHistory from '@/pages/inventory/StockHistory.vue'
import SupplierList from '@/pages/suppliers/SupplierList.vue'
import SupplierForm from '@/pages/suppliers/SupplierForm.vue'
import PurchaseList from '@/pages/purchases/PurchaseList.vue'
import PurchaseForm from '@/pages/purchases/PurchaseForm.vue'
import PurchaseDetail from '@/pages/purchases/PurchaseDetail.vue'

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
            path: '/403',
            name: 'forbidden',
            component: Forbidden,
            meta: {
                requiresAuth: true
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
                    path: '/pos',
                    name: 'pos',
                    component: POSView
                },
                {
                    path: '/product-categories',
                    name: 'product-categories',
                    component: CategoryList,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: '/product-categories/create',
                    name: 'product-categories-create',
                    component: CategoryForm,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: '/product-categories/:id/edit',
                    name: 'product-categories-edit',
                    component: CategoryForm,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: '/products',
                    name: 'products',
                    component: ProductList,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: '/products/create',
                    name: 'products-create',
                    component: ProductForm,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: '/products/:id/edit',
                    name: 'products-edit',
                    component: ProductForm,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: '/suppliers',
                    name: 'suppliers',
                    component: SupplierList,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: '/suppliers/create',
                    name: 'suppliers-create',
                    component: SupplierForm,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: '/suppliers/:id/edit',
                    name: 'suppliers-edit',
                    component: SupplierForm,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: '/purchases',
                    name: 'purchases',
                    component: PurchaseList,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: '/purchases/create',
                    name: 'purchases-create',
                    component: PurchaseForm,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: '/purchases/:id',
                    name: 'purchases-detail',
                    component: PurchaseDetail,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: '/stock-monitoring',
                    name: 'stock-monitoring',
                    component: StockMonitoring,
                    meta: { roles: ['ADMIN'] }
                },
                {
                    path: '/stock-history',
                    name: 'stock-history',
                    component: StockHistory,
                    meta: { roles: ['ADMIN'] }
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
                },
                {
                    path: '/transactions',
                    name: 'transactions',
                    component: TransactionList
                },
                {
                    path: '/transactions/:id',
                    name: 'transactions-detail',
                    component: TransactionDetail
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

    // Route level Role Authorization Check
    const requiredRoles = to.meta.roles as string[] | undefined
    if (requiredRoles && requiredRoles.length > 0) {
        if (!auth.hasRole(requiredRoles)) {
            return { name: 'forbidden' }
        }
    }

    // Izinkan navigasi
    return true
})


export default router