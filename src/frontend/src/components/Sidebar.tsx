import {
  BarChart2,
  Building2,
  ClipboardCheck,
  DollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "../lib/router";
import { storage } from "../lib/storage";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/employees", label: "Employees", icon: Users },
  { path: "/attendance", label: "Attendance", icon: ClipboardCheck },
  { path: "/salary", label: "Salary", icon: DollarSign },
  { path: "/contracts", label: "Contracts", icon: FileText },
  { path: "/profit-loss", label: "Profit & Loss", icon: TrendingUp },
  { path: "/analysis", label: "Analysis", icon: BarChart2 },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = storage.getCurrentUser();

  function logout() {
    storage.setCurrentUser(null);
    navigate("/login");
  }

  return (
    <div
      className={`flex flex-col w-64 min-h-screen fixed left-0 top-0 z-30 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
      style={{
        background: "linear-gradient(180deg, #0B1F33 0%, #0A2B4A 100%)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #2F6FEA, #18B6B2)" }}
          >
            GP
          </div>
          <div>
            <div className="text-white font-bold text-sm">GP INDUSTRIES</div>
            <div className="text-blue-300 text-xs">Management System</div>
          </div>
        </div>
        {/* Close button - mobile only */}
        <button
          type="button"
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close menu"
          data-ocid="nav.close_button"
        >
          <X size={18} />
        </button>
      </div>

      {/* User */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: "#2F6FEA" }}
        >
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="overflow-hidden">
          <div className="text-white text-xs font-semibold truncate">
            {user?.name || "User"}
          </div>
          <div className="text-blue-300 text-xs capitalize">
            {user?.role || "employee"}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              data-ocid={`nav.${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}.link`}
              className={`flex items-center gap-3 px-6 py-3 mx-2 rounded-lg mb-1 text-sm transition-all ${
                active
                  ? "bg-white/15 text-white font-semibold"
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <button
          type="button"
          onClick={logout}
          data-ocid="nav.logout.button"
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Footer brand */}
      <div className="px-6 pb-4 flex items-center gap-2 text-blue-400 text-xs">
        <Building2 size={12} />
        GP Industries &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}
