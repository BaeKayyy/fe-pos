export interface InventorySummary {
    total_products: number;
    total_stock: number;
    low_stock: number;
    out_of_stock: number;
}

export interface InventoryAlert {
    product_id: number;
    product_name: string;
    category_name: string;
    stock: number;
    threshold: number;
    status: 'low_stock' | 'out_of_stock';
    image?: string | null;
}

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface StockHistory {
    id: number;
    product_id: number;
    product?: {
        id: number;
        name: string;
        image?: string | null;
    } | null;
    user_id?: number | null;
    user?: {
        id: number;
        name: string;
        email: string;
    } | null;
    type: StockMovementType;
    quantity_before: number;
    quantity_change: number;
    quantity_after: number;
    reference_type?: string | null;
    reference_id?: string | null;
    notes?: string | null;
    created_at?: string | null;
    formatted_date?: string | null;
}

export interface StockAdjustmentPayload {
    type: StockMovementType;
    quantity: number;
    notes?: string;
}

export interface StockHistoryQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    product_id?: number;
    start_date?: string;
    end_date?: string;
}
