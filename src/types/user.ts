

export type Role = 'ADMIN' | 'CASHIER';

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
}