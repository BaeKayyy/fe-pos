<script setup>
import { Button, Column, DataTable, Select } from 'primevue';
import { useProductCategoryStore } from '@/stores/product-category.store';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

const productCategoryStore = useProductCategoryStore();
const { fetch, setLimit } = productCategoryStore
const { items, loading, limit } = storeToRefs(productCategoryStore)

onMounted(() => {
    fetch()
})
</script>


<template>
    <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 mb-1">
                    Product Catgories
                </h1>
                <p class="text-surface-500 text-sm">
                    The list here show all product categories
                </p>
            </div>
            
            <Button asChild v-slot="slotProps">
                <RouterLink  :class="slotProps.class">
                    Add Category
                </RouterLink>
            </Button>
        </div>
        
        <div class="bg-white rounded-2xl border border-surface-200 p-2">
            <DataTable :value="items" :loading="loading" dataKey="id" class="clean-table" :rowHover="true">
                <Column field="name" header="Name" class="min-w-[-16rem]">
                    <template #body="{ data }">
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <img :src="data.image" class="w-10 h-10 rounded-full object-cover bg-surface-100">
                            </div>
                            <span class="font-semibold text-surface-900">
                                {{ data.name }}
                            </span>
                        </div>
                    </template>
                </Column>
                
                <Column field="description" header="Description"></Column>
                <Column header="Actions" style="width: 5rem;">
                    <template #body=" { data }">
                        <Button icon="pi pi-trash" text rounded severity="danger" class="w-9! h-9! border-surface-200! text-surface-200! hover:text-primary-600! hover:border-primary-500 hover:bg-primary-50! bg-white"></Button>
                    </template>
                </Column>
            </DataTable>
            
            <div  class="flex justify-between items-center px-4 py-4 border-t border-surface-100 gap-4">
                <div class="flex items-center gap-2">
                    <span class="text-sm text-surface-500"> Rows per page:</span>
                    <Select :model-value="limit" :options="[5, 10 , 20, 50]" @update:model-value="setLimit"> </Select>
                </div>
            </div>
           
        </div>
    </div>
</template>