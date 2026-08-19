import type { ProductCategory } from './product-category'

export interface Product {
    id: number
    product_category_id: number
    name: string
    price: number
    stock: number
    low_stock_threshold?: number
    stock_status?: string
    image?: string | null
    category?: ProductCategory | null
    updated_at?: string | null
}

