<script setup lang="ts">
import { getCategoryOptions } from '@/api/product-categories.api';
import { createProduct, getProduct, updateProduct, uploadProductImage } from '@/api/products.api';
import router from '@/router';
import type { ProductCategory } from '@/types/product-category';
import { Button, FileUpload, InputNumber, InputText, Message, Select, useToast } from 'primevue';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const toast = useToast()

const loading = ref(false)
const errors = ref<Record<string, string[]>>({})
const categoryOptions = ref<ProductCategory[]>([])

const form = ref({
    id: 0,
    product_category_id: null as number | null,
    name: "",
    price: 0,
    stock: 0
})

const productId = computed<number | null>(() =>
    route.params.id ? Number(route.params.id) : null
)

const isEdit = computed(() => !!productId.value)

const imagePreview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

const onFileSelect = (event: { files: File[] }) => {
    const file = event.files[0]
    if (!file) return
    selectedFile.value = file
    imagePreview.value = URL.createObjectURL(file)
}

const fetchCategories = async () => {
    try {
        const res = await getCategoryOptions()
        categoryOptions.value = res.data.data
    } catch (error) {
        console.error('Failed to load category options:', error)
    }
}

const submit = async () => {
    loading.value = true
    errors.value = {}
    
    try {
        if (!form.value.product_category_id) {
            errors.value = { product_category_id: ['Product category is required.'] }
            loading.value = false
            return
        }

        const payload = {
            product_category_id: form.value.product_category_id,
            name: form.value.name,
            price: Number(form.value.price),
            stock: Number(form.value.stock)
        }

        if (isEdit.value) {
            await updateProduct(form.value.id, payload)
        } else {
            const res = await createProduct(payload)
            form.value.id = res.data.data.id
        }
        
        if (selectedFile.value) {
            const fd = new FormData()
            fd.append("image", selectedFile.value)
            await uploadProductImage(form.value.id, fd)
        }
       
        toast.add({
            severity: "success",
            summary: "Success",
            detail: isEdit.value ? "Product updated successfully" : "Product created successfully",
            life: 3000
        })
        router.push('/products')
    } catch (error: any) {
        if (error.response?.status === 422) {
            errors.value = error.response?.data.errors ?? {}
            return
        }
        
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.response?.data?.message || "Failed to save product",
            life: 3000
        })
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await fetchCategories()

    if (!isEdit.value || !productId.value) return
    loading.value = true
    
    try {
        const res = await getProduct(productId.value)
        const data = res.data.data
        
        form.value.id = data.id
        form.value.product_category_id = data.product_category_id
        form.value.name = data.name
        form.value.price = data.price
        form.value.stock = data.stock
        imagePreview.value = data.image ?? null
    } catch (error) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to load product details",
            life: 3000
        })
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 mb-1">
                    <span v-if="isEdit">Edit Product</span>
                    <span v-else>Create Product</span>
                </h1>
                <p class="text-surface-500 text-sm">
                    <span v-if="isEdit">Update product details</span>
                    <span v-else>Add a new product to inventory</span>
                </p>
            </div>
            
            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'products' }" :class="slotProps.class">
                    <i class="pi pi-arrow-left mr-2"></i>
                    Back
                </RouterLink>
            </Button>
        </div>
        
        <div class="bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <form @submit.prevent="submit">
                <div class="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                    <!-- Left: Image Upload -->
                    <div class="md:col-span-4 flex flex-col gap-4">
                        <label class="text-sm font-semibold text-surface-900">Product Image</label>
                        
                        <div class="w-full aspect-square rounded-xl bg-surface-50 border-2 border-dashed border-surface-200 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary-500 transition-colors">
                            <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover">
                            
                            <div v-else class="flex flex-col items-center gap-2 text-surface-400">
                                <i class="pi pi-image text-4xl opacity-50"></i>
                                <span class="text-sm font-medium">No image selected</span>
                            </div>
                        </div>
                        
                        <div class="flex flex-col gap-2">
                            <FileUpload mode="basic" @select="onFileSelect" :auto="false" accept="image/*" :maxFileSize="2000000" choose-label="Choose Image" class="w-full" />
                            <small class="text-surface-500 text-xs text-center">Max size: 2MB. Formats: JPG, PNG.</small>
                        </div>
                    </div>
                    
                    <!-- Right: Form Fields -->
                    <div class="md:col-span-8 flex flex-col gap-6">
                        <!-- Category Select -->
                        <div class="flex flex-col gap-2">
                            <label for="category" class="font-medium text-surface-900">
                                Category <span class="text-red-600">*</span>
                            </label>
                            <Select
                                id="category"
                                v-model="form.product_category_id"
                                :options="categoryOptions"
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Select a Category"
                                class="w-full bg-surface-50! focus:bg-white! border-surface-200"
                                :invalid="!!errors.product_category_id"
                            />
                            <Message v-if="errors.product_category_id" severity="error" size="small" variant="simple">
                                {{ errors.product_category_id[0] }}
                            </Message>
                        </div>

                        <!-- Product Name -->
                        <div class="flex flex-col gap-2">
                            <label for="name" class="font-medium text-surface-900">
                                Product Name <span class="text-red-600">*</span>
                            </label>
                            <InputText
                                id="name"
                                v-model="form.name"
                                type="text"
                                placeholder="Enter product name"
                                class="w-full bg-surface-50! focus:bg-white! border-surface-200"
                                :invalid="!!errors.name"
                            />
                            <Message v-if="errors.name" severity="error" size="small" variant="simple">
                                {{ errors.name[0] }}
                            </Message>
                        </div>

                        <!-- Price & Stock Grid -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <!-- Price -->
                            <div class="flex flex-col gap-2">
                                <label for="price" class="font-medium text-surface-900">
                                    Price <span class="text-red-600">*</span>
                                </label>
                                <InputNumber
                                    id="price"
                                    v-model="form.price"
                                    mode="currency"
                                    currency="IDR"
                                    locale="id-ID"
                                    placeholder="0"
                                    class="w-full bg-surface-50! focus:bg-white! border-surface-200"
                                    :invalid="!!errors.price"
                                />
                                <Message v-if="errors.price" severity="error" size="small" variant="simple">
                                    {{ errors.price[0] }}
                                </Message>
                            </div>

                            <!-- Stock -->
                            <div class="flex flex-col gap-2">
                                <label for="stock" class="font-medium text-surface-900">
                                    Stock <span class="text-red-600">*</span>
                                </label>
                                <InputNumber
                                    id="stock"
                                    v-model="form.stock"
                                    :min="0"
                                    placeholder="0"
                                    class="w-full bg-surface-50! focus:bg-white! border-surface-200"
                                    :invalid="!!errors.stock"
                                />
                                <Message v-if="errors.stock" severity="error" size="small" variant="simple">
                                    {{ errors.stock[0] }}
                                </Message>
                            </div>
                        </div>

                        <!-- Form Action Buttons -->
                        <div class="flex justify-end pt-4 mt-auto border-t border-surface-100">
                            <div class="flex gap-3">
                                <Button label="Cancel" severity="secondary" text @click="router.back()" />
                                <Button type="submit" :label="isEdit ? 'Update Product' : 'Save Product'" icon="pi pi-check" :loading="loading" />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>
