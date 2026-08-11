<script setup>
import { Button, DataTable } from 'primevue';


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
            <DataTable :value="" :loading="" dataKey="id" class="clean-table" :rowHover="true">
                
            </DataTable>
        </div>
    </div>
</template>