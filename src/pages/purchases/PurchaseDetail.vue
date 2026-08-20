<script setup lang="ts">
import { getPurchase, receivePurchase, cancelPurchase } from '@/api/purchases.api';
import type { Purchase } from '@/types/purchase';
import { Button, Column, DataTable, Tag, useConfirm, ConfirmDialog, useToast } from 'primevue';
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const toast = useToast();
const confirm = useConfirm();

const loading = ref(false);
const submitting = ref(false);
const purchase = ref<Purchase | null>(null);

const purchaseId = computed(() => Number(route.params.id));

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

const loadDetail = async () => {
    loading.value = true;
    try {
        const res = await getPurchase(purchaseId.value);
        purchase.value = res.data.data;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load purchase details', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const handleReceive = () => {
    confirm.require({
        message: "Receive this purchase? This action will add all purchase quantities to product stock and cannot be undone.",
        header: "Confirm Stock Receive",
        icon: "pi pi-box",
        rejectProps: {
            label: "Cancel",
            severity: "secondary",
            outlined: true
        },
        acceptProps: {
            label: "Receive Purchase",
            severity: "success"
        },
        accept: async () => {
            submitting.value = true;
            try {
                const res = await receivePurchase(purchaseId.value);
                purchase.value = res.data.data;
                toast.add({
                    severity: 'success',
                    summary: 'Stock Received',
                    detail: 'Product stock updated successfully',
                    life: 3000
                });
            } catch (error: any) {
                toast.add({
                    severity: 'error',
                    summary: 'Receive Failed',
                    detail: error.response?.data?.message ?? 'Failed to receive purchase',
                    life: 4000
                });
            } finally {
                submitting.value = false;
            }
        }
    });
};

const handleCancel = () => {
    confirm.require({
        message: "Are you sure you want to cancel this draft purchase order?",
        header: "Confirm Cancellation",
        icon: "pi pi-exclamation-triangle",
        rejectProps: {
            label: "Keep Draft",
            severity: "secondary",
            outlined: true
        },
        acceptProps: {
            label: "Cancel Purchase",
            severity: "danger"
        },
        accept: async () => {
            submitting.value = true;
            try {
                const res = await cancelPurchase(purchaseId.value);
                purchase.value = res.data.data;
                toast.add({
                    severity: 'warn',
                    summary: 'Cancelled',
                    detail: 'Purchase order cancelled',
                    life: 3000
                });
            } catch (error: any) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.message ?? 'Failed to cancel purchase',
                    life: 4000
                });
            } finally {
                submitting.value = false;
            }
        }
    });
};

onMounted(() => {
    loadDetail();
});
</script>

<template>
    <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <div class="flex items-center gap-3">
                    <h1 class="text-2xl font-bold text-surface-900">
                        {{ purchase?.code || 'Purchase Detail' }}
                    </h1>
                    <Tag v-if="purchase" :value="purchase.status" :severity="getStatusSeverity(purchase.status)" class="font-bold text-xs px-2.5 py-1" />
                </div>
                <p class="text-surface-500 text-sm mt-1">
                    Created on {{ purchase?.created_at ? new Date(purchase.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-' }}
                </p>
            </div>
            
            <div class="flex items-center gap-3">
                <Button asChild v-slot="slotProps">
                    <RouterLink :to="{ name: 'purchases' }" :class="slotProps.class">
                        <i class="pi pi-arrow-left mr-1"></i>
                        Back
                    </RouterLink>
                </Button>

                <!-- Actions for DRAFT status -->
                <template v-if="purchase?.status === 'DRAFT'">
                    <Button 
                        label="Cancel Order" 
                        icon="pi pi-times-circle" 
                        severity="danger" 
                        outlined 
                        :loading="submitting" 
                        @click="handleCancel" 
                    />

                    <Button 
                        label="Receive Purchase" 
                        icon="pi pi-box" 
                        severity="success" 
                        :loading="submitting" 
                        @click="handleReceive" 
                    />
                </template>
            </div>
        </div>

        <div v-if="purchase" class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <!-- Supplier Info Card -->
            <div class="bg-white rounded-2xl border border-surface-200 p-6 flex flex-col justify-between">
                <div>
                    <h2 class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Supplier Information</h2>
                    <div class="font-bold text-lg text-surface-900">{{ purchase.supplier?.name }}</div>
                    <div v-if="purchase.supplier?.contact_person" class="text-sm text-surface-600 mt-1">
                        Contact: {{ purchase.supplier.contact_person }}
                    </div>
                    <div v-if="purchase.supplier?.phone" class="text-sm text-surface-600 mt-1 flex items-center gap-1">
                        <i class="pi pi-phone text-xs text-surface-400"></i>
                        {{ purchase.supplier.phone }}
                    </div>
                    <div v-if="purchase.supplier?.address" class="text-xs text-surface-500 mt-2">
                        {{ purchase.supplier.address }}
                    </div>
                </div>
            </div>

            <!-- Operator Metadata Card -->
            <div class="bg-white rounded-2xl border border-surface-200 p-6">
                <h2 class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Order Metadata</h2>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-surface-500">Created By:</span>
                        <span class="font-semibold text-surface-800">{{ purchase.created_by_user?.name || 'System Admin' }}</span>
                    </div>

                    <div v-if="purchase.status === 'RECEIVED'" class="flex justify-between">
                        <span class="text-surface-500">Received By:</span>
                        <span class="font-semibold text-surface-800">{{ purchase.received_by_user?.name || '-' }}</span>
                    </div>

                    <div v-if="purchase.received_at" class="flex justify-between">
                        <span class="text-surface-500">Received Date:</span>
                        <span class="font-semibold text-surface-800">
                            {{ new Date(purchase.received_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Total Cost Summary Card -->
            <div class="bg-primary-50 rounded-2xl border border-primary-100 p-6 flex flex-col justify-between">
                <div>
                    <h2 class="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Total Amount</h2>
                    <div class="text-3xl font-extrabold text-primary-800">{{ formatCurrency(purchase.total) }}</div>
                </div>
                <div v-if="purchase.notes" class="text-xs text-primary-700 bg-white/60 p-2.5 rounded-lg mt-4 border border-primary-200">
                    <span class="font-semibold">Notes:</span> {{ purchase.notes }}
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <div class="bg-white rounded-2xl border border-surface-200 p-6">
            <h2 class="text-lg font-bold text-surface-900 mb-4">Purchased Items</h2>

            <DataTable :value="purchase?.items || []" :loading="loading" dataKey="id" class="clean-table">
                <Column field="product.name" header="Product Name">
                    <template #body="{ data }">
                        <div class="font-semibold text-surface-900">{{ data.product?.name }}</div>
                    </template>
                </Column>

                <Column field="quantity" header="Quantity">
                    <template #body="{ data }">
                        <span class="font-bold text-surface-800">{{ data.quantity }}</span>
                    </template>
                </Column>

                <Column field="cost_price" header="Cost Price">
                    <template #body="{ data }">
                        <span class="text-surface-700">{{ formatCurrency(data.cost_price) }}</span>
                    </template>
                </Column>

                <Column field="subtotal" header="Subtotal">
                    <template #body="{ data }">
                        <span class="font-bold text-surface-900">{{ formatCurrency(data.subtotal) }}</span>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>

    <ConfirmDialog />
</template>
