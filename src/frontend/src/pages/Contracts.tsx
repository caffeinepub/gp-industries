import { ArrowLeft, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import DownloadButton from "../components/DownloadButton";
import Layout from "../components/Layout";
import { useNavigate } from "../lib/router";
import { generateId, storage } from "../lib/storage";
import type { ContractRecord } from "../lib/storage";

const emptyForm = {
  title: "",
  type: "IN" as "IN" | "OUT",
  clientVendor: "",
  value: "",
  startDate: "",
  endDate: "",
  status: "active" as ContractRecord["status"],
};

export default function Contracts() {
  const navigate = useNavigate();
  const user = storage.getCurrentUser();
  const isAdmin = user?.role === "admin";
  const [contracts, setContracts] = useState<ContractRecord[]>(
    storage.getContracts(),
  );
  const [typeFilter, setTypeFilter] = useState<"ALL" | "IN" | "OUT">("ALL");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const display = contracts.filter((c) => {
    if (typeFilter !== "ALL" && c.type !== typeFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  function openAdd() {
    setEditId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  }

  function openEdit(c: ContractRecord) {
    setEditId(c.id);
    setForm({
      title: c.title,
      type: c.type,
      clientVendor: c.clientVendor,
      value: String(c.value),
      startDate: c.startDate,
      endDate: c.endDate,
      status: c.status,
    });
    setShowModal(true);
  }

  function save() {
    let updated: ContractRecord[];
    if (editId) {
      updated = contracts.map((c) =>
        c.id === editId
          ? { ...c, ...form, value: Number.parseFloat(form.value) || 0 }
          : c,
      );
    } else {
      const newC: ContractRecord = {
        id: generateId(
          "CON-",
          contracts.map((c) => c.id),
        ),
        ...form,
        value: Number.parseFloat(form.value) || 0,
      };
      updated = [...contracts, newC];
    }
    storage.setContracts(updated);
    setContracts(updated);
    setShowModal(false);
  }

  function confirmDelete(id: string) {
    setDeleteConfirm(id);
  }

  function doDelete() {
    if (!deleteConfirm) return;
    const updated = contracts.filter((c) => c.id !== deleteConfirm);
    storage.setContracts(updated);
    setContracts(updated);
    setDeleteConfirm(null);
  }

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-600",
  };
  const typeColor: Record<string, string> = {
    IN: "bg-teal-100 text-teal-700",
    OUT: "bg-orange-100 text-orange-700",
  };

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-8 md:py-5 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            data-ocid="contracts.back.button"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Contracts</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as "ALL" | "IN" | "OUT")
            }
            data-ocid="contracts.type.select"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="ALL">All Types</option>
            <option value="IN">IN (Client)</option>
            <option value="OUT">OUT (Vendor)</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            data-ocid="contracts.status.select"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {isAdmin && (
            <button
              type="button"
              onClick={openAdd}
              data-ocid="contracts.add.button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: "#2F6FEA" }}
            >
              <Plus size={16} /> Add Contract
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
                    "ID",
                    "Title",
                    "Type",
                    "Client/Vendor",
                    "Value (RM)",
                    "Start Date",
                    "End Date",
                    "Status",
                    ...(isAdmin ? ["Actions"] : []),
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
                      colSpan={isAdmin ? 9 : 8}
                      className="px-4 py-8 text-center text-gray-400"
                      data-ocid="contracts.empty_state"
                    >
                      No contracts found
                    </td>
                  </tr>
                ) : (
                  display.map((c, idx) => (
                    <tr
                      key={c.id}
                      data-ocid={`contracts.item.${idx + 1}`}
                      className="border-t border-gray-50 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-mono text-blue-600 text-xs whitespace-nowrap">
                        {c.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {c.title}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${typeColor[c.type]}`}
                        >
                          {c.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {c.clientVendor}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                        {c.value.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {c.startDate}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {c.endDate}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[c.status]}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(c)}
                              data-ocid={`contracts.edit.${idx + 1}`}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <Pencil size={12} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmDelete(c.id)}
                              data-ocid={`contracts.delete.${idx + 1}`}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            data-ocid="contracts.dialog"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {editId ? "Edit Contract" : "Add Contract"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                data-ocid="contracts.close_button"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { key: "title", label: "Title" },
                { key: "clientVendor", label: "Client/Vendor" },
                { key: "value", label: "Contract Value (RM)" },
              ].map((f) => (
                <div key={f.key}>
                  <div className="text-xs font-semibold text-gray-500 uppercase">
                    {f.label}
                  </div>
                  <input
                    type={f.key === "value" ? "number" : "text"}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value })
                    }
                    data-ocid={`contracts.${f.key}.input`}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </div>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as "IN" | "OUT" })
                    }
                    data-ocid="contracts.modal-type.select"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="IN">IN (Client)</option>
                    <option value="OUT">OUT (Vendor)</option>
                  </select>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </div>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as ContractRecord["status"],
                      })
                    }
                    data-ocid="contracts.modal-status.select"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "startDate", label: "Start Date" },
                  { key: "endDate", label: "End Date" },
                ].map((f) => (
                  <div key={f.key}>
                    <div className="text-xs font-semibold text-gray-500 uppercase">
                      {f.label}
                    </div>
                    <input
                      type="date"
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                      data-ocid={`contracts.${f.key}.input`}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                data-ocid="contracts.cancel_button"
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!form.title}
                data-ocid="contracts.submit_button"
                className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50"
                style={{ background: "#2F6FEA" }}
              >
                {editId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Delete Contract
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to delete this contract? This cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doDelete}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
