<script setup lang="ts">
import { createSupplier, getSupplier, updateSupplier } from '@/api/suppliers.api';
import router from '@/router';
import { Button, InputText, Textarea, Message, useToast } from 'primevue';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const toast = useToast();

const loading = ref(false);
const errors = ref<Record<string, string[]>>({});

const form = ref({
    id: 0,
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    notes: ""
});

const supplierId = computed<number | null>(() =>
    route.params.id ? Number(route.params.id) : null
);

const isEdit = computed(() => !!supplierId.value);

const submit = async () => {
    loading.value = true;
    errors.value = {};

    try {
        if (isEdit.value) {
            await updateSupplier(form.value.id, form.value);
        } else {
            const res = await createSupplier(form.value);
            form.value.id = res.data.data.id;
        }

        toast.add({
            severity: "success",
            summary: "Success",
            detail: isEdit.value ? "Supplier updated successfully" : "Supplier created successfully",
            life: 3000
        });
        router.push('/suppliers');
    } catch (error: any) {
        if (error.response?.status === 422) {
            errors.value = error.response?.data.errors ?? {};
            return;
        }

        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.response?.data?.message ?? "An error occurred",
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    if (!isEdit.value) return;
    loading.value = true;
    try {
        const res = await getSupplier(supplierId.value!);
        const data = res.data.data;

        form.value.id = data.id;
        form.value.name = data.name;
        form.value.contact_person = data.contact_person ?? "";
        form.value.phone = data.phone ?? "";
        form.value.email = data.email ?? "";
        form.value.address = data.address ?? "";
        form.value.notes = data.notes ?? "";
    } catch (error) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to load supplier",
            life: 3000
        });
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 mb-1">
                    <span v-if="isEdit">Edit Supplier</span>
                    <span v-else>Create Supplier</span>
                </h1>
                <p class="text-surface-500 text-sm">
                    <span v-if="isEdit">Update vendor information</span>
                    <span v-else>Add a new vendor or supplier</span>
                </p>
            </div>
            
            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'suppliers' }" :class="slotProps.class">
                    <i class="pi pi-arrow-left mr-1"></i>
                    Back
                </RouterLink>
            </Button>
        </div>
        
        <div class="bg-white rounded-2xl border border-surface-200 p-6 md:p-8 max-w-3xl">
            <form @submit.prevent="submit" class="flex flex-col gap-6">
                <div class="flex flex-col gap-2">
                    <label for="name" class="font-medium text-surface-900">
                        Supplier Name <span class="text-red-600">*</span>
                    </label>
                    <InputText 
                        required
                        id="name" 
                        v-model="form.name"
                        type="text"
                        placeholder="PT Distribusi Utama"
                        fluid
                        class="bg-surface-50! focus:bg-white! border-surface-200"
                        :invalid="!!errors.name"
                    />
                    <Message v-if="errors.name" severity="error" size="small" variant="simple">
                        {{ errors.name[0] }}
                    </Message>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="flex flex-col gap-2">
                        <label for="contact_person" class="font-medium text-surface-900">
                            Contact Person
                        </label>
                        <InputText 
                            id="contact_person" 
                            v-model="form.contact_person"
                            type="text"
                            placeholder="Budi Santoso"
                            fluid
                            class="bg-surface-50! focus:bg-white! border-surface-200"
                        />
                    </div>
                    
                    <div class="flex flex-col gap-2">
                        <label for="phone" class="font-medium text-surface-900">
                            Phone Number
                        </label>
                        <InputText 
                            id="phone" 
                            v-model="form.phone"
                            type="text"
                            placeholder="081234567890"
                            fluid
                            class="bg-surface-50! focus:bg-white! border-surface-200"
                            :invalid="!!errors.phone"
                        />
                        <Message v-if="errors.phone" severity="error" size="small" variant="simple">
                            {{ errors.phone[0] }}
                        </Message>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="email" class="font-medium text-surface-900">
                        Email Address
                    </label>
                    <InputText 
                        id="email" 
                        v-model="form.email"
                        type="email"
                        placeholder="supplier@example.com"
                        fluid
                        class="bg-surface-50! focus:bg-white! border-surface-200"
                        :invalid="!!errors.email"
                    />
                    <Message v-if="errors.email" severity="error" size="small" variant="simple">
                        {{ errors.email[0] }}
                    </Message>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="address" class="font-medium text-surface-900">
                        Address
                    </label>
                    <Textarea 
                        id="address" 
                        v-model="form.address"
                        rows="3"
                        placeholder="Jl. Merdeka No. 10, Jakarta"
                        fluid
                        class="bg-surface-50! focus:bg-white! border-surface-200"
                    />
                </div>

                <div class="flex flex-col gap-2">
                    <label for="notes" class="font-medium text-surface-900">
                        Notes
                    </label>
                    <Textarea 
                        id="notes" 
                        v-model="form.notes"
                        rows="2"
                        placeholder="Catatan tambahan mengenai supplier..."
                        fluid
                        class="bg-surface-50! focus:bg-white! border-surface-200"
                    />
                </div>
                
                <div class="flex justify-end pt-4 border-t border-surface-100 gap-3">
                    <Button type="button" label="Cancel" severity="secondary" text @click="router.back" />
                    <Button type="submit" label="Save Supplier" icon="pi pi-check" :loading="loading" />
                </div>
            </form>
        </div>
    </div>
</template>
