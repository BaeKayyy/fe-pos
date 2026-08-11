import api from "./axios";

export const getCategories =(params?: {
    page?: number
    search?: string
    limit?:number
}) => api.get('product-categories', {params})