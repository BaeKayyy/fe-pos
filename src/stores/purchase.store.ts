import { getPurchases, getPurchase } from "@/api/purchases.api";
import type { Purchase } from "@/types/purchase";
import { defineStore } from "pinia";

export const usePurchaseStore = defineStore('purchase', {
    state: () => ({
        items: [] as Purchase[],
        purchaseDetail: null as Purchase | null,
        pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
            from: 0,
            to: 0
        },
        page: 1,
        limit: 10,
        search: '',
        status: '',
        supplierId: undefined as number | undefined,
        loading: false,
        submitting: false
    }),

    getters: {
        currentPage: (state) => state.pagination.current_page || 1,
        totalPages: (state) => state.pagination.last_page || 1
    },

    actions: {
        async fetch() {
            this.loading = true

            try {
                const res = await getPurchases({
                    page: this.page,
                    search: this.search,
                    status: this.status || undefined,
                    supplier_id: this.supplierId,
                    limit: this.limit
                })

                this.items = res.data.data.items
                this.pagination = res.data.data.pagination
            } catch (error) {
                console.error('Failed to fetch purchases: ', error)
            } finally {
                this.loading = false
            }
        },

        async fetchDetail(id: number) {
            this.loading = true
            try {
                const res = await getPurchase(id)
                this.purchaseDetail = res.data.data
                return res.data.data
            } catch (error) {
                console.error('Failed to fetch purchase detail: ', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        setStatusFilter(status: string) {
            this.status = status
            this.page = 1
            this.fetch()
        },

        setSupplierFilter(supplierId?: number) {
            this.supplierId = supplierId
            this.page = 1
            this.fetch()
        },

        setPage(page: number) {
            this.page = page
            this.fetch()
        },

        setLimit(limit: number) {
            this.limit = limit
            this.page = 1
            this.fetch()
        },

        nextPage() {
            if (this.pagination.current_page < this.pagination.last_page) {
                this.page = this.pagination.current_page + 1
                this.fetch()
            }
        },

        prevPage() {
            if (this.pagination.current_page > 1) {
                this.page = this.pagination.current_page - 1
                this.fetch()
            }
        }
    }
})
