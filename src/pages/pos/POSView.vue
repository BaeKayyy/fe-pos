<script setup lang="ts">
import { getProductsOptions } from '@/api/products.api';
import type { Product } from '@/types/product';
import { IconField, InputIcon, InputText } from 'primevue';
import { onMounted, ref } from 'vue';

const products = ref<Product[]>([]);
const productsLoading = ref(false);
const productSearch = ref('');

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

const formatPrice = (val?: number | string) => {
    if (val === undefined || val === null) return 'Rp 0';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
};

onMounted(() => {
    loadProducts();
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
            <div class="lg:col-span-2">
                <div class="bg-white rounded-2xl border border-surface-200 p-4">
                    <IconField iconPosition="left" class="w-full mb-4">
                        <InputIcon class="pi pi-search text-surface-400" />
                        <InputText placeholder="Search" class="w-full bg-surface-50 border-surface-200 focus:bg-white focus:border-primary-500" />
                    </IconField>

                    <!-- Product list -->
                     <div v-if="productsLoading" class="text-center py-12 text-surface-500">
                        Loading products....
                     </div>

                     <div v-else-if="products.length === 0" class="text-center py-12 text-surface-500">
                        No products found.
                     </div>

                     <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        <button v-for="product in products" :key="product.id" class="group p-3 rounded-xl border border-surface-200 hover:border-primary-500 hover:shadow-md transition-all text-left bg-white" :disabled="product.stock === 0" :class="product.stock === 0 ? 'opacity-50 cursor-not-allowed': ''">
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
        </div>
    </div>
</template>