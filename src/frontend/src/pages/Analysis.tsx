import { ArrowLeft } from "lucide-react";
import Layout from "../components/Layout";
import { useNavigate } from "../lib/router";
import { MONTHS, storage } from "../lib/storage";

export default function Analysis() {
  const navigate = useNavigate();
  const employees = storage.getEmployees();
  const contracts = storage.getContracts();
  const salary = storage.getSalary();
  const pl = storage.getProfitLoss();
  const attendance = storage.getAttendance();
  const today = new Date();

  const currentYear = today.getFullYear();
  const attendanceByMonth = MONTHS.map((_, mi) => {
    const m = mi + 1;
    const daysInMonth = new Date(currentYear, m, 0).getDate();
    const totalSlots = employees.length * daysInMonth;
    const presentCount = Object.entries(attendance).filter(([k, v]) => {
      const parts = k.split("-");
      return (
        Number.parseInt(parts[0]) === currentYear &&
        Number.parseInt(parts[1]) === m &&
        v === "P"
      );
    }).length;
    return totalSlots > 0 ? Math.round((presentCount / totalSlots) * 100) : 0;
  });

  const salaryByMonth = MONTHS.map((_, mi) => {
    const m = mi + 1;
    return salary
      .filter((s) => s.month === m && s.year === currentYear)
      .reduce((sum, s) => sum + s.netPay, 0);
  });

  const inContracts = contracts.filter((c) => c.type === "IN");
  const outContracts = contracts.filter((c) => c.type === "OUT");
  const inValue = inContracts.reduce((s, c) => s + c.value, 0);
  const outValue = outContracts.reduce((s, c) => s + c.value, 0);

  const plByMonth = MONTHS.map((_, mi) => {
    const m = mi + 1;
    const income = pl.income
      .filter((i) => {
        const d = new Date(i.date);
        return d.getMonth() + 1 === m && d.getFullYear() === currentYear;
      })
      .reduce((s, i) => s + i.amount, 0);
    const expense = pl.expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() + 1 === m && d.getFullYear() === currentYear;
      })
      .reduce((s, e) => s + e.amount, 0);
    return { income, expense, net: income - expense };
  });

  const maxSalary = Math.max(...salaryByMonth, 1);

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-8 md:py-5 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            data-ocid="analysis.back.button"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            Analysis &amp; Insights
          </h1>
        </div>
        <span className="text-sm text-gray-500">{currentYear} Overview</span>
      </div>

      <div className="p-4 md:p-8 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Employees",
              value: employees.length,
              color: "#2F6FEA",
            },
            {
              label: "Active Contracts",
              value: contracts.filter((c) => c.status === "active").length,
              color: "#18B6B2",
            },
            {
              label: "Total Contract Value",
              value: `RM ${[...inContracts, ...outContracts].reduce((s, c) => s + c.value, 0).toLocaleString()}`,
              color: "#EA8C2F",
            },
            {
              label: "YTD Net Profit",
              value: `RM ${plByMonth.reduce((s, m) => s + m.net, 0).toLocaleString()}`,
              color: "#16A34A",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="text-xs text-gray-400 font-semibold uppercase mb-1">
                {s.label}
              </div>
              <div
                className="text-lg md:text-xl font-bold"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Attendance Rate */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4">
            Attendance Rate by Month ({currentYear})
          </h2>
          <div className="flex items-end gap-1 md:gap-2 h-32">
            {MONTHS.map((m, i) => (
              <div key={m} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 font-medium hidden sm:block">
                  {attendanceByMonth[i]}%
                </span>
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${Math.max(attendanceByMonth[i], 4)}%`,
                    background:
                      attendanceByMonth[i] >= 80
                        ? "#18B6B2"
                        : attendanceByMonth[i] >= 60
                          ? "#2F6FEA"
                          : "#EA8C2F",
                    minHeight: 4,
                  }}
                />
                <span className="text-xs text-gray-400">{m.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Salary & Contracts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-4">
              Monthly Payroll (RM)
            </h2>
            <div className="space-y-2">
              {MONTHS.map((m, i) => (
                <div key={m} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-8">
                    {m.slice(0, 3)}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(salaryByMonth[i] / maxSalary) * 100}%`,
                        background: "#7C3AED",
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-20 md:w-24 text-right">
                    RM {salaryByMonth[i].toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-4">Contract Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-teal-50 rounded-xl">
                <div>
                  <div className="text-xs text-teal-600 font-semibold">
                    CONTRACT IN (Client)
                  </div>
                  <div className="text-lg font-bold text-teal-700">
                    {inContracts.length} contracts
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Total Value</div>
                  <div className="font-bold text-teal-700">
                    RM {inValue.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                <div>
                  <div className="text-xs text-orange-600 font-semibold">
                    CONTRACT OUT (Vendor)
                  </div>
                  <div className="text-lg font-bold text-orange-700">
                    {outContracts.length} contracts
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Total Value</div>
                  <div className="font-bold text-orange-700">
                    RM {outValue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly P&L table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4">
            Monthly Profit &amp; Loss ({currentYear})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#F4F6F9" }}>
                  {[
                    "Month",
                    "Income (RM)",
                    "Expenses (RM)",
                    "Net (RM)",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MONTHS.map((m, i) => (
                  <tr key={m} className="border-t border-gray-50">
                    <td className="px-4 py-2 text-gray-700 font-medium">{m}</td>
                    <td className="px-4 py-2 text-green-600">
                      {plByMonth[i].income.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-red-500">
                      {plByMonth[i].expense.toLocaleString()}
                    </td>
                    <td
                      className={`px-4 py-2 font-bold ${plByMonth[i].net >= 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {plByMonth[i].net.toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      {plByMonth[i].income > 0 || plByMonth[i].expense > 0 ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${plByMonth[i].net >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                        >
                          {plByMonth[i].net >= 0 ? "Profit" : "Loss"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">No data</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4">Key Insights</h2>
          <ul className="space-y-2">
            {(
              [
                `Total workforce: ${employees.filter((e) => e.status === "active").length} active employees out of ${employees.length}`,
                `Contracts portfolio: ${inContracts.length} client contracts (IN) vs ${outContracts.length} vendor contracts (OUT)`,
                `Year-to-date payroll: RM ${salaryByMonth.reduce((s, v) => s + v, 0).toLocaleString()}`,
                `Best attendance month: ${MONTHS[attendanceByMonth.indexOf(Math.max(...attendanceByMonth, 0))] || "N/A"} (${Math.max(...attendanceByMonth, 0)}%)`,
                `Net profit/loss this year: RM ${plByMonth.reduce((s, m) => s + m.net, 0).toLocaleString()}`,
              ] as string[]
            ).map((insight, idx) => (
              <li
                key={insight.slice(0, 30)}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <span
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5"
                  style={{ background: "#2F6FEA" }}
                >
                  {idx + 1}
                </span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
