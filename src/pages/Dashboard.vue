<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Button, Select, Skeleton } from 'primevue';
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

// Filters & Loading
const selectedPeriod = ref('today');
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

const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
        isRefreshing.value = true;
    } else {
        isLoading.value = true;
    }

    try {
        const [sumRes, salesRes, lowRes, topRes, recentRes] = await Promise.all([
            getDashboardSummary(selectedPeriod.value),
            getDashboardSales(selectedPeriod.value),
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
    fetchDashboardData();
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

        <!-- Row 2 & 3 Placeholders (Will be expanded in Commits 7, 8, 9) -->
        <div id="dashboard-content-grid" class="flex flex-col gap-6">
            <!-- Content will be wired in upcoming feature commits -->
        </div>
    </div>
</template>