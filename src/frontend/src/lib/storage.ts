export interface AdminUser {
  name: string;
  username: string;
  password: string;
}

export interface Employee {
  empId: string;
  name: string;
  username: string;
  password: string;
  jobTitle: string;
  department: string;
  status: "active" | "inactive";
}

export interface CurrentUser {
  username: string;
  role: "admin" | "employee";
  name: string;
  empId?: string;
}

export interface SalaryRecord {
  id: string;
  empId: string;
  month: number;
  year: number;
  basicPay: number;
  allowances: number;
  deductions: number;
  netPay: number;
}

export interface ContractRecord {
  id: string;
  title: string;
  type: "IN" | "OUT";
  clientVendor: string;
  value: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "cancelled";
}

export interface ProfitLossEntry {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface ProfitLossData {
  income: ProfitLossEntry[];
  expenses: ProfitLossEntry[];
}

export type AttendanceMap = Record<string, "P" | "A">;

export const storage = {
  getAdmin: (): AdminUser | null => {
    const d = localStorage.getItem("gpAdmin");
    return d ? JSON.parse(d) : null;
  },
  setAdmin: (admin: AdminUser) =>
    localStorage.setItem("gpAdmin", JSON.stringify(admin)),

  getEmployees: (): Employee[] => {
    const d = localStorage.getItem("gpEmployees");
    return d ? JSON.parse(d) : [];
  },
  setEmployees: (emps: Employee[]) =>
    localStorage.setItem("gpEmployees", JSON.stringify(emps)),

  getCurrentUser: (): CurrentUser | null => {
    const d = localStorage.getItem("gpCurrentUser");
    return d ? JSON.parse(d) : null;
  },
  setCurrentUser: (u: CurrentUser | null) => {
    if (u) localStorage.setItem("gpCurrentUser", JSON.stringify(u));
    else localStorage.removeItem("gpCurrentUser");
  },

  getAttendance: (): AttendanceMap => {
    const d = localStorage.getItem("gpAttendance");
    return d ? JSON.parse(d) : {};
  },
  setAttendance: (a: AttendanceMap) =>
    localStorage.setItem("gpAttendance", JSON.stringify(a)),

  getSalary: (): SalaryRecord[] => {
    const d = localStorage.getItem("gpSalary");
    return d ? JSON.parse(d) : [];
  },
  setSalary: (s: SalaryRecord[]) =>
    localStorage.setItem("gpSalary", JSON.stringify(s)),

  getContracts: (): ContractRecord[] => {
    const d = localStorage.getItem("gpContracts");
    return d ? JSON.parse(d) : [];
  },
  setContracts: (c: ContractRecord[]) =>
    localStorage.setItem("gpContracts", JSON.stringify(c)),

  getProfitLoss: (): ProfitLossData => {
    const d = localStorage.getItem("gpProfitLoss");
    return d ? JSON.parse(d) : { income: [], expenses: [] };
  },
  setProfitLoss: (pl: ProfitLossData) =>
    localStorage.setItem("gpProfitLoss", JSON.stringify(pl)),
};

export function downloadCSV(filename: string, rows: string[][]): void {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateId(prefix: string, existing: string[]): string {
  let n = existing.length + 1;
  let id = `${prefix}${String(n).padStart(3, "0")}`;
  while (existing.includes(id)) {
    n++;
    id = `${prefix}${String(n).padStart(3, "0")}`;
  }
  return id;
}

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
