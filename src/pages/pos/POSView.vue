<script setup lang="ts">
import { createCustomer, getCustomerOptions } from '@/api/customers.api';
import { getProductsOptions } from '@/api/products.api';
import { usePosStore } from '@/stores/pos.store';
import type { Customer } from '@/types/customer';
import type { Product } from '@/types/product';
import { useDebounceFn } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { Button, Dialog, IconField, InputIcon, InputNumber, InputText, Message, Select, useToast } from 'primevue';
import { onMounted, ref, watch } from 'vue';

const toast = useToast();

const products = ref<Product[]>([]);
const productsLoading = ref(false);
const productSearch = ref('');
const paymentAmount = ref(0);

const customerOptions = ref<Customer[]>([]);
const customerOptionsLoading = ref(false);

const posStore = usePosStore();
const { cart, customerId, subtotal, tax, total, loading: checkoutLoading } = storeToRefs(posStore);
const { addToCart, removeFromCart, updateQuantity, clearCart, checkout } = posStore;

// Customer Modal state
const showCustomerModal = ref(false);
const customerLoading = ref(false);
const customerErrors = ref<Record<string, string[]>>({});
const customerForm = ref({
    name: '',
    phone: ''
});

const loadProducts = async (search?: string) => {
    productsLoading.value = true;
    try {
        const res = await getProductsOptions({
            search: search || undefined,
            limit: 10,
        });
        products.value = res.data.data;
    } catch (error) {
        console.log(error);
    } finally {
        productsLoading.value = false;
    }
};

const loadCustomers = async () => {
    customerOptionsLoading.value = true;
    try {
        const res = await getCustomerOptions();
        customerOptions.value = res.data.data;
    } catch (error) {
        console.error('Failed to load customers:', error);
    } finally {
        customerOptionsLoading.value = false;
    }
};

const openCustomerModal = () => {
    customerForm.value = { name: '', phone: '' };
    customerErrors.value = {};
    showCustomerModal.value = true;
};

const handleCreateCustomer = async () => {
    customerLoading.value = true;
    customerErrors.value = {};

    try {
        const res = await createCustomer(customerForm.value);
        const newCustomer = res.data.data;

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Customer created successfully',
            life: 3000
        });

        await loadCustomers();
        customerId.value = newCustomer.id;
        showCustomerModal.value = false;
    } catch (error: any) {
        if (error.response?.status === 422) {
            customerErrors.value = error.response?.data.errors ?? {};
            return;
        }
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message ?? 'Failed to create customer',
            life: 3000
        });
    } finally {
        customerLoading.value = false;
    }
};

const handleCheckout = async () => {
    if (!customerId.value) {
        toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select a customer',
            life: 3000
        });
        return;
    }

    if (paymentAmount.value < total.value) {
        toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Payment amount is less than the total',
            life: 3000
        });
        return;
    }

    try {
        await checkout();

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Transaction created successfully',
            life: 3000
        });

        paymentAmount.value = 0;
        await loadProducts(productSearch.value);
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message ?? 'An error occurred',
            life: 3000
        });
    }
};

const onProductSearch = useDebounceFn(() => {
    loadProducts(productSearch.value);
}, 400);

watch(productSearch, () => {
    onProductSearch();
});

const formatPrice = (val?: number | string) => {
    if (val === undefined || val === null) return 'Rp 0';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
};

onMounted(() => {
    loadProducts();
    loadCustomers();
});
</script>

