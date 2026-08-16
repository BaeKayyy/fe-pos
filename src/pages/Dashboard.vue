<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Button, Select, Skeleton } from 'primevue';
import SalesChart from '@/components/SalesChart.vue';
import {
    getDashboardSummary,
    getDashboardSales,
    getDashboardLowStock,
    getDashboardTopProducts,
    getDashboardRecentTransactions
} from '@/api/dashboard.api';
import type {
    DashboardSummary,
    SalesOverview,
    LowStockProduct,
    TopProduct,
    RecentTransaction
} from '@/types/dashboard';

const router = useRouter();

// Filters & Loading
const selectedPeriod = ref('today');
const salesPeriod = ref('7d');
const isLoading = ref(true);
const isRefreshing = ref(false);

const periodOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'This Month', value: 'this_month' }
];

// Data state
const summary = ref<DashboardSummary | null>(null);
const salesOverview = ref<SalesOverview | null>(null);
const lowStockProducts = ref<LowStockProduct[]>([]);
const topProducts = ref<TopProduct[]>([]);
const recentTransactions = ref<RecentTransaction[]>([]);

// Formatters
const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(val);
};

const goToProducts = () => {
    router.push('/products');
};

const goToTransactions = () => {
    router.push('/transactions');
};

const fetchSalesData = async () => {
    try {
        const salesRes = await getDashboardSales(salesPeriod.value);
        salesOverview.value = salesRes.data.data;
    } catch (err) {
        console.error('Failed to fetch sales overview:', err);
    }
};

const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
        isRefreshing.value = true;
    } else {
        isLoading.value = true;
    }

    try {
        const [sumRes, salesRes, lowRes, topRes, recentRes] = await Promise.all([
            getDashboardSummary(selectedPeriod.value),
            getDashboardSales(salesPeriod.value),
            getDashboardLowStock(5),
            getDashboardTopProducts(selectedPeriod.value, 5),
            getDashboardRecentTransactions(5)
        ]);

        summary.value = sumRes.data.data;
        salesOverview.value = salesRes.data.data;
        lowStockProducts.value = lowRes.data.data;
        topProducts.value = topRes.data.data;
        recentTransactions.value = recentRes.data.data;
    } catch (err) {
        console.error('Failed to load dashboard data:', err);
    } finally {
        isLoading.value = false;
        isRefreshing.value = false;
    }
};

watch(selectedPeriod, () => {
    salesPeriod.value = selectedPeriod.value;
    fetchDashboardData();
});

watch(salesPeriod, () => {
    fetchSalesData();
});

onMounted(() => {
    fetchDashboardData();
});
</script>

