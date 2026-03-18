import { ArrowLeft, Plus, UserCheck, UserX, X } from "lucide-react";
import { useState } from "react";
import DownloadButton from "../components/DownloadButton";
import Layout from "../components/Layout";
import { useNavigate } from "../lib/router";
import { generateId, storage } from "../lib/storage";
import type { Employee } from "../lib/storage";

const DEPARTMENTS = [
  "hr",
  "finance",
  "marketing",
  "sales",
  "engineering",
  "operations",
];

export default function Employees() {
  const navigate = useNavigate();
  const user = storage.getCurrentUser();
  const isAdmin = user?.role === "admin";
  const [employees, setEmployees] = useState<Employee[]>(
    storage.getEmployees(),
  );
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    jobTitle: "",
    department: "hr",
  });
  const newEmpId = generateId(
    "EMP-",
    employees.map((e) => e.empId),
  );

  function save() {
    const emp: Employee = { empId: newEmpId, ...form, status: "active" };
    const updated = [...employees, emp];
    storage.setEmployees(updated);
    setEmployees(updated);
    setShowModal(false);
    setForm({
      name: "",
      username: "",
      password: "",
      jobTitle: "",
      department: "hr",
    });
  }

  function toggleStatus(empId: string) {
    const updated = employees.map((e) =>
      e.empId === empId
        ? {
            ...e,
            status:
              e.status === "active"
                ? ("inactive" as const)
                : ("active" as const),
          }
        : e,
    );
    storage.setEmployees(updated);
    setEmployees(updated);
  }

  const displayEmps = isAdmin
    ? employees
    : employees.filter((e) => e.empId === user?.empId);

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-8 md:py-5 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            data-ocid="employees.back.button"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Employee Details</h1>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              data-ocid="employees.add.button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: "#2F6FEA" }}
            >
              <Plus size={16} /> Add Employee
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
                    "Employee ID",
                    "Full Name",
                    "Username",
                    "Job Title",
                    "Department",
                    "Status",
                    ...(isAdmin ? ["Action"] : []),
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayEmps.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-400"
                      data-ocid="employees.empty_state"
                    >
                      No employees found
                    </td>
                  </tr>
                ) : (
                  displayEmps.map((emp, idx) => (
                    <tr
                      key={emp.empId}
                      data-ocid={`employees.item.${idx + 1}`}
                      className="border-t border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-blue-600 font-semibold whitespace-nowrap">
                        {emp.empId}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                        {emp.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {emp.username}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {emp.jobTitle}
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-600">
                        {emp.department}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            emp.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {emp.status === "active" ? (
                            <UserCheck size={11} />
                          ) : (
                            <UserX size={11} />
                          )}
                          {emp.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleStatus(emp.empId)}
                            data-ocid={`employees.toggle.${idx + 1}`}
                            className="text-xs px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors whitespace-nowrap"
                          >
                            Toggle Status
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            data-ocid="employees.dialog"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Add New Employee
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                data-ocid="employees.close_button"
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">
                  Employee ID (Auto-generated)
                </div>
                <input
                  value={newEmpId}
                  readOnly
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 font-mono text-blue-600 font-semibold"
                />
              </div>
              {[
                { key: "name", label: "Full Name" },
                { key: "username", label: "Username" },
                { key: "password", label: "Password" },
                { key: "jobTitle", label: "Job Title" },
              ].map((f) => (
                <div key={f.key}>
                  <div className="text-xs font-semibold text-gray-500 uppercase">
                    {f.label}
                  </div>
                  <input
                    type={f.key === "password" ? "password" : "text"}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value })
                    }
                    data-ocid={`employees.${f.key}.input`}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">
                  Department
                </div>
                <select
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                  data-ocid="employees.department.select"
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d} className="capitalize">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                data-ocid="employees.cancel_button"
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                data-ocid="employees.submit_button"
                className="px-4 py-2 text-sm text-white rounded-lg"
                style={{ background: "#2F6FEA" }}
              >
                Save Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
