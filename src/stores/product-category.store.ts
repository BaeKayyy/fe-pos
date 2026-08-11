import { getCategories } from "@/api/product-categories.api";
import type { ProductCategory } from "@/types/product-category";
import { defineStore } from "pinia";

export const useProductCategoryStore = defineStore('productCategory',{
    state: () => ({
        items: [] as ProductCategory[],
        pagination:{
            current_page:1,
            last_page:1,
            per_page:10,
            total:0,
            from:0,
            to:0
        },
        page: 1,
        limit:10,
        search:'',
        loading: false
    }),
    
    actions: {
        async fetch(){
            this.loading = true
            
            try {
                const res = await getCategories({
                    page: this.page,
                    search: this.search,
                    limit: this.limit
                })
                
                this.items = res.data.data.items
                this.pagination = res.data.data.pagination
            } catch (error) {
                console.error('failed to fetch categories: ', error)
            } finally{
                this.loading = false
            }
        },
        
        setLimit(limit: number){
            this.limit = limit
            this.page= 1
            this.fetch()
        }
    }
})