<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Button, Dialog, InputNumber, Select, Textarea, useToast } from 'primevue';
import { adjustProductStock } from '@/api/inventory.api';
import type { Product } from '@/types/product';
import type { StockMovementType } from '@/types/inventory';

const props = defineProps<{
    visible: boolean;
    product: Product | null;
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'success'): void;
}>();

const toast = useToast();
const loading = ref(false);
const errorMessage = ref('');

const adjustmentType = ref<StockMovementType>('IN');
const quantity = ref<number>(1);
const notes = ref<string>('');

const typeOptions = [
    { label: 'Stock In (Add)', value: 'IN' },
    { label: 'Stock Out (Subtract)', value: 'OUT' },
    { label: 'Set Adjustment (Direct Set)', value: 'ADJUSTMENT' }
];

const currentStock = computed(() => props.product?.stock || 0);

const calculatedNewStock = computed(() => {
    const qty = quantity.value || 0;
    if (adjustmentType.value === 'IN') {
        return currentStock.value + qty;
    } else if (adjustmentType.value === 'OUT') {
        return currentStock.value - qty;
    } else {
        return qty;
    }
});

const isInvalid = computed(() => {
    if (!quantity.value && quantity.value !== 0) return true;
    if (quantity.value < 0) return true;
    if (calculatedNewStock.value < 0) return true;
    return false;
});

const resetForm = () => {
    adjustmentType.value = 'IN';
    quantity.value = 1;
    notes.value = '';
    errorMessage.value = '';
};

watch(() => props.visible, (newVal) => {
    if (newVal) {
        resetForm();
    }
});

const handleClose = () => {
    emit('update:visible', false);
};

const handleSubmit = async () => {
    if (!props.product || isInvalid.value) return;

    if (calculatedNewStock.value < 0) {
        errorMessage.value = 'Stock cannot be reduced below zero.';
        return;
    }

    loading.value = true;
    errorMessage.value = '';

    try {
        await adjustProductStock(props.product.id, {
            type: adjustmentType.value,
            quantity: quantity.value,
            notes: notes.value
        });

        emit('success');
        handleClose();
    } catch (err: any) {
        errorMessage.value = err?.response?.data?.message || 'Failed to adjust product stock.';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Dialog
        :visible="visible"
        @update:visible="emit('update:visible', $event)"
        modal
        header="Adjust Product Stock"
        class="w-full max-w-lg"
    >
        <div class="flex flex-col gap-5 py-2">
            <!-- Product Info Header -->
            <div class="p-4 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
                <div>
                    <div class="text-xs text-surface-500 font-medium">Product</div>
                    <div class="text-base font-bold text-surface-900 mt-0.5">{{ product?.name }}</div>
                </div>
                <div class="text-right">
                    <div class="text-xs text-surface-500 font-medium">Current Stock</div>
                    <div class="text-lg font-extrabold text-surface-900 mt-0.5">{{ currentStock }}</div>
                </div>
            </div>

            <!-- Error Banner -->
            <div v-if="errorMessage" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <i class="pi pi-exclamation-circle text-base text-red-500 flex-shrink-0"></i>
                <span>{{ errorMessage }}</span>
            </div>

            <!-- Form Fields -->
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-2">
                        Adjustment Type
                    </label>
                    <Select
                        v-model="adjustmentType"
                        :options="typeOptions"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                    />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-2">
                        Quantity
                    </label>
                    <InputNumber
                        v-model="quantity"
                        :min="0"
                        showButtons
                        buttonLayout="horizontal"
                        class="w-full"
                        inputClass="text-center font-bold"
                    />
                </div>

                <div>
                    <label class="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-2">
                        Notes (Optional)
                    </label>
                    <Textarea
                        v-model="notes"
                        rows="2"
                        placeholder="Reason for adjustment (e.g. Restock, Damaged goods, Audit correction)"
                        class="w-full text-sm"
                    />
                </div>

                <!-- Stock Calculation Preview -->
                <div class="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
                    <span class="text-xs font-semibold text-emerald-800">Resulting Stock:</span>
                    <span
                        :class="[
                            'text-xl font-bold',
                            calculatedNewStock < 0 ? 'text-red-600' : 'text-emerald-700'
                        ]"
                    >
                        {{ calculatedNewStock }}
                    </span>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2 pt-2">
                <Button
                    type="button"
                    label="Cancel"
                    severity="secondary"
                    outlined
                    @click="handleClose"
                    :disabled="loading"
                    class="!rounded-xl"
                />
                <Button
                    type="button"
                    label="Save Adjustment"
                    icon="pi pi-check"
                    severity="primary"
                    @click="handleSubmit"
                    :loading="loading"
                    :disabled="isInvalid || loading"
                    class="!rounded-xl"
                />
            </div>
        </template>
    </Dialog>
</template>
