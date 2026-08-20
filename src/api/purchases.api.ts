import api from "./axios";
import type { CreatePurchasePayload } from "@/types/purchase";

export const getPurchases = (params?: {
    page?: number
    search?: string
    status?: string
    supplier_id?: number
    start_date?: string
    end_date?: string
    limit?: number
}) => api.get('/purchases', { params })

export const getPurchase = (id: number) => api.get(`/purchases/${id}`)

export const createPurchase = (payload: CreatePurchasePayload) =>
    api.post('/purchases', payload)

export const updatePurchase = (id: number, payload: Partial<CreatePurchasePayload>) =>
    api.put(`/purchases/${id}`, payload)

export const receivePurchase = (id: number) =>
    api.post(`/purchases/${id}/receive`)

export const cancelPurchase = (id: number) =>
    api.post(`/purchases/${id}/cancel`)
