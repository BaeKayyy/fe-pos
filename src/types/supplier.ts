export interface Supplier {
    id: number
    name: string
    contact_person?: string | null
    phone?: string | null
    email?: string | null
    address?: string | null
    notes?: string | null
    created_at?: string
    updated_at?: string
}

export interface CreateSupplierPayload {
    name: string
    contact_person?: string | null
    phone?: string | null
    email?: string | null
    address?: string | null
    notes?: string | null
}
