<script setup lang="ts">
import { Button, FileUpload } from 'primevue';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()

const categoryId = computed<number | null> (()=>
    route.params.id ? Number(route.params.id): null
)

const isEdit = computed(() => !!categoryId.value)
const imagePreview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const onFileSelect = (event: { files: File[] }) =>{
    const file = event.files[0]
    
    if(!file) return
    selectedFile.value = file
    imagePreview.value = URL.createObjectURL(file)
}

</script>

<template>
 <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
    <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 mb-1">
                    <span v-if="isEdit">
                        Edit Category
                    </span>
                    <span v-else>
                        Create Category
                    </span>
                </h1>
                <p class="text-surface-500 text-sm">
                    <span v-if="isEdit">
                        Update Category Detail
                    </span>
                    <span v-else>
                        Add a new product category
                    </span>
                </p>
            </div>
            
            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'product-categories'}" :class="slotProps.class" >
                    <i class="pi pi-arrow-left"></i>
                    Back
                </RouterLink>
            </Button>
    </div>
    
    <div class="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <form>
            <div class="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                <div class="md:col-span-4 flex flex-col gap-4">
                    <label class="text-sm font-semibold text-surface-900">Category Image</label>
                    
                    <div class="w-full aspect-square rounded-xl bg-surface-50 border-2 border-dashed border-surface-200 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary-500 transition-colors">
                        <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover">
                        
                        <div v-else class="flex flex-col items-center gap-2 text-surface-400">
                            <i class="pi pi-image text-4xl opacity-50"></i>
                            <span class="text-sm font-medium">No image selecteed</span>
                        </div>
                    </div>
                    
                    <div class="flex flex-col gap-2">
                        <FileUpload mode="basic" @select="onFileSelect" :auto="false" accept="image/*" :maxFileSize="2000000" choose-label="Choose Image" class="w-full"/>
                            <small class="text-surface-500 text-xs text-center">Max size: 2MB. Formats: JPG,PNG.</small>
                        
                    </div>
                </div>
            </div>
        </form>
    </div>
    
 </div>
        
    
</template>