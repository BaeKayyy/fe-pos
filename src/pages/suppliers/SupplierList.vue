<script setup lang="ts">
import { Button, Column, DataTable, IconField, InputIcon, InputText, Select, useConfirm, ConfirmDialog, useToast } from 'primevue';
import { useSupplierStore } from '@/stores/supplier.store';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { deleteSupplier } from '@/api/suppliers.api';
import { RouterLink } from 'vue-router';

const supplierStore = useSupplierStore();
const { fetch, setLimit, setPage, prevPage, nextPage } = supplierStore;
const { items, loading, limit, currentPage, totalPages, search } = storeToRefs(supplierStore);
const confirm = useConfirm();
const toast = useToast();

const onSearch = useDebounceFn(() => {
    setPage(1);
}, 400);

const confirmDelete = (id: number) => {
    confirm.require({
        message: "Are you sure to delete this supplier?",
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
                await deleteSupplier(id);
                toast.add({
                    severity: "success",
                    summary: "Deleted",
                    detail: "Supplier Removed",
                    life: 3000
                });
                fetch();
            } catch (error: any) {
                toast.add({
                    severity: "error",
                    summary: "Delete Failed",
                    detail: error.response?.data?.message ?? "Failed to delete supplier",
                    life: 4000
                });
            }
        }
    });
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
                    Suppliers
                </h1>
                <p class="text-surface-500 text-sm">
                    Manage product suppliers and vendor contact information
                </p>
            </div>
            
            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'suppliers-create' }" :class="slotProps.class">
                    <i class="pi pi-plus mr-1"></i>
                    Add Supplier
                </RouterLink>
            </Button>
        </div>
        
        <div class="bg-white rounded-2xl border border-surface-200 p-2">
            <div class="flex flex-col md:flex-row justify-between items-center px-4 py-4 gap-4">
                <IconField iconPosition="left" class="w-full md:w-96">
                    <InputIcon class="pi pi-search text-surface-400" />
                    <InputText v-model="search" placeholder="Search supplier by name, contact, or phone" @input="onSearch" class="w-full" />
                </IconField>
            </div>
            
            <DataTable :value="items" :loading="loading" dataKey="id" class="clean-table" :rowHover="true">
                <Column field="name" header="Supplier Name" class="min-w-[14rem]">
                    <template #body="{ data }">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                                {{ data.name ? data.name.charAt(0).toUpperCase() : 'S' }}
                            </div>
                            <div>
                                <div class="font-semibold text-surface-900">{{ data.name }}</div>
                                <div v-if="data.notes" class="text-xs text-surface-400 truncate max-w-xs">{{ data.notes }}</div>
                            </div>
                        </div>
                    </template>
                </Column>
                
                <Column field="contact_person" header="Contact Person">
                    <template #body="{ data }">
                        <span class="text-surface-700 font-medium">{{ data.contact_person || '-' }}</span>
                    </template>
                </Column>

                <Column field="phone" header="Phone">
                    <template #body="{ data }">
                        <div class="flex items-center gap-2 text-surface-700 font-medium">
                            <i class="pi pi-phone text-xs text-surface-400"></i>
                            <span>{{ data.phone || '-' }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="email" header="Email">
                    <template #body="{ data }">
                        <div class="flex items-center gap-2 text-surface-700 font-medium">
                            <i class="pi pi-envelope text-xs text-surface-400"></i>
                            <span>{{ data.email || '-' }}</span>
                        </div>
                    </template>
                </Column>

                <Column header="Actions" style="width: 7rem;">
                    <template #body="{ data }">
                        <div class="flex items-center gap-1">
                            <RouterLink :to="{ name: 'suppliers-edit', params: { id: data.id } }">
                                <Button icon="pi pi-pencil" text rounded severity="primary" class="w-9! h-9! border-surface-200! text-surface-600! hover:text-primary-600! hover:border-primary-500! hover:bg-primary-50! bg-white" />
                            </RouterLink>
                            
                            <Button icon="pi pi-trash" text rounded severity="danger" class="w-9! h-9! border-surface-200! text-surface-500! hover:text-red-600! hover:border-red-500! hover:bg-red-50! bg-white" @click="confirmDelete(data.id)" />
                        </div>
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
    
    <ConfirmDialog />
</template>
