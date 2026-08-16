export interface DashboardSummary {
    total_sales: number;
    sales_growth_percentage: number | null;
    sales_growth_label: string;
    total_transactions: number;
    transactions_growth_percentage: number | null;
    transactions_growth_label: string;
    total_products: number;
    low_stock_count: number;
    total_customers: number;
    customers_growth_percentage: number | null;
    customers_growth_label: string;
}

export interface SalesPoint {
    date: string;
    label: string;
    total: number;
}

export interface SalesOverview {
    period: string;
    total_sales: number;
    points: SalesPoint[];
}

export interface LowStockProduct {
    id: number;
    name: string;
    stock: number;
    price: number;
    image: string | null;
    category_name?: string | null;
    status: string;
}

export interface TopProduct {
    id: number;
    name: string;
    image: string | null;
    sold_quantity: number;
    percentage: number;
}

export interface RecentTransaction {
    id: number;
    code: string;
    customer_name: string;
    total: number;
    date: string;
    created_at: string;
}
