import {
  BarChart2,
  ClipboardCheck,
  DollarSign,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";
import DownloadButton from "../components/DownloadButton";
import Layout from "../components/Layout";
import { useNavigate } from "../lib/router";
import { storage } from "../lib/storage";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = storage.getCurrentUser();
  const employees = storage.getEmployees();
  const contracts = storage.getContracts();
  const salary = storage.getSalary();
  const pl = storage.getProfitLoss();

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const attendance = storage.getAttendance();
  const todayPresent = employees.filter(
    (e) => attendance[`${todayStr}-${e.empId}`] === "P",
  ).length;

  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const monthlySalary = salary
    .filter((s) => s.month === currentMonth && s.year === currentYear)
    .reduce((sum, s) => sum + s.netPay, 0);
  const activeContracts = contracts.filter((c) => c.status === "active").length;

  const monthIncome = pl.income
    .filter((i) => {
      const d = new Date(i.date);
      return (
        d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
      );
    })
    .reduce((sum, i) => sum + i.amount, 0);
  const monthExpense = pl.expenses
    .filter((e) => {
      const d = new Date(e.date);
      return (
        d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);
  const netProfit = monthIncome - monthExpense;

  const cards = [
    {
      label: "Total Employees",
      value: employees.length,
      sub: `${employees.filter((e) => e.status === "active").length} active`,
      icon: Users,
      color: "#2F6FEA",
      bg: "#EBF2FF",
      path: "/employees",
    },
    {
      label: "Attendance Today",
      value: `${todayPresent}/${employees.length}`,
      sub: "Present today",
      icon: ClipboardCheck,
      color: "#18B6B2",
      bg: "#E6FAF9",
      path: "/attendance",
    },
    {
      label: "Monthly Payroll",
      value: `RM ${monthlySalary.toLocaleString()}`,
      sub: `${today.toLocaleString("default", { month: "long" })} ${currentYear}`,
      icon: DollarSign,
      color: "#7C3AED",
      bg: "#F3EEFF",
      path: "/salary",
    },
    {
      label: "Active Contracts",
      value: activeContracts,
      sub: `${contracts.length} total contracts`,
      icon: FileText,
      color: "#EA8C2F",
      bg: "#FFF3E6",
      path: "/contracts",
    },
    {
      label: "Net Profit (Month)",
      value: `RM ${netProfit.toLocaleString()}`,
      sub: netProfit >= 0 ? "Profitable" : "Loss this month",
      icon: TrendingUp,
      color: netProfit >= 0 ? "#16A34A" : "#DC2626",
      bg: netProfit >= 0 ? "#E6FFF0" : "#FFF0F0",
      path: "/profit-loss",
    },
    {
      label: "Analysis",
      value: "View Insights",
      sub: "Performance overview",
      icon: BarChart2,
      color: "#4F46E5",
      bg: "#EEEFFF",
      path: "/analysis",
    },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-8 md:py-5 bg-white border-b border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            GP Industries Overview
          </h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">
            {today.toLocaleDateString("en-MY", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <DownloadButton />
        </div>
      </div>

      {/* Cards */}
      <div className="p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {cards.map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={() => navigate(card.path)}
              data-ocid={`dashboard.${card.label.toLowerCase().replace(/[^a-z0-9]/g, "-")}.card`}
              className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 text-left w-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: card.bg }}
                >
                  <card.icon size={22} style={{ color: card.color }} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">
                {card.label}
              </div>
              <div className="text-xs text-gray-400">{card.sub}</div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400 py-4 border-t border-gray-100">
          © {new Date().getFullYear()} Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </Layout>
  );
}
