import type { Supplier } from "./supplier"
import type { Product } from "./product"
import type { User } from "./user"

export type PurchaseStatus = 'DRAFT' | 'RECEIVED' | 'CANCELLED'

export interface PurchaseItem {
    id?: number
    purchase_id?: number
    product_id: number
    product?: Product
    quantity: number
    cost_price: number
    subtotal: number
}

export interface Purchase {
    id: number
    code: string
    status: PurchaseStatus
    supplier_id: number
    supplier?: Supplier
    items?: PurchaseItem[]
    subtotal: number
    total: number
    notes?: string | null
    created_by: number
    created_by_user?: User
    received_by?: number | null
    received_by_user?: User | null
    received_at?: string | null
    created_at: string
    updated_at: string
}

export interface CreatePurchaseItemPayload {
    product_id: number
    quantity: number
    cost_price: number
}

export interface CreatePurchasePayload {
    supplier_id: number
    notes?: string | null
    items: CreatePurchaseItemPayload[]
}
