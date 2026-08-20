import api from "./axios";
import type { CreateSupplierPayload } from "@/types/supplier";

export const getSuppliers = (params?: {
    page?: number
    search?: string
    limit?: number
}) => api.get('/suppliers', { params })

export const getSupplierOptions = (params?: { search?: string }) =>
    api.get('/suppliers/options', { params })

export const getSupplier = (id: number) => api.get(`/suppliers/${id}`)

export const createSupplier = (payload: CreateSupplierPayload) =>
    api.post('/suppliers', payload)

export const updateSupplier = (id: number, payload: Partial<CreateSupplierPayload>) =>
    api.put(`/suppliers/${id}`, payload)

export const deleteSupplier = (id: number) => api.delete(`/suppliers/${id}`)
