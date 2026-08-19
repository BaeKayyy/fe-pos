<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button } from 'primevue';

const router = useRouter();

const goHome = () => {
    router.push('/');
};

const goPos = () => {
    router.push('/pos');
};
</script>

<template>
    <div class="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-white rounded-2xl border border-surface-200 p-8 text-center shadow-sm">
            <div class="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5">
                <i class="pi pi-lock text-3xl"></i>
            </div>
            
            <span class="text-xs font-bold uppercase tracking-wider text-red-500 bg-red-50 px-3 py-1 rounded-full">
                403 Access Denied
            </span>
            
            <h1 class="text-2xl font-bold text-surface-900 mt-4 mb-2">
                Permission Required
            </h1>
            
            <p class="text-sm text-surface-500 mb-8 leading-relaxed">
                You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
            </p>
            
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button 
                    label="Back to Dashboard" 
                    icon="pi pi-home" 
                    severity="primary" 
                    class="w-full sm:w-auto !rounded-xl"
                    @click="goHome"
                />
                <Button 
                    label="Open POS" 
                    icon="pi pi-shopping-cart" 
                    severity="secondary" 
                    outlined
                    class="w-full sm:w-auto !rounded-xl"
                    @click="goPos"
                />
            </div>
        </div>
    </div>
</template>
