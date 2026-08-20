<script setup lang="ts">
import { Button, Column, DataTable, IconField, InputIcon, InputText, Select, Tag } from 'primevue';
import { usePurchaseStore } from '@/stores/purchase.store';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { RouterLink } from 'vue-router';

const purchaseStore = usePurchaseStore();
const { fetch, setLimit, setPage, prevPage, nextPage, setStatusFilter } = purchaseStore;
const { items, loading, limit, currentPage, totalPages, search, status } = storeToRefs(purchaseStore);

const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Received', value: 'RECEIVED' },
    { label: 'Cancelled', value: 'CANCELLED' }
];

const onSearch = useDebounceFn(() => {
    setPage(1);
}, 400);

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(val || 0);
};

const getStatusSeverity = (status: string) => {
    switch (status) {
        case 'RECEIVED': return 'success';
        case 'DRAFT': return 'warn';
        case 'CANCELLED': return 'danger';
        default: return 'info';
    }
};

onMounted(() => {
    fetch();
});
</script>

<template>
    <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 mb-1">
                    Purchases & Restock
                </h1>
                <p class="text-surface-500 text-sm">
                    Manage restock orders from suppliers and track stock receipts
                </p>
            </div>
            
            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'purchases-create' }" :class="slotProps.class">
                    <i class="pi pi-plus mr-1"></i>
                    Create Purchase Order
                </RouterLink>
            </Button>
        </div>
        
        <div class="bg-white rounded-2xl border border-surface-200 p-2">
            <div class="flex flex-col md:flex-row justify-between items-center px-4 py-4 gap-4">
                <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <IconField iconPosition="left" class="w-full sm:w-80">
                        <InputIcon class="pi pi-search text-surface-400" />
                        <InputText v-model="search" placeholder="Search by purchase code or supplier" @input="onSearch" class="w-full" />
                    </IconField>

                    <Select 
                        :model-value="status" 
                        :options="statusOptions" 
                        optionLabel="label" 
                        optionValue="value" 
                        placeholder="Filter Status" 
                        class="w-full sm:w-48"
                        @update:model-value="setStatusFilter"
                    />
                </div>
            </div>
            
            <DataTable :value="items" :loading="loading" dataKey="id" class="clean-table" :rowHover="true">
                <Column field="code" header="Purchase Code" class="min-w-[12rem]">
                    <template #body="{ data }">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-receipt text-primary-600"></i>
                            <span class="font-bold text-surface-900">{{ data.code }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="supplier" header="Supplier" class="min-w-[12rem]">
                    <template #body="{ data }">
                        <span class="font-medium text-surface-800">{{ data.supplier?.name || '-' }}</span>
                    </template>
                </Column>
                
                <Column field="total" header="Total Cost">
                    <template #body="{ data }">
                        <span class="font-semibold text-surface-900">{{ formatCurrency(data.total) }}</span>
                    </template>
                </Column>

                <Column field="status" header="Status">
                    <template #body="{ data }">
                        <Tag :value="data.status" :severity="getStatusSeverity(data.status)" class="font-bold text-xs px-2.5 py-1" />
                    </template>
                </Column>

                <Column field="created_at" header="Created Date">
                    <template #body="{ data }">
                        <span class="text-sm text-surface-600">
                            {{ new Date(data.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                        </span>
                    </template>
                </Column>

                <Column header="Actions" style="width: 6rem;">
                    <template #body="{ data }">
                        <RouterLink :to="{ name: 'purchases-detail', params: { id: data.id } }">
                            <Button icon="pi pi-eye" text rounded severity="secondary" class="w-9! h-9! border-surface-200! text-surface-600! hover:text-primary-600! hover:border-primary-500! hover:bg-primary-50! bg-white" />
                        </RouterLink>
                    </template>
                </Column>
            </DataTable>
            
            <div class="flex justify-between items-center px-4 py-4 border-t border-surface-100 gap-4">
                <div class="flex items-center gap-2">
                    <span class="text-sm text-surface-500">Rows per page:</span>
                    <Select :model-value="limit" :options="[5, 10, 20, 50]" @update:model-value="setLimit"></Select>
                </div>
                
                <div class="flex items-center gap-4">
                    <span class="text-sm font-medium text-surface-600">
                        {{ currentPage }} of {{ totalPages }}
                    </span>
                    
                    <div class="flex gap-1">
                        <Button icon="pi pi-chevron-left" text rounded severity="secondary" :disabled="currentPage === 1" class="w-9! h-9! border! border-surface-200 hover:bg-surface-50!" @click="prevPage()" />
                        <Button icon="pi pi-chevron-right" text rounded severity="secondary" :disabled="currentPage === totalPages" class="w-9! h-9! border! border-surface-200 hover:bg-surface-50!" @click="nextPage()" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
