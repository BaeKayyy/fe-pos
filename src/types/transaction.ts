import type { Customer } from './customer';
import type { Product } from './product';

export interface TransactionProduct {
    id: number;
    name: string;
    image?: string | null;
}

export interface TransactionItem {
    id: number;
    product?: TransactionProduct | null;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface Transaction {
    id: number;
    code: string;
    customer?: Customer | null;
    items?: TransactionItem[];
    subtotal: number;
    tax: number;
    total: number;
    created_at?: string;
}

export interface CartItem {
    product: Product ,
    quantity: number
}
