<script setup lang="ts">
import { Button, Column, DataTable, IconField, InputIcon, InputText, Select } from 'primevue';
import { useTransactionStore } from '@/stores/transaction.store';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { RouterLink } from 'vue-router';

const transactionStore = useTransactionStore();
const { fetch, setLimit, setPage, prevPage, nextPage } = transactionStore;
const { items, loading, limit, currentPage, totalPages, search } = storeToRefs(transactionStore);

const onSearch = useDebounceFn(() => {
    setPage(1);
}, 400);

const formatCurrency = (val: number) => {
    if (val === undefined || val === null) return 'Rp 0';
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
};

const formatDateList = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}.${minutes}`;
};

onMounted(() => {
    fetch();
});
</script>

<template>
    <div class="min-h-screen bg-surface-50 font-sans text-surface-900 p-2 md:p-4">
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-surface-900 mb-1">
                Transactions
            </h1>
            <p class="text-surface-500 text-sm">
                The list here shows all transactions
            </p>
        </div>
        
        <div class="bg-white rounded-2xl border border-surface-200 p-4 md:p-6">
            <div class="mb-6">
                <IconField iconPosition="left" class="w-full md:w-80">
                    <InputIcon class="pi pi-search text-surface-400" />
                    <InputText v-model="search" placeholder="Search by code..." @input="onSearch" class="w-full rounded-xl border-surface-300" />
                </IconField>
            </div>
            
            <DataTable :value="items" :loading="loading" dataKey="id" class="clean-table" :rowHover="true">
                <Column field="code" header="Code" class="min-w-[14rem]">
                    <template #body="{ data }">
                        <span class="font-bold text-emerald-600">
                            {{ data.code }}
                        </span>
                    </template>
                </Column>

                <Column field="customer" header="Customer" class="min-w-[12rem]">
                    <template #body="{ data }">
                        <span class="font-medium text-surface-900">
                            {{ data.customer?.name ?? '-' }}
                        </span>
                    </template>
                </Column>

                <Column field="total" header="Total" class="min-w-[10rem]">
                    <template #body="{ data }">
                        <span class="font-bold text-surface-900">
                            {{ formatCurrency(data.total) }}
                        </span>
                    </template>
                </Column>

                <Column field="created_at" header="Date" class="min-w-[12rem]">
                    <template #body="{ data }">
                        <span class="text-surface-700 font-medium">
                            {{ formatDateList(data.created_at) }}
                        </span>
                    </template>
                </Column>

                <Column header="Actions" style="width: 5rem;">
                    <template #body="{ data }">
                        <RouterLink :to="{ name: 'transactions-detail', params: { id: data.id } }">
                            <Button 
                                icon="pi pi-eye" 
                                text 
                                rounded 
                                severity="secondary" 
                                class="w-9! h-9! border! border-surface-200 text-surface-400! hover:text-surface-600! hover:bg-surface-100! bg-white" 
                            />
                        </RouterLink>
                    </template>
                </Column>
            </DataTable>
            
            <div class="flex justify-between items-center pt-6 border-t border-surface-100 gap-4 mt-2">
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
