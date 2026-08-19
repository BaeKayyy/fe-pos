<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Button, Column, DataTable, IconField, InputIcon, InputText, Select, Skeleton, useToast } from 'primevue';
import { getInventorySummary } from '@/api/inventory.api';
import { getCategoryOptions } from '@/api/product-categories.api';
import { getProducts } from '@/api/products.api';
import type { InventorySummary } from '@/types/inventory';
import type { Product } from '@/types/product';
import type { ProductCategory } from '@/types/product-category';
import StockAdjustmentModal from '@/components/StockAdjustmentModal.vue';
import { useDebounceFn } from '@vueuse/core';

const toast = useToast();

// Summary state
const summary = ref<InventorySummary | null>(null);
const loadingSummary = ref(true);

// Products list state
const products = ref<Product[]>([]);
const loadingProducts = ref(true);
const page = ref(1);
const limit = ref(10);
const totalPages = ref(1);

// Filters
const search = ref('');
const categoryId = ref<number | null>(null);
const statusFilter = ref<string>('ALL');

const categoryOptions = ref<{ id: number | null; name: string }[]>([
    { id: null, name: "All Categories" }
]);

const statusOptions = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'In Stock', value: 'IN_STOCK' },
    { label: 'Low Stock', value: 'LOW_STOCK' },
    { label: 'Out of Stock', value: 'OUT_OF_STOCK' }
];

// Adjustment Modal
const isAdjustmentOpen = ref(false);
const selectedProduct = ref<Product | null>(null);

const fetchSummaryData = async () => {
    loadingSummary.value = true;
    try {
        const res = await getInventorySummary();
        summary.value = res.data.data;
    } catch (err) {
        console.error('Failed to load inventory summary:', err);
    } finally {
        loadingSummary.value = false;
    }
};

const fetchProductsList = async () => {
    loadingProducts.value = true;
    try {
        const res = await getProducts({
            page: page.value,
            limit: limit.value,
            search: search.value,
            product_category_id: categoryId.value || undefined
        });

        let data = res.data.data.data;

        // Apply client-side stock status filter if selected
        if (statusFilter.value === 'IN_STOCK') {
            data = data.filter(p => p.stock > (p.low_stock_threshold ?? 10));
        } else if (statusFilter.value === 'LOW_STOCK') {
            data = data.filter(p => p.stock > 0 && p.stock <= (p.low_stock_threshold ?? 10));
        } else if (statusFilter.value === 'OUT_OF_STOCK') {
            data = data.filter(p => p.stock <= 0);
        }

        products.value = data;
        totalPages.value = res.data.data.meta.last_page || 1;
    } catch (err) {
        console.error('Failed to load products list:', err);
    } finally {
        loadingProducts.value = false;
    }
};

const fetchCategoryFilters = async () => {
    try {
        const res = await getCategoryOptions();
        const categories: ProductCategory[] = res.data.data;
        categoryOptions.value = [
            { id: null, name: "All Categories" },
            ...categories.map(c => ({ id: c.id, name: c.name }))
        ];
    } catch (error) {
        console.error('Failed to fetch category options:', error);
    }
};

const onSearch = useDebounceFn(() => {
    page.value = 1;
    fetchProductsList();
}, 400);

const onFilterChange = () => {
    page.value = 1;
    fetchProductsList();
};

const openAdjustment = (product: Product) => {
    selectedProduct.value = product;
    isAdjustmentOpen.value = true;
};

const onAdjustSuccess = () => {
    toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Stock updated successfully',
        life: 3000
    });
    fetchSummaryData();
    fetchProductsList();
};

const prevPage = () => {
    if (page.value > 1) {
        page.value--;
        fetchProductsList();
    }
};

const nextPage = () => {
    if (page.value < totalPages.value) {
        page.value++;
        fetchProductsList();
    }
};

const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateStr;
    }
};

onMounted(() => {
    fetchSummaryData();
    fetchCategoryFilters();
    fetchProductsList();
});
</script>

