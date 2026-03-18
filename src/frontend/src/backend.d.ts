import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export type ContractType = {
    __kind__: "in";
    in: {
        client: string;
    };
} | {
    __kind__: "out";
    out: {
        vendor: string;
    };
};
export interface Record_ {
    id: bigint;
    title: string;
    contractType: ContractType;
    details: Contract;
}
export interface Employee {
    id: bigint;
    active: boolean;
    name: string;
    department: Department;
}
export interface ExpenseEntry {
    date: Time;
    description: string;
    category: string;
    amount: number;
}
export interface IncomeEntry {
    date: Time;
    description: string;
    category: string;
    amount: number;
}
export interface UserProfile {
    name: string;
    employeeId?: bigint;
}
export interface Contract {
    id: bigint;
    title: string;
    endDate: Time;
    value: number;
    contractType: ContractType;
    contractStatus: ContractStatus;
    startDate: Time;
}
export enum ContractStatus {
    active = "active",
    cancelled = "cancelled",
    completed = "completed"
}
export enum Department {
    hr = "hr",
    finance = "finance",
    marketing = "marketing",
    sales = "sales",
    engineering = "engineering",
    operations = "operations"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addContract(title: string, contractType: ContractType, value: number, startDate: Time, endDate: Time, status: ContractStatus): Promise<bigint>;
    addEmployee(name: string, department: Department): Promise<bigint>;
    addExpense(date: Time, category: string, description: string, amount: number): Promise<bigint>;
    addIncome(date: Time, category: string, description: string, amount: number): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContract(id: bigint): Promise<Contract>;
    getContractByTitle(title: string): Promise<Array<Record_>>;
    getEmployee(id: bigint): Promise<Employee>;
    getExpense(id: bigint): Promise<ExpenseEntry>;
    getIncome(id: bigint): Promise<IncomeEntry>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    linkEmployeeToPrincipal(employeeId: bigint, principal: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchContractByTitle(title: string): Promise<Array<Record_>>;
}
