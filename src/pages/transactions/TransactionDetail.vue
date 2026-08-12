<script setup lang="ts">
import { getTransaction } from '@/api/transactions.api';
import type { Transaction } from '@/types/transaction';
import { Button, Column, DataTable, useToast } from 'primevue';
import { computed, onMounted, ref } from 'vue';
import { useRoute, RouterLink } from 'vue-router';

const route = useRoute();
const toast = useToast();

const loading = ref(true);
const transaction = ref<Transaction | null>(null);

const transactionId = computed(() => Number(route.params.id));

const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'Rp 0';
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
};

const formatDateDetail = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const day = date.getDate();
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} pukul ${hours}.${minutes}`;
};

const getProductName = (data: any) => {
    if (!data) return '-';
    if (typeof data.product === 'string') return data.product;
    if (data.product && typeof data.product === 'object' && data.product.name) return data.product.name;
    if (data.product_name) return data.product_name;
    if (data.name) return data.name;
    return '-';
};

onMounted(async () => {
    if (!transactionId.value) return;
    loading.value = true;

    try {
        const res = await getTransaction(transactionId.value);
        transaction.value = res.data.data;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load transaction details',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="min-h-screen bg-surface-50 font-sans text-surface-900 p-2 md:p-4">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 mb-1">
                    Transaction Detail
                </h1>
                <p class="text-surface-500 text-sm">
                    View transaction information
                </p>
            </div>

            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'transactions' }" :class="slotProps.class" class="bg-emerald-600! hover:bg-emerald-700! text-white border-0 px-4 py-2 rounded-lg font-medium flex items-center">
                    <i class="pi pi-arrow-left mr-2"></i>
                    Back
                </RouterLink>
            </Button>
        </div>

        <div v-if="loading" class="p-12 bg-white rounded-2xl border border-surface-200 flex justify-center items-center gap-3 text-surface-500">
            <i class="pi pi-spin pi-spinner text-2xl text-emerald-600"></i>
            <span>Loading transaction detail...</span>
        </div>

        <div v-else-if="transaction" class="space-y-6">
            <!-- Card 1: Transaction Information -->
            <div class="bg-white rounded-2xl border border-surface-200 p-6">
                <h2 class="text-lg font-bold text-surface-900 mb-4">
                    Transaction Information
                </h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <span class="text-surface-500 text-sm block mb-1">Transaction Code</span>
                        <span class="font-bold text-emerald-600 text-base font-mono">
                            {{ transaction.code }}
                        </span>
                    </div>
                    <div>
                        <span class="text-surface-500 text-sm block mb-1">Customer</span>
                        <span class="font-bold text-surface-900 text-base">
                            {{ transaction.customer?.name ?? '-' }}
                        </span>
                    </div>
                    <div>
                        <span class="text-surface-500 text-sm block mb-1">Date</span>
                        <span class="font-bold text-surface-900 text-base">
                            {{ formatDateDetail(transaction.created_at) }}
                        </span>
                    </div>
                    <div>
                        <span class="text-surface-500 text-sm block mb-1">Total</span>
                        <span class="font-bold text-emerald-600 text-base">
                            {{ formatCurrency(transaction.total) }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Card 2: Items -->
            <div class="bg-white rounded-2xl border border-surface-200 p-6">
                <h2 class="text-lg font-bold text-surface-900 mb-4">
                    Items
                </h2>
                <DataTable :value="transaction.items" class="clean-table">
                    <Column header="Product" class="min-w-[12rem]">
                        <template #body="{ data }">
                            <span class="font-bold text-surface-900">
                                {{ getProductName(data) }}
                            </span>
                        </template>
                    </Column>
                    <Column field="price" header="Price" class="min-w-[8rem]">
                        <template #body="{ data }">
                            <span class="font-medium text-surface-800">
                                {{ formatCurrency(data.price) }}
                            </span>
                        </template>
                    </Column>
                    <Column field="quantity" header="Qty" class="min-w-[6rem]">
                        <template #body="{ data }">
                            <span class="font-semibold text-surface-900">
                                {{ data.quantity }}
                            </span>
                        </template>
                    </Column>
                    <Column field="subtotal" header="Subtotal" class="min-w-[8rem]">
                        <template #body="{ data }">
                            <span class="font-bold text-surface-900">
                                {{ formatCurrency(data.subtotal) }}
                            </span>
                        </template>
                    </Column>
                </DataTable>
            </div>

            <!-- Card 3: Summary -->
            <div class="bg-white rounded-2xl border border-surface-200 p-6">
                <h2 class="text-lg font-bold text-surface-900 mb-4">
                    Summary
                </h2>
                <div class="flex justify-end">
                    <div class="w-full md:w-80 flex flex-col gap-3">
                        <div class="flex justify-between items-center text-surface-500 font-medium">
                            <span>Subtotal</span>
                            <span class="font-bold text-surface-900">{{ formatCurrency(transaction.subtotal) }}</span>
                        </div>
                        <div class="flex justify-between items-center text-surface-500 font-medium">
                            <span>Tax</span>
                            <span class="font-bold text-surface-900">{{ formatCurrency(transaction.tax) }}</span>
                        </div>
                        <div class="flex justify-between items-center pt-3 border-t border-surface-200">
                            <span class="font-bold text-surface-900">Total</span>
                            <span class="font-bold text-emerald-600 text-lg">{{ formatCurrency(transaction.total) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