<template>
    <div class="min-h-screen bg-surface-50 font-sans text-surface-900 pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 tracking-tight">Stock Monitoring</h1>
                <p class="text-surface-500 text-sm mt-0.5">Real-time inventory levels and health metrics</p>
            </div>
        </div>

        <!-- Summary Cards Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <!-- Card 1: Total Products -->
            <div v-if="loadingSummary" class="bg-white p-5 rounded-2xl border border-surface-200">
                <Skeleton width="40%" height="1rem" class="mb-3" />
                <Skeleton width="70%" height="2rem" />
            </div>
            <div v-else class="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs flex items-center justify-between">
                <div>
                    <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Total Products</span>
                    <div class="text-2xl font-bold text-surface-900 mt-1">
                        {{ summary?.total_products || 0 }}
                    </div>
                </div>
                <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <i class="pi pi-box text-xl"></i>
                </div>
            </div>

            <!-- Card 2: Total Stock -->
            <div v-if="loadingSummary" class="bg-white p-5 rounded-2xl border border-surface-200">
                <Skeleton width="40%" height="1rem" class="mb-3" />
                <Skeleton width="70%" height="2rem" />
            </div>
            <div v-else class="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs flex items-center justify-between">
                <div>
                    <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Total Stock</span>
                    <div class="text-2xl font-bold text-surface-900 mt-1">
                        {{ (summary?.total_stock || 0).toLocaleString('id-ID') }}
                    </div>
                </div>
                <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <i class="pi pi-chart-bar text-xl"></i>
                </div>
            </div>

            <!-- Card 3: Low Stock -->
            <div v-if="loadingSummary" class="bg-white p-5 rounded-2xl border border-surface-200">
                <Skeleton width="40%" height="1rem" class="mb-3" />
                <Skeleton width="70%" height="2rem" />
            </div>
            <div v-else class="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs flex items-center justify-between">
                <div>
                    <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Low Stock</span>
                    <div class="text-2xl font-bold text-amber-600 mt-1">
                        {{ summary?.low_stock || 0 }}
                    </div>
                </div>
                <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <i class="pi pi-exclamation-triangle text-xl"></i>
                </div>
            </div>

            <!-- Card 4: Out of Stock -->
            <div v-if="loadingSummary" class="bg-white p-5 rounded-2xl border border-surface-200">
                <Skeleton width="40%" height="1rem" class="mb-3" />
                <Skeleton width="70%" height="2rem" />
            </div>
            <div v-else class="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs flex items-center justify-between">
                <div>
                    <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Out of Stock</span>
                    <div class="text-2xl font-bold text-red-600 mt-1">
                        {{ summary?.out_of_stock || 0 }}
                    </div>
                </div>
                <div class="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <i class="pi pi-times-circle text-xl"></i>
                </div>
            </div>
        </div>

        <!-- Table Container -->
        <div class="bg-white rounded-2xl border border-surface-200 p-2 shadow-xs">
            <!-- Filter Bar -->
            <div class="flex flex-col lg:flex-row justify-between items-center px-4 py-4 gap-4">
                <IconField iconPosition="left" class="w-full lg:w-80">
                    <InputIcon class="pi pi-search text-surface-400" />
                    <InputText v-model="search" placeholder="Search product..." @input="onSearch" class="w-full" />
                </IconField>

                <div class="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <Select
                        v-model="categoryId"
                        :options="categoryOptions"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="All Categories"
                        filter
                        class="w-full sm:w-56"
                        @change="onFilterChange"
                    />

                    <Select
                        v-model="statusFilter"
                        :options="statusOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="All Statuses"
                        class="w-full sm:w-48"
                        @change="onFilterChange"
                    />
                </div>
            </div>

            <!-- DataTable -->
            <DataTable :value="products" :loading="loadingProducts" dataKey="id" class="clean-table" :rowHover="true">
                <!-- Column 1: Product -->
                <Column field="name" header="Product" class="min-w-[14rem]">
                    <template #body="{ data }">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg overflow-hidden bg-surface-100 border border-surface-200 flex-shrink-0 flex items-center justify-center">
                                <img v-if="data.image" :src="data.image" class="w-full h-full object-cover" />
                                <i v-else class="pi pi-box text-surface-400 text-base"></i>
                            </div>
                            <span class="font-semibold text-surface-900">{{ data.name }}</span>
                        </div>
                    </template>
                </Column>

                <!-- Column 2: Category -->
                <Column header="Category" class="min-w-[10rem]">
                    <template #body="{ data }">
                        <span class="text-surface-700 text-sm">{{ data.category?.name || 'General' }}</span>
                    </template>
                </Column>

                <!-- Column 3: Current Stock -->
                <Column field="stock" header="Current Stock" class="min-w-[8rem]">
                    <template #body="{ data }">
                        <span class="font-bold text-base text-surface-900">{{ data.stock }}</span>
                    </template>
                </Column>

                <!-- Column 4: Low Stock Threshold -->
                <Column field="low_stock_threshold" header="Low Stock Threshold" class="min-w-[10rem]">
                    <template #body="{ data }">
                        <span class="text-sm text-surface-600 font-medium">{{ data.low_stock_threshold ?? 10 }}</span>
                    </template>
                </Column>

                <!-- Column 5: Status Badge -->
                <Column header="Status" class="min-w-[9rem]">
                    <template #body="{ data }">
                        <span
                            v-if="data.stock <= 0"
                            class="px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-full inline-flex items-center gap-1.5"
                        >
                            <span class="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            OUT OF STOCK
                        </span>
                        <span
                            v-else-if="data.stock <= (data.low_stock_threshold ?? 10)"
                            class="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full inline-flex items-center gap-1.5"
                        >
                            <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            LOW STOCK
                        </span>
                        <span
                            v-else
                            class="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full inline-flex items-center gap-1.5"
                        >
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            IN STOCK
                        </span>
                    </template>
                </Column>

                <!-- Column 6: Last Updated -->
                <Column header="Last Updated" class="min-w-[10rem]">
                    <template #body="{ data }">
                        <span class="text-xs text-surface-500">{{ formatDate(data.updated_at) }}</span>
                    </template>
                </Column>

                <!-- Column 7: Actions -->
                <Column header="Actions" style="width: 8rem;">
                    <template #body="{ data }">
                        <Button
                            label="Adjust Stock"
                            icon="pi pi-sliders-h"
                            size="small"
                            severity="secondary"
                            outlined
                            class="!rounded-lg text-xs"
                            @click="openAdjustment(data)"
                        />
                    </template>
                </Column>
            </DataTable>

            <!-- Pagination Footer -->
            <div class="flex justify-between items-center px-4 py-4 border-t border-surface-100 gap-4">
                <div class="flex items-center gap-2">
                    <span class="text-sm text-surface-500">Rows per page:</span>
                    <Select v-model="limit" :options="[5, 10, 20, 50]" @change="onFilterChange" />
                </div>

                <div class="flex items-center gap-4">
                    <span class="text-sm font-medium text-surface-600">
                        {{ page }} of {{ totalPages }}
                    </span>

                    <div class="flex gap-1">
                        <Button
                            icon="pi pi-chevron-left"
                            text
                            rounded
                            severity="secondary"
                            :disabled="page === 1"
                            class="w-9! h-9! border! border-surface-300 hover:bg-surface-50!"
                            @click="prevPage"
                        />
                        <Button
                            icon="pi pi-chevron-right"
                            text
                            rounded
                            severity="secondary"
                            :disabled="page === totalPages"
                            class="w-9! h-9! border! border-surface-300 hover:bg-surface-50!"
                            @click="nextPage"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Stock Adjustment Modal -->
        <StockAdjustmentModal
            v-model:visible="isAdjustmentOpen"
            :product="selectedProduct"
            @success="onAdjustSuccess"
        />
    </div>
</template>
