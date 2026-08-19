import { defineStore } from "pinia";
import type { User } from "@/types/user"
import { loginApi, logoutApi, meApi } from "@/api/auth.api";



export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as User | null,
        loading: false,
        isAuthenticated: !!localStorage.getItem('token')
    }),

    getters: {
        userRole: (state): string => state.user?.role || 'CASHIER',
        isAdmin: (state): boolean => state.user?.role === 'ADMIN',
        isCashier: (state): boolean => state.user?.role === 'CASHIER',
        hasRole: (state) => (allowedRoles: string | string[]): boolean => {
            if (!state.user) return false;
            const userRole = state.user.role || 'CASHIER';
            if (Array.isArray(allowedRoles)) {
                return allowedRoles.includes(userRole);
            }
            return userRole === allowedRoles;
        }
    },

    
    actions:{
        async login(email:string, password:string){
            this.loading = true
            try {
                const res = await loginApi({email, password})
                localStorage.setItem('token', res.data.data.token)
                
                this.isAuthenticated = true
                await this.fetchUser()
            } finally {
                this.loading = false
            }
        },
        
        async fetchUser(){
            const res = await meApi()
            
            this.user = res.data.data
        },
        async logout(){
            try {
                await logoutApi()
            } finally  {
                localStorage.removeItem('token')
                this.user = null
                this.isAuthenticated = false
            }
        }
    }
})