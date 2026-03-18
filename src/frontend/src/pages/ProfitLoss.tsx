import { ArrowLeft, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import DownloadButton from "../components/DownloadButton";
import Layout from "../components/Layout";
import { useNavigate } from "../lib/router";
import { MONTHS, generateId, storage } from "../lib/storage";
import type { ProfitLossData, ProfitLossEntry } from "../lib/storage";

type EntryType = "income" | "expense";

export default function ProfitLoss() {
  const navigate = useNavigate();
  const user = storage.getCurrentUser();
  const isAdmin = user?.role === "admin";
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [data, setData] = useState<ProfitLossData>(storage.getProfitLoss());
  const [showModal, setShowModal] = useState(false);
  const [entryType, setEntryType] = useState<EntryType>("income");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: "",
    category: "",
    description: "",
    amount: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    type: EntryType;
  } | null>(null);

  const years = [
    today.getFullYear() - 2,
    today.getFullYear() - 1,
    today.getFullYear(),
    today.getFullYear() + 1,
  ];

  function filterByMonth(entries: ProfitLossEntry[]) {
    return entries.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  }

  const incomeFiltered = filterByMonth(data.income);
  const expenseFiltered = filterByMonth(data.expenses);
  const totalIncome = incomeFiltered.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenseFiltered.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalIncome - totalExpense;

  function openAdd(type: EntryType) {
    setEntryType(type);
    setEditId(null);
    setForm({ date: "", category: "", description: "", amount: "" });
    setShowModal(true);
  }

  function openEdit(entry: ProfitLossEntry, type: EntryType) {
    setEntryType(type);
    setEditId(entry.id);
    setForm({
      date: entry.date,
      category: entry.category,
      description: entry.description,
      amount: String(entry.amount),
    });
    setShowModal(true);
  }

  function save() {
    const entry: ProfitLossEntry = {
      id:
        editId ??
        generateId(
          "ENT-",
          [...data.income, ...data.expenses].map((e) => e.id),
        ),
      date: form.date,
      category: form.category,
      description: form.description,
      amount: Number.parseFloat(form.amount) || 0,
    };
    let updated: ProfitLossData;
    if (editId) {
      updated = {
        income:
          entryType === "income"
            ? data.income.map((e) => (e.id === editId ? entry : e))
            : data.income,
        expenses:
          entryType === "expense"
            ? data.expenses.map((e) => (e.id === editId ? entry : e))
            : data.expenses,
      };
    } else {
      updated =
        entryType === "income"
          ? { ...data, income: [...data.income, entry] }
          : { ...data, expenses: [...data.expenses, entry] };
    }
    storage.setProfitLoss(updated);
    setData(updated);
    setShowModal(false);
    setForm({ date: "", category: "", description: "", amount: "" });
  }

  function doDelete() {
    if (!deleteConfirm) return;
    const { id, type } = deleteConfirm;
    const updated: ProfitLossData = {
      income:
        type === "income"
          ? data.income.filter((e) => e.id !== id)
          : data.income,
      expenses:
        type === "expense"
          ? data.expenses.filter((e) => e.id !== id)
          : data.expenses,
    };
    storage.setProfitLoss(updated);
    setData(updated);
    setDeleteConfirm(null);
  }

  function EntryTable({
    entries,
    title,
    color,
    type,
  }: {
    entries: ProfitLossEntry[];
    title: string;
    color: string;
    type: EntryType;
  }) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 min-w-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800" style={{ color }}>
            {title}
          </h2>
          {isAdmin && (
            <button
              type="button"
              onClick={() => openAdd(type)}
              data-ocid={`pl.add-${title.toLowerCase()}.button`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-medium"
              style={{ background: color }}
            >
              <Plus size={13} /> Add
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F4F6F9" }}>
                {[
                  "Date",
                  "Category",
                  "Description",
                  "Amount (RM)",
                  ...(isAdmin ? ["Actions"] : []),
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
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 5 : 4}
                    className="px-4 py-6 text-center text-gray-400 text-xs"
                  >
                    No entries
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr
                    key={e.id}
                    className="border-t border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                      {e.date}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs">
                      {e.category}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">
                      {e.description}
                    </td>
                    <td
                      className="px-4 py-2.5 font-semibold whitespace-nowrap"
                      style={{ color }}
                    >
                      {e.amount.toLocaleString()}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(e, type)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({ id: e.id, type })}
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
    );
  }

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-8 md:py-5 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            data-ocid="pl.back.button"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Profit &amp; Loss</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(+e.target.value)}
            data-ocid="pl.month.select"
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
            data-ocid="pl.year.select"
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

      <div className="p-4 md:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Income",
              value: totalIncome,
              color: "#16A34A",
              bg: "#E6FFF0",
            },
            {
              label: "Total Expenses",
              value: totalExpense,
              color: "#DC2626",
              bg: "#FFF0F0",
            },
            {
              label: "Net Profit / Loss",
              value: netProfit,
              color: netProfit >= 0 ? "#16A34A" : "#DC2626",
              bg: netProfit >= 0 ? "#E6FFF0" : "#FFF0F0",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="text-xs text-gray-500 font-semibold uppercase mb-2">
                {s.label}
              </div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>
                RM {s.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <EntryTable
            entries={incomeFiltered}
            title="Income"
            color="#16A34A"
            type="income"
          />
          <EntryTable
            entries={expenseFiltered}
            title="Expenses"
            color="#DC2626"
            type="expense"
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            data-ocid="pl.dialog"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {editId ? "Edit" : "Add"}{" "}
                {entryType === "income" ? "Income" : "Expense"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                data-ocid="pl.close_button"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { key: "date", label: "Date", type: "date" },
                { key: "category", label: "Category", type: "text" },
                { key: "description", label: "Description", type: "text" },
                { key: "amount", label: "Amount (RM)", type: "number" },
              ].map((f) => (
                <div key={f.key}>
                  <div className="text-xs font-semibold text-gray-500 uppercase">
                    {f.label}
                  </div>
                  <input
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value })
                    }
                    data-ocid={`pl.${f.key}.input`}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                data-ocid="pl.cancel_button"
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!form.date || !form.amount}
                data-ocid="pl.submit_button"
                className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50"
                style={{
                  background: entryType === "income" ? "#16A34A" : "#DC2626",
                }}
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
              Delete Entry
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to delete this entry? This cannot be undone.
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