<template>
    <div class="min-h-screen bg-surface-50 font-sans text-surface-900 p-2 md:p-4">
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-surface-900 mb-1">
                POS
            </h1>
            <p class="text-surface-500 text-sm">
                Create a new transaction
            </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Products Grid -->
            <div class="lg:col-span-2">
                <div class="bg-white rounded-2xl border border-surface-200 p-4">
                    <IconField iconPosition="left" class="w-full mb-4">
                        <InputIcon class="pi pi-search text-surface-400" />
                        <InputText 
                            v-model="productSearch" 
                            placeholder="Search" 
                            class="w-full bg-surface-50 border-surface-200 focus:bg-white focus:border-primary-500" 
                            @input="onProductSearch"
                        />
                    </IconField>

                    <!-- Product list -->
                    <div v-if="productsLoading" class="text-center py-12 text-surface-500">
                        Loading products....
                    </div>

                    <div v-else-if="products.length === 0" class="text-center py-12 text-surface-500">
                        No products found.
                    </div>

                    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        <button 
                            v-for="product in products" 
                            :key="product.id" 
                            class="group p-3 rounded-xl border border-surface-200 hover:border-primary-500 hover:shadow-md transition-all text-left bg-white" 
                            :disabled="product.stock === 0" 
                            :class="product.stock === 0 ? 'opacity-50 cursor-not-allowed': ''"
                            @click="addToCart(product)"
                        >
                            <div class="aspect-square rounded-lg bg-surface-100 mb-2 overflow-hidden">
                                <img v-if="product.image" :src="product.image" :alt="product.name" class="w-full h-full object-cover">
                                <div v-else class="w-full h-full flex items-center justify-center">
                                    <span class="text-surface-500 text-sm">No Image</span>
                                </div>
                            </div> 
                            <div class="text-sm font-medium text-surface-900 truncate">
                                {{ product.name }}
                            </div> 
                            <div class="text-sm text-surface-500">
                                {{ formatPrice(product.price) }}
                            </div>           
                            <div class="text-sm text-surface-500">
                                Stock: {{ product.stock }}
                            </div>                   
                        </button>
                    </div>
                </div>
            </div>

            <!-- Cart Section -->
            <div class="lg:col-span-1">
                <div class="bg-white rounded-2xl border border-surface-200 p-4 sticky top-4">
                    <h2 class="text-lg font-semibold text-surface-900 mb-4">Cart</h2>

                    <!-- Customer Selection & Create Button -->
                    <div class="mb-4">
                        <label class="text-xs font-semibold text-surface-600 mb-1.5 block uppercase tracking-wider">
                            Customer
                        </label>
                        <div class="flex gap-2">
                            <Select 
                                v-model="customerId" 
                                :options="customerOptions" 
                                optionLabel="name" 
                                optionValue="id" 
                                placeholder="Select Customer" 
                                filter 
                                filterPlaceholder="Search customer..." 
                                showClear 
                                class="flex-1 bg-surface-50 border-surface-200 text-sm"
                                :loading="customerOptionsLoading"
                            />
                            <Button 
                                icon="pi pi-plus" 
                                severity="primary" 
                                class="w-10 h-10 flex-shrink-0" 
                                @click="openCustomerModal" 
                            />
                        </div>
                    </div>

                    <div v-if="cart.length === 0" class="text-center py-8 text-surface-400">
                        <i class="pi pi-shopping-cart text-3xl mb-2"></i>
                        <p class="text-sm">Cart is empty</p>
                    </div>

                    <div v-else ref="cardContainer" class="space-y-2 mb-4 max-h-50 overflow-y-auto">
                        <div v-for="item in cart" :key="item.product.id" class="p-3 rounded-lg bg-surface-50">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-lg bg-surface-200 overflow-hidden flex-shrink-0">
                                    <img v-if="item.product.image" :src="item.product.image" class="w-full h-full object-cover">
                                    <div v-else class="w-full h-full flex items-center justify-center">
                                        <span class="text-surface-500 text-sm">No Image</span>
                                    </div>
                                </div>

                                <div class="flex-1 min-w-0">
                                    <div class="text-sm font-medium text-surface-900 truncate">{{ item.product.name }}</div>
                                    <div class="text-sm text-surface-500">
                                        {{ formatPrice(item.product.price) }}
                                    </div>
                                </div>

                                <Button 
                                    icon="pi pi-trash" 
                                    text 
                                    rounded 
                                    size="small" 
                                    severity="danger" 
                                    class="w-7 h-7 flex-shrink-0" 
                                    @click="removeFromCart(item.product.id)" 
                                />
                            </div>

                            <div class="flex items-center justify-between mt-2 pt-2 border-t border-surface-200">
                                <div class="flex items-center gap-1">
                                    <Button 
                                        icon="pi pi-minus" 
                                        text 
                                        rounded 
                                        size="small" 
                                        severity="secondary" 
                                        class="w-7 h-7" 
                                        @click="updateQuantity(item.product.id, item.quantity - 1)" 
                                    />
                                    <span class="w-8 text-center text-sm font-medium">{{ item.quantity }}</span>
                                    <Button 
                                        icon="pi pi-plus" 
                                        text 
                                        rounded 
                                        size="small" 
                                        severity="secondary" 
                                        class="w-7 h-7" 
                                        @click="updateQuantity(item.product.id, item.quantity + 1)" 
                                    />
                                </div>
                                <div class="text-sm font-semibold text-surface-900">
                                    {{ formatPrice(item.product.price * item.quantity) }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="cart.length > 0" class="border-t border-surface-900 pt-4 space-y-4">
                        <div class="flex justify-between text-sm text-surface-600">
                            <span>Subtotal</span>
                            <span>{{ formatPrice(subtotal) }}</span>
                        </div>
                        <div class="flex justify-between text-sm text-surface-600">
                            <span>Tax (11%)</span>
                            <span>{{ formatPrice(tax) }}</span>
                        </div>
                        <div class="flex justify-between text-lg font-semibold text-surface-900 border-t border-surface-200 pt-2">
                            <span>Total</span>
                            <span>{{ formatPrice(total) }}</span>
                        </div>
                        
                        <div class="pt-3 border-t border-surface-100">
                            <label class="text-sm font-medium text-surface-700 mb-2 block">Payment Amount</label>
                            <InputNumber v-model="paymentAmount" mode="currency" currency="IDR" locale="id-ID" :minFractionDigits="2" placeholder="Enter Amount" class="w-full" />
                        </div>
                    </div>

                    <div class="mt-4 space-y-2">
                        <Button 
                            label="Checkout" 
                            icon="pi pi-check" 
                            class="w-full" 
                            :disabled="cart.length === 0" 
                            :loading="checkoutLoading"
                            @click="handleCheckout"
                        />
                        <Button label="Clear Cart" icon="pi pi-trash" class="w-full" severity="secondary" :disabled="cart.length === 0" @click="clearCart"/>
                    </div>
                </div>            
            </div>
        </div>

        <!-- Create Customer Modal Dialog -->
        <Dialog v-model:visible="showCustomerModal" header="Create Customer" :modal="true" class="w-full max-w-md">
            <form @submit.prevent="handleCreateCustomer" class="flex flex-col gap-4 pt-2">
                <div class="flex flex-col gap-2">
                    <label for="modal-cust-name" class="font-medium text-surface-900 text-sm">
                        Name <span class="text-red-600">*</span>
                    </label>
                    <InputText 
                        id="modal-cust-name" 
                        v-model="customerForm.name"
                        type="text"
                        placeholder="John Doe"
                        required
                        class="w-full bg-surface-50 border-surface-200"
                        :invalid="!!customerErrors.name"
                    />
                    <Message v-if="customerErrors.name" severity="error" size="small" variant="simple">
                        {{ customerErrors.name[0] }}
                    </Message>
                </div>
                
                <div class="flex flex-col gap-2">
                    <label for="modal-cust-phone" class="font-medium text-surface-900 text-sm">
                        Phone Number <span class="text-red-600">*</span>
                    </label>
                    <InputText 
                        id="modal-cust-phone" 
                        v-model="customerForm.phone"
                        type="text"
                        placeholder="08123456789"
                        required
                        class="w-full bg-surface-50 border-surface-200"
                        :invalid="!!customerErrors.phone"
                    />
                    <Message v-if="customerErrors.phone" severity="error" size="small" variant="simple">
                        {{ customerErrors.phone[0] }}
                    </Message>
                </div>
                
                <div class="flex justify-end pt-4 border-t border-surface-100 gap-2 mt-2">
                    <Button type="button" label="Cancel" severity="secondary" text @click="showCustomerModal = false" />
                    <Button type="submit" label="Save Customer" icon="pi pi-check" :loading="customerLoading" />
                </div>
            </form>
        </Dialog>
    </div>
</template>