<template>
    <div class="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 tracking-tight">Dashboard</h1>
                <p class="text-sm text-surface-500 mt-0.5">Overview of your store performance</p>
            </div>
            <div class="flex items-center gap-3">
                <Select
                    v-model="selectedPeriod"
                    :options="periodOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-44 !rounded-lg"
                />
                <Button
                    type="button"
                    severity="secondary"
                    outlined
                    @click="fetchDashboardData(true)"
                    :disabled="isLoading || isRefreshing"
                    class="!rounded-lg !px-3"
                >
                    <i :class="['pi pi-refresh text-sm', { 'animate-spin': isRefreshing }]"></i>
                    <span class="hidden sm:inline text-sm font-medium">Refresh</span>
                </Button>
            </div>
        </div>

        <!-- Row 1: KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <!-- Card 1: Total Sales -->
            <div v-if="isLoading" class="bg-white p-5 rounded-xl border border-surface-200">
                <Skeleton width="40%" height="1rem" class="mb-3" />
                <Skeleton width="70%" height="2rem" class="mb-2" />
                <Skeleton width="50%" height="0.875rem" />
            </div>
            <div v-else class="bg-white p-5 rounded-xl border border-surface-200 shadow-xs flex flex-col justify-between">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total Sales</span>
                    <div class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <i class="pi pi-wallet text-base"></i>
                    </div>
                </div>
                <div>
                    <div class="text-2xl font-bold text-surface-900">
                        {{ formatCurrency(summary?.total_sales || 0) }}
                    </div>
                    <div class="flex items-center gap-1.5 mt-2 text-xs">
                        <template v-if="summary?.sales_growth_percentage !== null && summary?.sales_growth_percentage !== undefined">
                            <span
                                :class="[
                                    'font-semibold flex items-center gap-0.5',
                                    summary.sales_growth_percentage >= 0 ? 'text-emerald-600' : 'text-red-500'
                                ]"
                            >
                                <i :class="summary.sales_growth_percentage >= 0 ? 'pi pi-arrow-up-right' : 'pi pi-arrow-down-right'"></i>
                                {{ Math.abs(summary.sales_growth_percentage) }}%
                            </span>
                            <span class="text-surface-400">{{ summary.sales_growth_label }}</span>
                        </template>
                        <template v-else>
                            <span class="text-surface-400">Current period performance</span>
                        </template>
                    </div>
                </div>
            </div>

            <!-- Card 2: Transactions -->
            <div v-if="isLoading" class="bg-white p-5 rounded-xl border border-surface-200">
                <Skeleton width="40%" height="1rem" class="mb-3" />
                <Skeleton width="70%" height="2rem" class="mb-2" />
                <Skeleton width="50%" height="0.875rem" />
            </div>
            <div v-else class="bg-white p-5 rounded-xl border border-surface-200 shadow-xs flex flex-col justify-between">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-semibold text-surface-500 uppercase tracking-wider">Transactions</span>
                    <div class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <i class="pi pi-receipt text-base"></i>
                    </div>
                </div>
                <div>
                    <div class="text-2xl font-bold text-surface-900">
                        {{ summary?.total_transactions || 0 }}
                    </div>
                    <div class="flex items-center gap-1.5 mt-2 text-xs">
                        <template v-if="summary?.transactions_growth_percentage !== null && summary?.transactions_growth_percentage !== undefined">
                            <span
                                :class="[
                                    'font-semibold flex items-center gap-0.5',
                                    summary.transactions_growth_percentage >= 0 ? 'text-emerald-600' : 'text-red-500'
                                ]"
                            >
                                <i :class="summary.transactions_growth_percentage >= 0 ? 'pi pi-arrow-up-right' : 'pi pi-arrow-down-right'"></i>
                                {{ Math.abs(summary.transactions_growth_percentage) }}%
                            </span>
                            <span class="text-surface-400">{{ summary.transactions_growth_label }}</span>
                        </template>
                        <template v-else>
                            <span class="text-surface-400">Completed orders</span>
                        </template>
                    </div>
                </div>
            </div>

            <!-- Card 3: Products -->
            <div v-if="isLoading" class="bg-white p-5 rounded-xl border border-surface-200">
                <Skeleton width="40%" height="1rem" class="mb-3" />
                <Skeleton width="70%" height="2rem" class="mb-2" />
                <Skeleton width="50%" height="0.875rem" />
            </div>
            <div v-else class="bg-white p-5 rounded-xl border border-surface-200 shadow-xs flex flex-col justify-between">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-semibold text-surface-500 uppercase tracking-wider">Products</span>
                    <div class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <i class="pi pi-box text-base"></i>
                    </div>
                </div>
                <div>
                    <div class="text-2xl font-bold text-surface-900">
                        {{ summary?.total_products || 0 }}
                    </div>
                    <div class="flex items-center gap-1.5 mt-2 text-xs">
                        <span v-if="(summary?.low_stock_count || 0) > 0" class="text-amber-600 font-semibold flex items-center gap-1">
                            <i class="pi pi-exclamation-circle"></i>
                            {{ summary?.low_stock_count }} low stock
                        </span>
                        <span v-else class="text-emerald-600 font-medium">All stock healthy</span>
                    </div>
                </div>
            </div>

            <!-- Card 4: Customers -->
            <div v-if="isLoading" class="bg-white p-5 rounded-xl border border-surface-200">
                <Skeleton width="40%" height="1rem" class="mb-3" />
                <Skeleton width="70%" height="2rem" class="mb-2" />
                <Skeleton width="50%" height="0.875rem" />
            </div>
            <div v-else class="bg-white p-5 rounded-xl border border-surface-200 shadow-xs flex flex-col justify-between">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-semibold text-surface-500 uppercase tracking-wider">Customers</span>
                    <div class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <i class="pi pi-users text-base"></i>
                    </div>
                </div>
                <div>
                    <div class="text-2xl font-bold text-surface-900">
                        {{ summary?.total_customers || 0 }}
                    </div>
                    <div class="flex items-center gap-1.5 mt-2 text-xs">
                        <template v-if="summary?.customers_growth_percentage !== null && summary?.customers_growth_percentage !== undefined">
                            <span
                                :class="[
                                    'font-semibold flex items-center gap-0.5',
                                    summary.customers_growth_percentage >= 0 ? 'text-emerald-600' : 'text-red-500'
                                ]"
                            >
                                <i :class="summary.customers_growth_percentage >= 0 ? 'pi pi-arrow-up-right' : 'pi pi-arrow-down-right'"></i>
                                {{ Math.abs(summary.customers_growth_percentage) }}%
                            </span>
                            <span class="text-surface-400">{{ summary.customers_growth_label }}</span>
                        </template>
                        <template v-else>
                            <span class="text-surface-400">Total registered</span>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <!-- Row 2: Sales Overview Chart + Low Stock -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left: Sales Overview Chart (2 cols) -->
            <div class="lg:col-span-2">
                <div v-if="isLoading" class="bg-white p-6 rounded-xl border border-surface-200 h-[340px]">
                    <Skeleton width="40%" height="1.5rem" class="mb-4" />
                    <Skeleton width="100%" height="220px" />
                </div>
                <SalesChart
                    v-else
                    :points="salesOverview?.points || []"
                    :total-sales="salesOverview?.total_sales || 0"
                    v-model:period="salesPeriod"
                    :is-loading="isLoading"
                />
            </div>

            <!-- Right: Low Stock Card -->
            <div class="lg:col-span-1">
                <div v-if="isLoading" class="bg-white p-6 rounded-xl border border-surface-200 h-[340px] flex flex-col justify-between">
                    <div>
                        <Skeleton width="50%" height="1.25rem" class="mb-4" />
                        <div class="space-y-3">
                            <Skeleton width="100%" height="2.5rem" class="rounded-lg" />
                            <Skeleton width="100%" height="2.5rem" class="rounded-lg" />
                            <Skeleton width="100%" height="2.5rem" class="rounded-lg" />
                        </div>
                    </div>
                </div>
                <div v-else class="bg-white p-6 rounded-xl border border-surface-200 shadow-xs flex flex-col justify-between h-full">
                    <div>
                        <!-- Header -->
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-base font-semibold text-surface-900">Low Stock</h3>
                            <button
                                @click="goToProducts"
                                class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                View all products
                                <i class="pi pi-chevron-right text-[10px]"></i>
                            </button>
                        </div>

                        <!-- Product List -->
                        <div v-if="lowStockProducts.length > 0" class="divide-y divide-surface-100">
                            <div
                                v-for="product in lowStockProducts"
                                :key="product.id"
                                class="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                            >
                                <div class="flex items-center gap-3 min-w-0">
                                    <div class="w-10 h-10 rounded-lg bg-surface-100 border border-surface-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        <img
                                            v-if="product.image"
                                            :src="product.image"
                                            :alt="product.name"
                                            class="w-full h-full object-cover"
                                        />
                                        <i v-else class="pi pi-box text-surface-400 text-lg"></i>
                                    </div>
                                    <div class="min-w-0">
                                        <div class="text-sm font-medium text-surface-900 truncate">
                                            {{ product.name }}
                                        </div>
                                        <div class="text-xs text-surface-400 truncate">
                                            {{ product.category_name || 'General' }}
                                        </div>
                                    </div>
                                </div>

                                <div class="flex-shrink-0 text-right">
                                    <span
                                        v-if="product.stock === 0"
                                        class="px-2 py-0.5 text-xs font-semibold text-red-600 bg-red-50 rounded"
                                    >
                                        Out of stock
                                    </span>
                                    <span v-else class="text-sm font-bold text-surface-900">
                                        {{ product.stock }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-else class="py-12 text-center">
                            <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                                <i class="pi pi-check-circle text-xl"></i>
                            </div>
                            <div class="text-sm font-semibold text-surface-900">All stocks healthy</div>
                            <p class="text-xs text-surface-400 mt-1">No products below threshold</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Row 3: Recent Transactions + Top Products -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left: Recent Transactions (2 cols, populated in Commit 9) -->
            <div class="lg:col-span-2" id="recent-transactions-placeholder">
                <div v-if="isLoading" class="bg-white p-6 rounded-xl border border-surface-200 h-[320px]">
                    <Skeleton width="40%" height="1.25rem" class="mb-4" />
                    <Skeleton width="100%" height="200px" />
                </div>
            </div>

            <!-- Right: Top Products Card (1 col) -->
            <div class="lg:col-span-1">
                <div v-if="isLoading" class="bg-white p-6 rounded-xl border border-surface-200 h-[320px] flex flex-col justify-between">
                    <div>
                        <Skeleton width="50%" height="1.25rem" class="mb-4" />
                        <div class="space-y-3">
                            <Skeleton width="100%" height="2.5rem" class="rounded-lg" />
                            <Skeleton width="100%" height="2.5rem" class="rounded-lg" />
                            <Skeleton width="100%" height="2.5rem" class="rounded-lg" />
                        </div>
                    </div>
                </div>
                <div v-else class="bg-white p-6 rounded-xl border border-surface-200 shadow-xs flex flex-col justify-between h-full">
                    <div>
                        <!-- Header -->
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-base font-semibold text-surface-900">Top Products</h3>
                            <button
                                @click="goToProducts"
                                class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                View all products
                                <i class="pi pi-chevron-right text-[10px]"></i>
                            </button>
                        </div>

                        <!-- Top Products List -->
                        <div v-if="topProducts.length > 0" class="space-y-3.5">
                            <div v-for="item in topProducts" :key="item.id" class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-lg bg-surface-100 border border-surface-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    <img
                                        v-if="item.image"
                                        :src="item.image"
                                        :alt="item.name"
                                        class="w-full h-full object-cover"
                                    />
                                    <i v-else class="pi pi-box text-surface-400 text-base"></i>
                                </div>

                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between text-xs mb-1">
                                        <span class="font-medium text-surface-900 truncate pr-2">{{ item.name }}</span>
                                        <span class="font-semibold text-surface-900 flex-shrink-0">{{ item.sold_quantity }}</span>
                                    </div>
                                    <div class="h-2 w-full bg-surface-100 rounded-full overflow-hidden">
                                        <div
                                            class="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                            :style="{ width: `${item.percentage}%` }"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-else class="py-12 text-center">
                            <div class="w-12 h-12 rounded-full bg-surface-100 text-surface-400 flex items-center justify-center mx-auto mb-3">
                                <i class="pi pi-shopping-bag text-xl"></i>
                            </div>
                            <div class="text-sm font-semibold text-surface-900">No sales record</div>
                            <p class="text-xs text-surface-400 mt-1">No top selling products in this period</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>