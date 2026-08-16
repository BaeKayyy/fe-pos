import api from './axios';
import type {
    DashboardSummary,
    SalesOverview,
    LowStockProduct,
    TopProduct,
    RecentTransaction
} from '@/types/dashboard';

export const getDashboardSummary = (period?: string) =>
    api.get<{ success: boolean; message: string; data: DashboardSummary }>('/dashboard/summary', {
        params: { period }
    });

export const getDashboardSales = (period?: string) =>
    api.get<{ success: boolean; message: string; data: SalesOverview }>('/dashboard/sales', {
        params: { period }
    });

export const getDashboardLowStock = (limit?: number, threshold?: number) =>
    api.get<{ success: boolean; message: string; data: LowStockProduct[] }>('/dashboard/low-stock', {
        params: { limit, threshold }
    });

export const getDashboardTopProducts = (period?: string, limit?: number) =>
    api.get<{ success: boolean; message: string; data: TopProduct[] }>('/dashboard/top-products', {
        params: { period, limit }
    });

export const getDashboardRecentTransactions = (limit?: number) =>
    api.get<{ success: boolean; message: string; data: RecentTransaction[] }>('/dashboard/recent-transactions', {
        params: { limit }
    });
