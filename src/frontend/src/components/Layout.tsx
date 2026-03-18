import { Menu } from "lucide-react";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "#F4F6F9" }}>
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />

      {/* Mobile overlay */}
      {open && (
        <div
          role="button"
          tabIndex={-1}
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          aria-label="Close menu"
        />
      )}

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
            data-ocid="nav.open_modal_button"
          >
            <Menu size={22} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{
                background: "linear-gradient(135deg, #2F6FEA, #18B6B2)",
              }}
            >
              GP
            </div>
            <span className="font-bold text-gray-900 text-sm">
              GP INDUSTRIES
            </span>
          </div>
          <div className="w-10" />
        </div>

        {children}
      </div>
    </div>
  );
}
