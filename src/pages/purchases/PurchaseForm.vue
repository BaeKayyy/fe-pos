<script setup lang="ts">
import { getSupplierOptions } from '@/api/suppliers.api';
import { getProductsOptions } from '@/api/products.api';
import { createPurchase } from '@/api/purchases.api';
import router from '@/router';
import type { Supplier } from '@/types/supplier';
import type { Product } from '@/types/product';
import { Button, InputNumber, InputText, Textarea, Select, Message, useToast } from 'primevue';
import { onMounted, ref, computed } from 'vue';

const toast = useToast();
const loading = ref(false);
const submitting = ref(false);
const errors = ref<Record<string, string[]>>({});

const suppliers = ref<Supplier[]>([]);
const products = ref<Product[]>([]);

const selectedSupplierId = ref<number | null>(null);
const notes = ref('');

interface FormItem {
    product_id: number | null
    quantity: number
    cost_price: number
}

const items = ref<FormItem[]>([
    { product_id: null, quantity: 1, cost_price: 0 }
]);

const addItem = () => {
    items.value.push({ product_id: null, quantity: 1, cost_price: 0 });
};

const removeItem = (index: number) => {
    if (items.value.length > 1) {
        items.value.splice(index, 1);
    }
};

const onProductSelect = (index: number, productId: number) => {
    const selectedProd = products.value.find(p => p.id === productId);
    const targetItem = items.value[index];
    if (targetItem && selectedProd) {
        // Default cost price to product price or 0
        targetItem.cost_price = selectedProd.price || 0;
    }
};

const subtotal = computed(() => {
    return items.value.reduce((sum, item) => {
        const qty = item.quantity || 0;
        const cost = item.cost_price || 0;
        return sum + (qty * cost);
    }, 0);
});

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(val || 0);
};

const submit = async () => {
    if (!selectedSupplierId.value) {
        toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Please select a supplier', life: 3000 });
        return;
    }

    const invalidItems = items.value.filter(i => !i.product_id || i.quantity <= 0 || i.cost_price < 0);
    if (invalidItems.length > 0) {
        toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Please select valid products with positive quantity and cost price', life: 3000 });
        return;
    }

    submitting.value = true;
    errors.value = {};

    try {
        const payload = {
            supplier_id: selectedSupplierId.value,
            notes: notes.value,
            items: items.value.map(i => ({
                product_id: i.product_id!,
                quantity: i.quantity,
                cost_price: i.cost_price
            }))
        };

        const res = await createPurchase(payload);
        toast.add({
            severity: 'success',
            summary: 'Draft Created',
            detail: `Purchase Order ${res.data.data.code} saved as DRAFT`,
            life: 3000
        });

        router.push({ name: 'purchases-detail', params: { id: res.data.data.id } });
    } catch (error: any) {
        if (error.response?.status === 422) {
            errors.value = error.response?.data.errors ?? {};
            return;
        }

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message ?? 'Failed to create purchase order',
            life: 3000
        });
    } finally {
        submitting.value = false;
    }
};

