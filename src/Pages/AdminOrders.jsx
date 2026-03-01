import React, { useEffect, useMemo, useState } from "react";
import AdminHeader from "../Layouts/AdminHeader";
import {
  formatNaira,
  getAdminSession,
  getOrders,
  saveOrders,
} from "../data/adminStore";
import { useNavigate } from "react-router-dom";

export default function AdminOrders() {
  const navigate = useNavigate();
  const adminSession = getAdminSession();
  const [orders, setOrders] = useState(getOrders());
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!adminSession?.email) {
      navigate("/admin-signin", { replace: true });
    }
  }, [adminSession, navigate]);

  useEffect(() => {
    const refresh = () => setOrders(getOrders());
    window.addEventListener("storage", refresh);
    window.addEventListener("propsandshops-storage-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("propsandshops-storage-updated", refresh);
    };
  }, []);

  if (!adminSession?.email) return null;

  const filteredOrders = useMemo(() => {
    const base = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return statusFilter === "all"
      ? base
      : base.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const handleMarkDelivered = (orderId) => {
    const nextOrders = orders.map((order) =>
      order.id === orderId
        ? { ...order, status: "delivered", deliveredAt: new Date().toISOString() }
        : order,
    );
    setOrders(nextOrders);
    saveOrders(nextOrders);
  };

  return (
    <div className="min-h-screen bg-[#f5f1eb]">
      <AdminHeader />
      <main className="mx-auto w-[94%] max-w-7xl pt-28 pb-8">
        <section className="rounded-[28px] border border-[#dfd4c7] bg-[#fbf8f4] p-6">
          <h1 className="text-3xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
            Orders
          </h1>
          <p className="mt-2 text-sm text-[#766d63]">
            View all customer orders and update fulfilment status.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {["all", "pending", "delivered"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  statusFilter === status
                    ? "bg-[#cf7858] text-white"
                    : "border border-[#d9ccbc] bg-white text-[#2f2d2a]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {filteredOrders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-[#e7ddd1] bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#2d2924]">{order.id}</p>
                    <p className="text-xs text-[#7e756c]">{new Date(order.createdAt).toLocaleString()}</p>
                    <p className="mt-2 text-sm text-[#4e473f]">
                      {order.buyerName} · {order.userEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#2d2924]">{formatNaira(order.total)}</p>
                    <p className={`text-xs font-semibold uppercase ${order.status === "delivered" ? "text-emerald-600" : "text-amber-700"}`}>
                      {order.status}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-2 text-sm text-[#5b534a]">
                    {(order.items || []).map((item) => (
                      <p key={`${order.id}-${item.id}`}>
                        {item.name} x {item.quantity}
                      </p>
                    ))}
                  </div>

                  <div className="space-y-2 rounded-2xl bg-[#f8f3ec] p-4 text-sm text-[#5b534a]">
                    <p>{order.billing?.deliveryAddress || "No address"}</p>
                    <p>{order.billing?.city || ""} {order.billing?.state || ""}</p>
                    <p>{order.billing?.phone || ""}</p>
                    {order.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleMarkDelivered(order.id)}
                        className="mt-2 rounded-full bg-[#cf7858] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
