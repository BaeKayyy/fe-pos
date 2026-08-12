<script setup lang="ts">
import { Button, Column, DataTable, IconField, InputIcon, InputText, Select, useConfirm, ConfirmDialog, useToast } from 'primevue';
import { useProductStore } from '@/stores/product.store';
import { getCategoryOptions } from '@/api/product-categories.api';
import type { ProductCategory } from '@/types/product-category';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { deleteProduct } from '@/api/products.api';
import { RouterLink } from 'vue-router';

const productStore = useProductStore();
const { fetch, setLimit, setPage, setCategory, prevPage, nextPage } = productStore
const { items, loading, limit, currentPage, totalPages, search, product_category_id } = storeToRefs(productStore)
const confirm = useConfirm()
const toast = useToast()

const categoryOptions = ref<{ id: number | null; name: string }[]>([
    { id: null, name: "All Categories" }
])

const onSearch = useDebounceFn(() => {
    setPage(1)
}, 400)

const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount || 0)
}

const confirmDelete = (id: number) => {
    confirm.require({
        message: "Are you sure you want to delete this product?",
        header: "Confirm Delete",
        icon: "pi pi-exclamation-triangle",
        rejectProps: {
            label: "Cancel",
            severity: "secondary",
            outlined: true
        },
        acceptProps: {
            label: "Delete",
            severity: "danger"
        },
        accept: async () => {
            try {
                await deleteProduct(id)
                toast.add({
                    severity: "success",
                    summary: "Deleted",
                    detail: "Product removed successfully",
                    life: 3000
                })
                fetch()
            } catch (error: any) {
                toast.add({
                    severity: "error",
                    summary: "Error",
                    detail: error.response?.data?.message || "Failed to delete product",
                    life: 3000
                })
            }
        }
    })
}

const fetchCategoryFilters = async () => {
    try {
        const res = await getCategoryOptions()
        const categories: ProductCategory[] = res.data.data
        categoryOptions.value = [
            { id: null, name: "All Categories" },
            ...categories.map(c => ({ id: c.id, name: c.name }))
        ]
    } catch (error) {
        console.error('Failed to fetch categories filter options:', error)
    }
}

onMounted(async () => {
    await fetchCategoryFilters()
    fetch()
})
</script>

<template>
    <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 mb-1">
                    Products
                </h1>
                <p class="text-surface-500 text-sm">
                    The list here shows all products
                </p>
            </div>
            
            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'products-create' }" :class="slotProps.class">
                    Add Product
                </RouterLink>
            </Button>
        </div>
        
        <div class="bg-white rounded-2xl border border-surface-200 p-2">
            <div class="flex flex-col md:flex-row justify-between items-center px-4 py-4 gap-4">
                <IconField iconPosition="left" class="w-full md:w-80">
                    <InputIcon class="pi pi-search text-surface-400" />
                    <InputText v-model="search" placeholder="Search" @input="onSearch" class="w-full" />
                </IconField>

                <Select
                    :model-value="product_category_id"
                    :options="categoryOptions"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="All Categories"
                    filter
                    filterPlaceholder="Search category..."
                    class="w-full md:w-60"
                    @update:model-value="setCategory"
                />
            </div>
            
            <DataTable :value="items" :loading="loading" dataKey="id" class="clean-table" :rowHover="true">
                <!-- Column 1: Name -->
                <Column field="name" header="Name" class="min-w-[16rem]">
                    <template #body="{ data }">
                        <div class="flex items-center gap-3">
                            <div class="relative w-10 h-10 rounded-full overflow-hidden bg-surface-100 border border-surface-200 flex-shrink-0 flex items-center justify-center">
                                <img v-if="data.image" :src="data.image" class="w-full h-full object-cover">
                                <i v-else class="pi pi-image text-surface-400 text-base"></i>
                            </div>
                            <span class="font-semibold text-surface-900">
                                {{ data.name }}
                            </span>
                        </div>
                    </template>
                </Column>

                <!-- Column 2: Price -->
                <Column header="Price" class="min-w-[8rem]">
                    <template #body="{ data }">
                        <span class="font-semibold text-surface-900">
                            {{ formatPrice(data.price) }}
                        </span>
                    </template>
                </Column>

                <!-- Column 3: Stock -->
                <Column field="stock" header="Stock" class="min-w-[6rem]">
                    <template #body="{ data }">
                        <div class="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-medium text-xs flex items-center justify-center">
                            {{ data.stock }}
                        </div>
                    </template>
                </Column>

                <!-- Column 4: Category -->
                <Column header="Category" class="min-w-[10rem]">
                    <template #body="{ data }">
                        <span class="text-surface-700 font-normal">
                            {{ data.category?.name || '-' }}
                        </span>
                    </template>
                </Column>

                <!-- Column 5: Actions -->
                <Column header="Actions" style="width: 6rem;">
                    <template #body="{ data }">
                        <div class="flex items-center gap-2">
                            <RouterLink :to="{ name: 'products-edit', params: { id: data.id } }">
                                <Button icon="pi pi-pencil" text rounded severity="secondary" class="w-9! h-9! border! border-surface-200! text-surface-400! hover:text-primary-600! hover:border-primary-500! hover:bg-primary-50! bg-white" />
                            </RouterLink>
                            
                            <Button icon="pi pi-trash" text rounded severity="secondary" class="w-9! h-9! border! border-surface-200! text-surface-400! hover:text-red-600! hover:border-red-500! hover:bg-red-50! bg-white" @click="confirmDelete(data.id)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
            
            <div class="flex justify-between items-center px-4 py-4 border-t border-surface-100 gap-4">
                <div class="flex items-center gap-2">
                    <span class="text-sm text-surface-500">Rows per page:</span>
                    <Select :model-value="limit" :options="[5, 10, 20, 50]" @update:model-value="setLimit" />
                </div>
                
                <div class="flex items-center gap-4">
                    <span class="text-sm font-medium text-surface-600">
                        {{ currentPage }} of {{ totalPages }}
                    </span>
                    
                    <div class="flex gap-1">
                        <Button icon="pi pi-chevron-left" text rounded severity="secondary" :disabled="currentPage == 1" class="w-9! h-9! border! border-surface-300 hover:bg-surface-50!" @click="prevPage()" />
                        <Button icon="pi pi-chevron-right" text rounded severity="secondary" :disabled="currentPage == totalPages" class="w-9! h-9! border! border-surface-300 hover:bg-surface-50!" @click="nextPage()" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <ConfirmDialog />
</template>
