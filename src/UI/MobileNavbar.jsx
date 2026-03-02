import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const SESSION_KEY = "propsandshops_session";

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export default function MobileNavbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(readSession());

  useEffect(() => {
    setOpen(false);
    setSession(readSession());
  }, [location.pathname]);

  useEffect(() => {
    const refreshSession = () => setSession(readSession());
    window.addEventListener("storage", refreshSession);
    window.addEventListener("propsandshops-storage-updated", refreshSession);
    return () => {
      window.removeEventListener("storage", refreshSession);
      window.removeEventListener("propsandshops-storage-updated", refreshSession);
    };
  }, []);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex flex-col gap-1 rounded-full bg-white/30 px-2 py-3 shadow-xl"
        aria-expanded={open}
        aria-label="Toggle mobile navigation"
      >
        <span className="h-0.5 w-6 bg-gray-800" />
        <span className="h-0.5 w-4 bg-gray-800" />
        <span className="h-0.5 w-5 bg-gray-800" />
      </button>

      {open && (
        <div className="absolute left-0 top-14 z-120 min-w-48 rounded-2xl border border-[#dfd7cb] bg-white p-3 shadow-2xl">
          <nav className="flex flex-col text-sm font-semibold text-[#2b2b2b]">
            <Link to="/shop" className="rounded-lg px-3 py-2 hover:bg-[#f3eee5]">
              Shop
            </Link>
            <Link to="/collection" className="rounded-lg px-3 py-2 hover:bg-[#f3eee5]">
              Collection
            </Link>
            <Link to="/about" className="rounded-lg px-3 py-2 hover:bg-[#f3eee5]">
              About
            </Link>
            <Link to="/contact" className="rounded-lg px-3 py-2 hover:bg-[#f3eee5]">
              Contact
            </Link>
            <div className="my-2 h-px bg-[#ece4d8]" />
            {!session?.email ? (
              <Link to="/signin" className="rounded-lg px-3 py-2 hover:bg-[#f3eee5]">
                Sign In
              </Link>
            ) : (
              <Link to="/buyer-profile" className="rounded-lg px-3 py-2 hover:bg-[#f3eee5]">
                Account
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
