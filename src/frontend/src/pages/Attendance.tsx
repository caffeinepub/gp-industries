import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import DownloadButton from "../components/DownloadButton";
import Layout from "../components/Layout";
import { useNavigate } from "../lib/router";
import { MONTHS, storage } from "../lib/storage";

const currentYear = new Date().getFullYear();

export default function Attendance() {
  const navigate = useNavigate();
  const user = storage.getCurrentUser();
  const isAdmin = user?.role === "admin";
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [attendance, setAttendance] = useState(storage.getAttendance());

  const employees = storage.getEmployees().filter((e) => e.status === "active");
  const displayEmps = isAdmin
    ? employees
    : employees.filter((e) => e.empId === user?.empId);
  const daysInMonth = new Date(year, month, 0).getDate();
  const years = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
  ];

  function toggle(empId: string, day: number) {
    if (!isAdmin) return;
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}-${empId}`;
    const current = attendance[key] || "A";
    const updated = {
      ...attendance,
      [key]: current === "P" ? ("A" as const) : ("P" as const),
    };
    setAttendance(updated);
    storage.setAttendance(updated);
  }

  function getVal(empId: string, day: number): "P" | "A" {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}-${empId}`;
    return attendance[key] || "A";
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-8 md:py-5 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            data-ocid="attendance.back.button"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Attendance</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(+e.target.value)}
            data-ocid="attendance.month.select"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(+e.target.value)}
            data-ocid="attendance.year.select"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <DownloadButton />
        </div>
      </div>

      <div className="p-4 md:p-8">
        {isAdmin && (
          <p className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg mb-4">
            Admin: Click any cell to toggle attendance between P (Present) and A
            (Absent)
          </p>
        )}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-auto">
          <table className="text-xs min-w-full">
            <thead>
              <tr style={{ background: "#F4F6F9" }}>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 sticky left-0 bg-gray-50 z-10">
                  Emp ID
                </th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 sticky left-16 bg-gray-50 z-10">
                  Name
                </th>
                {days.map((d) => (
                  <th
                    key={d}
                    className="px-2 py-3 text-center font-semibold text-gray-500 min-w-8"
                  >
                    {d}
                  </th>
                ))}
                <th className="px-3 py-3 text-center font-semibold text-green-600">
                  P
                </th>
                <th className="px-3 py-3 text-center font-semibold text-red-500">
                  A
                </th>
              </tr>
            </thead>
            <tbody>
              {displayEmps.length === 0 ? (
                <tr>
                  <td
                    colSpan={daysInMonth + 4}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="attendance.empty_state"
                  >
                    No employees found
                  </td>
                </tr>
              ) : (
                displayEmps.map((emp, idx) => {
                  const totalP = days.filter(
                    (d) => getVal(emp.empId, d) === "P",
                  ).length;
                  const totalA = days.length - totalP;
                  return (
                    <tr
                      key={emp.empId}
                      data-ocid={`attendance.item.${idx + 1}`}
                      className="border-t border-gray-50 hover:bg-gray-50"
                    >
                      <td className="px-3 py-2 font-mono text-blue-600 sticky left-0 bg-white z-10">
                        {emp.empId}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-700 sticky left-16 bg-white z-10 whitespace-nowrap">
                        {emp.name}
                      </td>
                      {days.map((d) => {
                        const val = getVal(emp.empId, d);
                        return (
                          <td key={d} className="px-1 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => toggle(emp.empId, d)}
                              disabled={!isAdmin}
                              className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                                val === "P"
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-red-100 text-red-600 hover:bg-red-200"
                              } ${!isAdmin ? "cursor-default" : "cursor-pointer"}`}
                            >
                              {val}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-center font-bold text-green-600">
                        {totalP}
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-red-500">
                        {totalA}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
