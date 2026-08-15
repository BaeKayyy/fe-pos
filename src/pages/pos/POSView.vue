<script setup lang="ts">
import { IconField, InputIcon, InputText } from 'primevue';
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
                <div class="bg-white rounded-2xl border border-surface-200 p-4 md:p-6">
                    <IconField iconPosition="left" class="w-full md:w-80">
                        <InputIcon class="pi pi-search text-surface-400" />
                        <InputText placeholder="Search" class="w-full rounded-xl border-surface-300" />
                    </IconField>
                </div>
            </div>
        </div>
    </div>
</template>