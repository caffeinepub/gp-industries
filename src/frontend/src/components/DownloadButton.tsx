import { ChevronDown, Download } from "lucide-react";
import { useState } from "react";
import { MONTHS, downloadCSV, storage } from "../lib/storage";

export default function DownloadButton() {
  const [open, setOpen] = useState(false);

  function dlSalary() {
    const emps = storage.getEmployees();
    const sal = storage.getSalary();
    const rows: string[][] = [
      [
        "Employee ID",
        "Name",
        "Job Title",
        "Month",
        "Year",
        "Basic Pay",
        "Allowances",
        "Deductions",
        "Net Pay",
      ],
    ];
    for (const s of sal) {
      const emp = emps.find((e) => e.empId === s.empId);
      rows.push([
        s.empId,
        emp?.name || "",
        emp?.jobTitle || "",
        MONTHS[s.month - 1],
        String(s.year),
        String(s.basicPay),
        String(s.allowances),
        String(s.deductions),
        String(s.netPay),
      ]);
    }
    downloadCSV("salary_report.csv", rows);
    setOpen(false);
  }

  function dlEmployees() {
    const emps = storage.getEmployees();
    const rows: string[][] = [
      ["Employee ID", "Name", "Username", "Job Title", "Department", "Status"],
    ];
    for (const e of emps)
      rows.push([
        e.empId,
        e.name,
        e.username,
        e.jobTitle,
        e.department,
        e.status,
      ]);
    downloadCSV("employee_details.csv", rows);
    setOpen(false);
  }

  function dlContracts() {
    const contracts = storage.getContracts();
    const rows: string[][] = [
      [
        "Contract ID",
        "Title",
        "Type",
        "Client/Vendor",
        "Value",
        "Start Date",
        "End Date",
        "Status",
      ],
    ];
    for (const c of contracts)
      rows.push([
        c.id,
        c.title,
        c.type,
        c.clientVendor,
        String(c.value),
        c.startDate,
        c.endDate,
        c.status,
      ]);
    downloadCSV("contract_details.csv", rows);
    setOpen(false);
  }

  function dlPL() {
    const pl = storage.getProfitLoss();
    const rows: string[][] = [
      ["Type", "Date", "Category", "Description", "Amount"],
    ];
    for (const i of pl.income)
      rows.push([
        "Income",
        i.date,
        i.category,
        i.description,
        String(i.amount),
      ]);
    for (const e of pl.expenses)
      rows.push([
        "Expense",
        e.date,
        e.category,
        e.description,
        String(e.amount),
      ]);
    downloadCSV("profit_loss_report.csv", rows);
    setOpen(false);
  }

  const menuItems = [
    { label: "Salary Report", action: dlSalary },
    { label: "Employee Details", action: dlEmployees },
    { label: "Contract Details", action: dlContracts },
    { label: "Profit & Loss Report", action: dlPL },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
        style={{ background: "#2F6FEA" }}
      >
        <Download size={16} />
        Download
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-10 w-full h-full cursor-default bg-transparent border-0 p-0"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
            {menuItems.map((item) => (
              <button
                type="button"
                key={item.label}
                onClick={item.action}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
              >
                <Download size={14} />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