onMounted(async () => {
    loading.value = true;
    try {
        const [supplierRes, productRes] = await Promise.all([
            getSupplierOptions(),
            getProductsOptions()
        ]);
        suppliers.value = supplierRes.data.data;
        products.value = productRes.data.data;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load suppliers or products options', life: 3000 });
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 mb-1">
                    Create Purchase Order
                </h1>
                <p class="text-surface-500 text-sm">
                    Build a restock draft from a vendor. Stock will update upon receipt.
                </p>
            </div>
            
            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'purchases' }" :class="slotProps.class">
                    <i class="pi pi-arrow-left mr-1"></i>
                    Back
                </RouterLink>
            </Button>
        </div>

        <form @submit.prevent="submit" class="flex flex-col gap-6 max-w-5xl">
            <!-- Supplier Information Section -->
            <div class="bg-white rounded-2xl border border-surface-200 p-6 md:p-8">
                <h2 class="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <i class="pi pi-building text-primary-600"></i>
                    Supplier Information
                </h2>

                <div class="flex flex-col gap-2 max-w-xl">
                    <label for="supplier" class="font-medium text-surface-900">
                        Select Supplier <span class="text-red-600">*</span>
                    </label>
                    <Select
                        id="supplier"
                        v-model="selectedSupplierId"
                        :options="suppliers"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Choose a supplier..."
                        filter
                        class="w-full"
                        :invalid="!!errors.supplier_id"
                    />
                    <Message v-if="errors.supplier_id" severity="error" size="small" variant="simple">
                        {{ errors.supplier_id[0] }}
                    </Message>
                </div>
            </div>

            <!-- Purchase Items Section -->
            <div class="bg-white rounded-2xl border border-surface-200 p-6 md:p-8">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-bold text-surface-900 flex items-center gap-2">
                        <i class="pi pi-box text-primary-600"></i>
                        Purchase Items
                    </h2>
                    <Button type="button" label="Add Item" icon="pi pi-plus" severity="secondary" outlined size="small" @click="addItem" />
                </div>

                <div class="flex flex-col gap-4">
                    <div v-for="(item, index) in items" :key="index" class="p-4 rounded-xl bg-surface-50 border border-surface-200 flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div class="flex-1 w-full">
                            <label class="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Product *</label>
                            <Select
                                v-model="item.product_id"
                                :options="products"
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Select product..."
                                filter
                                class="w-full bg-white!"
                                @change="(e) => onProductSelect(index, e.value)"
                            />
                        </div>

                        <div class="w-full md:w-32">
                            <label class="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Quantity *</label>
                            <InputNumber v-model="item.quantity" :min="1" fluid class="bg-white!" />
                        </div>

                        <div class="w-full md:w-44">
                            <label class="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Cost Price (Rp) *</label>
                            <InputNumber v-model="item.cost_price" :min="0" fluid class="bg-white!" />
                        </div>

                        <div class="w-full md:w-44 text-left md:text-right">
                            <label class="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Subtotal</label>
                            <div class="font-bold text-surface-900 py-2.5">
                                {{ formatCurrency((item.quantity || 0) * (item.cost_price || 0)) }}
                            </div>
                        </div>

                        <div class="pt-2 md:pt-6">
                            <Button 
                                icon="pi pi-trash" 
                                severity="danger" 
                                text 
                                rounded 
                                :disabled="items.length <= 1"
                                @click="removeItem(index)" 
                            />
                        </div>
                    </div>
                </div>

                <!-- Total & Notes Summary -->
                <div class="mt-6 pt-6 border-t border-surface-200 flex flex-col md:flex-row justify-between gap-6">
                    <div class="w-full md:w-1/2 flex flex-col gap-2">
                        <label for="notes" class="font-medium text-surface-900">Purchase Notes</label>
                        <Textarea id="notes" v-model="notes" rows="3" placeholder="Catatan pembelian / pengiriman..." fluid class="bg-surface-50! focus:bg-white! border-surface-200" />
                    </div>

                    <div class="w-full md:w-1/3 flex flex-col justify-center items-end bg-surface-50 p-4 rounded-xl border border-surface-200">
                        <span class="text-sm font-semibold text-surface-500 uppercase tracking-wider">Total Purchase</span>
                        <span class="text-2xl font-extrabold text-primary-700 mt-1">{{ formatCurrency(subtotal) }}</span>
                    </div>
                </div>
            </div>

            <!-- Submit buttons -->
            <div class="flex justify-end gap-3">
                <Button type="button" label="Cancel" severity="secondary" text @click="router.back" />
                <Button type="submit" label="Save as Draft" icon="pi pi-check-circle" severity="primary" :loading="submitting" />
            </div>
        </form>
    </div>
</template>
