import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ADMIN_SESSION_KEY, getAdminSession } from "../data/adminStore";
import AdminNavbar from "../UI/AdminNavbar";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/admin-dashboard" },
  { label: "Products", to: "/admin-products" },
  { label: "Messages", to: "/admin-messages" },
  { label: "Orders", to: "/admin-orders" },
  { label: "Settings", to: "/admin-settings" },
];

export default function AdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const adminSession = getAdminSession();

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    window.dispatchEvent(new Event("propsandshops-storage-updated"));
    navigate("/admin-signin", { replace: true });
  };

  return (
    <div className="fixed left-1/2 top-4 z-50 flex w-[95%] -translate-x-1/2 items-center justify-between rounded-3xl border border-white/30 bg-white/60 px-3 py-2 shadow-2xl backdrop-blur-md sm:top-6 sm:w-[90%] sm:px-5">
      <AdminNavbar />
      <Link to="/admin-dashboard">
        <h1
          className="text-sm font-semibold text-[#1f1f1f] sm:text-md"
          style={{ fontFamily: '"Orbitron"' }}
        >
          Admin
        </h1>
      </Link>

      <nav className="hidden items-center gap-2 md:flex">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-[#cf7858] text-white"
                  : "border border-[#d9ccbc] bg-white text-[#2f2d2a] hover:bg-[#efe8dd]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-[#7a7166] md:block">
          {adminSession?.email || "Admin"}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-[#e3b8b8] px-4 py-2 text-sm font-semibold text-[#8f3e3e] transition hover:bg-[#faecec]"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
