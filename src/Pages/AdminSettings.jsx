import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../Layouts/AdminHeader";
import { ADMIN_SESSION_KEY, getAdminSession } from "../data/adminStore";

export default function AdminSettings() {
  const navigate = useNavigate();
  const adminSession = getAdminSession();

  useEffect(() => {
    if (!adminSession?.email) {
      navigate("/admin-signin", { replace: true });
    }
  }, [adminSession, navigate]);

  if (!adminSession?.email) return null;

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    window.dispatchEvent(new Event("propsandshops-storage-updated"));
    navigate("/admin-signin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f5f1eb]">
      <AdminHeader />
      <main className="mx-auto w-[94%] max-w-5xl pt-28 pb-8">
        <section className="rounded-[28px] border border-[#dfd4c7] bg-[#fbf8f4] p-6">
          <h1 className="text-3xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
            Admin Settings
          </h1>
          <p className="mt-2 text-sm text-[#766d63]">
            Basic account details for the signed-in admin.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#e7ddd1] bg-white p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-[#9b8f83]">Email</p>
              <p className="mt-2 font-semibold text-[#2d2924]">{adminSession.email}</p>
            </div>
            <div className="rounded-2xl border border-[#e7ddd1] bg-white p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-[#9b8f83]">Signed In</p>
              <p className="mt-2 font-semibold text-[#2d2924]">
                {new Date(adminSession.signedInAt || Date.now()).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 rounded-full border border-[#e3b8b8] px-5 py-3 text-sm font-semibold text-[#8f3e3e] transition hover:bg-[#faecec]"
          >
            Log Out
          </button>
        </section>
      </main>
    </div>
  );
}
