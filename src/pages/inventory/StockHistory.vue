<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Button, Column, DataTable, DatePicker, IconField, InputIcon, InputText, Select, useToast } from 'primevue';
import { getStockHistories } from '@/api/inventory.api';
import type { StockHistory, StockMovementType } from '@/types/inventory';
import { useDebounceFn } from '@vueuse/core';

const toast = useToast();

const histories = ref<StockHistory[]>([]);
const loading = ref(true);

const page = ref(1);
const limit = ref(10);
const totalPages = ref(1);

const search = ref('');
const selectedType = ref<string>('ALL');
const dateRange = ref<Date[] | null>(null);

const typeOptions = [
    { label: 'All Types', value: 'ALL' },
    { label: 'IN (Stock In)', value: 'IN' },
    { label: 'OUT (Stock Out)', value: 'OUT' },
    { label: 'ADJUSTMENT', value: 'ADJUSTMENT' }
];

const fetchHistories = async () => {
    loading.value = true;

    let startDate: string | undefined;
    let endDate: string | undefined;

    if (dateRange.value && dateRange.value.length > 0) {
        if (dateRange.value[0]) {
            startDate = dateRange.value[0].toISOString().split('T')[0];
        }
        if (dateRange.value[1]) {
            endDate = dateRange.value[1].toISOString().split('T')[0];
        }
    }

    try {
        const res = await getStockHistories({
            page: page.value,
            limit: limit.value,
            search: search.value || undefined,
            type: selectedType.value !== 'ALL' ? selectedType.value : undefined,
            start_date: startDate,
            end_date: endDate
        });

        histories.value = res.data.data.data;
        totalPages.value = res.data.data.meta.last_page || 1;
    } catch (err: any) {
        console.error('Failed to load stock history:', err);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Unable to load stock history records',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const onSearch = useDebounceFn(() => {
    page.value = 1;
    fetchHistories();
}, 400);

const onFilterChange = () => {
    page.value = 1;
    fetchHistories();
};

const prevPage = () => {
    if (page.value > 1) {
        page.value--;
        fetchHistories();
    }
};

const nextPage = () => {
    if (page.value < totalPages.value) {
        page.value++;
        fetchHistories();
    }
};

const formatChange = (change: number) => {
    if (change > 0) return `+${change}`;
    return `${change}`;
};

onMounted(() => {
    fetchHistories();
});
</script>

<template>
    <div class="min-h-screen bg-surface-50 font-sans text-surface-900 pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 tracking-tight">Stock History</h1>
                <p class="text-surface-500 text-sm mt-0.5">Audit log of all product stock movements</p>
            </div>

            <Button
                icon="pi pi-refresh"
                label="Refresh"
                severity="secondary"
                outlined
                class="!rounded-xl text-xs"
                @click="fetchHistories"
            />
        </div>

        <!-- Filter & Table Card -->
        <div class="bg-white rounded-2xl border border-surface-200 p-2 shadow-xs">
            <!-- Filter Bar -->
            <div class="flex flex-col lg:flex-row justify-between items-center px-4 py-4 gap-4">
                <IconField iconPosition="left" class="w-full lg:w-80">
                    <InputIcon class="pi pi-search text-surface-400" />
                    <InputText v-model="search" placeholder="Search product..." @input="onSearch" class="w-full" />
                </IconField>

                <div class="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <Select
                        v-model="selectedType"
                        :options="typeOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="All Types"
                        class="w-full sm:w-48"
                        @change="onFilterChange"
                    />

                    <DatePicker
                        v-model="dateRange"
                        selectionMode="range"
                        placeholder="Select Date Range"
                        dateFormat="yy-mm-dd"
                        showIcon
                        class="w-full sm:w-64"
                        @update:model-value="onFilterChange"
                    />
                </div>
            </div>

            <!-- DataTable -->
            <DataTable :value="histories" :loading="loading" dataKey="id" class="clean-table" :rowHover="true">
                <!-- Column 1: Date -->
                <Column header="Date" class="min-w-[10rem]">
                    <template #body="{ data }">
                        <span class="text-xs font-medium text-surface-700">
                            {{ data.formatted_date || data.created_at }}
                        </span>
                    </template>
                </Column>

                <!-- Column 2: Product -->
                <Column header="Product" class="min-w-[14rem]">
                    <template #body="{ data }">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-lg overflow-hidden bg-surface-100 border border-surface-200 flex-shrink-0 flex items-center justify-center">
                                <img v-if="data.product?.image" :src="data.product.image" class="w-full h-full object-cover" />
                                <i v-else class="pi pi-box text-surface-400 text-sm"></i>
                            </div>
                            <span class="font-semibold text-surface-900 text-sm">
                                {{ data.product?.name || 'Deleted Product' }}
                            </span>
                        </div>
                    </template>
                </Column>

                <!-- Column 3: Type -->
                <Column header="Type" class="min-w-[7rem]">
                    <template #body="{ data }">
                        <span
                            v-if="data.type === 'IN'"
                            class="px-2.5 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full"
                        >
                            IN
                        </span>
                        <span
                            v-else-if="data.type === 'OUT'"
                            class="px-2.5 py-0.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-full"
                        >
                            OUT
                        </span>
                        <span
                            v-else
                            class="px-2.5 py-0.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-full"
                        >
                            ADJUSTMENT
                        </span>
                    </template>
                </Column>

                <!-- Column 4: Before -->
                <Column field="quantity_before" header="Before" class="min-w-[5rem]">
                    <template #body="{ data }">
                        <span class="text-sm font-medium text-surface-600">{{ data.quantity_before }}</span>
                    </template>
                </Column>

                <!-- Column 5: Change -->
                <Column header="Change" class="min-w-[6rem]">
                    <template #body="{ data }">
                        <span
                            :class="[
                                'text-sm font-bold',
                                data.quantity_change > 0 ? 'text-emerald-600' : 'text-red-600'
                            ]"
                        >
                            {{ formatChange(data.quantity_change) }}
                        </span>
                    </template>
                </Column>

                <!-- Column 6: After -->
                <Column field="quantity_after" header="After" class="min-w-[5rem]">
                    <template #body="{ data }">
                        <span class="text-sm font-bold text-surface-900">{{ data.quantity_after }}</span>
                    </template>
                </Column>

                <!-- Column 7: Reference -->
                <Column header="Reference" class="min-w-[10rem]">
                    <template #body="{ data }">
                        <div class="text-xs">
                            <span class="font-semibold capitalize text-surface-800">{{ data.reference_type || 'N/A' }}</span>
                            <span v-if="data.reference_id" class="block text-surface-500 font-mono mt-0.5">
                                {{ data.reference_id }}
                            </span>
                        </div>
                    </template>
                </Column>

                <!-- Column 8: User -->
                <Column header="User" class="min-w-[9rem]">
                    <template #body="{ data }">
                        <span class="text-xs font-medium text-surface-700">
                            {{ data.user?.name || 'System' }}
                        </span>
                    </template>
                </Column>

                <!-- Column 9: Notes -->
                <Column header="Notes" class="min-w-[12rem]">
                    <template #body="{ data }">
                        <span class="text-xs text-surface-500 italic">
                            {{ data.notes || '-' }}
                        </span>
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
    </div>
</template>
