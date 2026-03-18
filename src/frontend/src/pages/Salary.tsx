import { ArrowLeft, Plus, X } from "lucide-react";
import { useState } from "react";
import DownloadButton from "../components/DownloadButton";
import Layout from "../components/Layout";
import { useNavigate } from "../lib/router";
import { MONTHS, generateId, storage } from "../lib/storage";
import type { SalaryRecord } from "../lib/storage";

export default function Salary() {
  const navigate = useNavigate();
  const user = storage.getCurrentUser();
  const isAdmin = user?.role === "admin";
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [records, setRecords] = useState<SalaryRecord[]>(storage.getSalary());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    empId: "",
    basicPay: "",
    allowances: "",
    deductions: "",
  });
  const employees = storage.getEmployees().filter((e) => e.status === "active");
  const years = [
    today.getFullYear() - 2,
    today.getFullYear() - 1,
    today.getFullYear(),
    today.getFullYear() + 1,
  ];

  const filtered = records.filter((r) => r.month === month && r.year === year);
  const display = isAdmin
    ? filtered
    : filtered.filter((r) => r.empId === user?.empId);

  function save() {
    const bp = Number.parseFloat(form.basicPay) || 0;
    const al = Number.parseFloat(form.allowances) || 0;
    const de = Number.parseFloat(form.deductions) || 0;
    const existing = records.find(
      (r) => r.empId === form.empId && r.month === month && r.year === year,
    );
    let updated: SalaryRecord[];
    if (existing) {
      updated = records.map((r) =>
        r.id === existing.id
          ? {
              ...r,
              basicPay: bp,
              allowances: al,
              deductions: de,
              netPay: bp + al - de,
            }
          : r,
      );
    } else {
      const newRec: SalaryRecord = {
        id: generateId(
          "SAL-",
          records.map((r) => r.id),
        ),
        empId: form.empId,
        month,
        year,
        basicPay: bp,
        allowances: al,
        deductions: de,
        netPay: bp + al - de,
      };
      updated = [...records, newRec];
    }
    storage.setSalary(updated);
    setRecords(updated);
    setShowModal(false);
    setForm({ empId: "", basicPay: "", allowances: "", deductions: "" });
  }

  const totalPayroll = display.reduce((s, r) => s + r.netPay, 0);

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-8 md:py-5 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            data-ocid="salary.back.button"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Salary Management</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(+e.target.value)}
            data-ocid="salary.month.select"
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
            data-ocid="salary.year.select"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              data-ocid="salary.add.button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: "#2F6FEA" }}
            >
              <Plus size={16} /> Add Salary
            </button>
          )}
          <DownloadButton />
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#F4F6F9" }}>
                  {[
                    "Emp ID",
                    "Name",
                    "Job Title",
                    "Basic Pay",
                    "Allowances",
                    "Deductions",
                    "Net Pay",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {display.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-400"
                      data-ocid="salary.empty_state"
                    >
                      No salary records for {MONTHS[month - 1]} {year}
                    </td>
                  </tr>
                ) : (
                  display.map((r, idx) => {
                    const emp = employees.find((e) => e.empId === r.empId);
                    return (
                      <tr
                        key={r.id}
                        data-ocid={`salary.item.${idx + 1}`}
                        className="border-t border-gray-50 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-mono text-blue-600 whitespace-nowrap">
                          {r.empId}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                          {emp?.name || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {emp?.jobTitle || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          RM {r.basicPay.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-green-600 whitespace-nowrap">
                          +RM {r.allowances.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-red-500 whitespace-nowrap">
                          -RM {r.deductions.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                          RM {r.netPay.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {display.length > 0 && (
                <tfoot>
                  <tr
                    className="border-t-2 border-gray-200"
                    style={{ background: "#F4F6F9" }}
                  >
                    <td
                      colSpan={6}
                      className="px-4 py-3 font-bold text-gray-700 text-right"
                    >
                      Total Payroll:
                    </td>
                    <td className="px-4 py-3 font-bold text-blue-700 text-lg whitespace-nowrap">
                      RM {totalPayroll.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            data-ocid="salary.dialog"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Add / Edit Salary
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                data-ocid="salary.close_button"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              {MONTHS[month - 1]} {year}
            </p>
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">
                  Employee
                </div>
                <select
                  value={form.empId}
                  onChange={(e) => setForm({ ...form, empId: e.target.value })}
                  data-ocid="salary.employee.select"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select employee...</option>
                  {employees.map((e) => (
                    <option key={e.empId} value={e.empId}>
                      {e.empId} - {e.name}
                    </option>
                  ))}
                </select>
              </div>
              {[
                { key: "basicPay", label: "Basic Pay (RM)" },
                { key: "allowances", label: "Allowances (RM)" },
                { key: "deductions", label: "Deductions (RM)" },
              ].map((f) => (
                <div key={f.key}>
                  <div className="text-xs font-semibold text-gray-500 uppercase">
                    {f.label}
                  </div>
                  <input
                    type="number"
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value })
                    }
                    data-ocid={`salary.${f.key}.input`}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
              ))}
              <div className="bg-blue-50 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-500">Net Pay: </span>
                <span className="font-bold text-blue-700">
                  RM{" "}
                  {(
                    (Number.parseFloat(form.basicPay) || 0) +
                    (Number.parseFloat(form.allowances) || 0) -
                    (Number.parseFloat(form.deductions) || 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                data-ocid="salary.cancel_button"
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!form.empId}
                data-ocid="salary.submit_button"
                className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50"
                style={{ background: "#2F6FEA" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
