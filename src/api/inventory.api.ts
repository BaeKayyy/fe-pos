import api from './axios';
import type {
    InventorySummary,
    InventoryAlert,
    StockHistory,
    StockAdjustmentPayload,
    StockHistoryQueryParams
} from '@/types/inventory';
import type { Product } from '@/types/product';

export const getInventorySummary = () =>
    api.get<{ success: boolean; message: string; data: InventorySummary }>('/inventory/summary');

export const getInventoryAlerts = (limit: number = 20) =>
    api.get<{ success: boolean; message: string; data: InventoryAlert[] }>('/inventory/alerts', {
        params: { limit }
    });

export const getStockHistories = (params?: StockHistoryQueryParams) =>
    api.get<{
        success: boolean;
        message: string;
        data: {
            data: StockHistory[];
            meta: {
                current_page: number;
                last_page: number;
                per_page: number;
                total: number;
            };
        };
    }>('/inventory/history', { params });

export const adjustProductStock = (productId: number, payload: StockAdjustmentPayload) =>
    api.post<{ success: boolean; message: string; data: Product }>(`/products/${productId}/stock-adjustment`, payload);
