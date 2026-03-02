import React, { useState } from "react";
import { Link } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/admin-dashboard" },
  { label: "Products", to: "/admin-products" },
  { label: "Messages", to: "/admin-messages" },
  { label: "Orders", to: "/admin-orders" },
  { label: "Settings", to: "/admin-settings" },
];

export default function AdminNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex flex-col gap-1 rounded-full bg-white/30 px-2 py-3 shadow-xl"
        aria-expanded={open}
        aria-label="Toggle admin navigation"
      >
        <span className="h-0.5 w-6 bg-gray-800" />
        <span className="h-0.5 w-4 bg-gray-800" />
        <span className="h-0.5 w-5 bg-gray-800" />
      </button>

      {open && (
        <div className="absolute left-0 top-14 z-120 min-w-48 rounded-2xl border border-[#dfd7cb] bg-white p-3 shadow-2xl">
          <nav className="flex flex-col text-sm font-semibold text-[#2b2b2b]">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 hover:bg-[#f3eee5]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
