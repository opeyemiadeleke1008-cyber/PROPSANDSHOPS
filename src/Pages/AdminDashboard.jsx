import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminHeader from "../Layouts/AdminHeader";
import {
  formatNaira,
  getAdminProducts,
  getAdminSession,
  getMergedCatalog,
  getMessageThreads,
  getOrders,
} from "../data/adminStore";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminSession = getAdminSession();
  const [orders, setOrders] = useState(getOrders());
  const [threads, setThreads] = useState(getMessageThreads());
  const [adminProducts, setAdminProducts] = useState(getAdminProducts());
  const [catalog, setCatalog] = useState(getMergedCatalog());

  useEffect(() => {
    if (!adminSession?.email) {
      navigate("/admin-signin", { replace: true });
    }
  }, [adminSession, navigate]);

  useEffect(() => {
    const refresh = () => {
      setOrders(getOrders());
      setThreads(getMessageThreads());
      setAdminProducts(getAdminProducts());
      setCatalog(getMergedCatalog());
    };

    window.addEventListener("storage", refresh);
    window.addEventListener("propsandshops-storage-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("propsandshops-storage-updated", refresh);
    };
  }, []);

  if (!adminSession?.email) return null;

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === "pending"),
    [orders],
  );

  const unreadThreads = useMemo(
    () => threads.filter((thread) => (thread.unreadByAdmin || 0) > 0),
    [threads],
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
    [orders],
  );

  const recentMessages = useMemo(
    () =>
      [...threads]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 4),
    [threads],
  );

  const bestSellers = useMemo(
    () =>
      adminProducts
        .filter((product) => product.bestSeller)
        .slice(0, 4),
    [adminProducts],
  );

  const stats = [
    {
      label: "Revenue",
      value: formatNaira(orders.reduce((sum, order) => sum + Number(order.total || 0), 0)),
      note: "All completed sales",
    },
    {
      label: "Orders",
      value: orders.length,
      note: `${pendingOrders.length} pending fulfilment`,
    },
    {
      label: "Messages",
      value: unreadThreads.length,
      note: "Unread customer threads",
    },
    {
      label: "Catalog",
      value: catalog.length,
      note: `${adminProducts.length} admin-created products`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f1eb]">
      <AdminHeader />
      <main className="mx-auto w-[94%] max-w-7xl pt-28 pb-8">
        <section className="rounded-[28px] border border-[#dfd4c7] bg-[#fbf8f4] p-6 shadow-[0_12px_35px_rgba(79,64,54,0.08)]">
          <h1 className="text-3xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-[#72685f]">
            Here&apos;s what&apos;s happening in your shop today.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-2xl border border-[#e7ddd1] bg-white p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-[#9d8b7b]">{stat.label}</p>
                <p className="mt-3 text-2xl font-bold text-[#2c2823]">{stat.value}</p>
                <p className="mt-1 text-xs text-[#8b8177]">{stat.note}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
            <section className="rounded-2xl border border-[#e7ddd1] bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
                  Recent Orders
                </h2>
                <Link to="/admin-orders" className="text-sm font-semibold text-[#cf7858]">
                  View all orders
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {recentOrders.map((order) => (
                  <article key={order.id} className="rounded-xl bg-[#f8f3ec] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#2e2924]">{order.id}</p>
                        <p className="text-xs text-[#7d7368]">
                          {order.buyerName} · {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#2e2924]">{formatNaira(order.total)}</p>
                        <p className={`text-xs font-semibold ${order.status === "delivered" ? "text-emerald-600" : "text-amber-700"}`}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#e7ddd1] bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
                  Recent Messages
                </h2>
                <Link to="/admin-messages" className="text-sm font-semibold text-[#cf7858]">
                  View all messages
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {recentMessages.length === 0 ? (
                  <p className="text-sm text-[#7d7368]">No customer messages yet.</p>
                ) : (
                  recentMessages.map((thread) => (
                    <article key={thread.id} className="rounded-xl bg-[#f8f3ec] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#2e2924]">{thread.userName}</p>
                          <p className="text-xs text-[#7d7368]">{thread.userEmail}</p>
                        </div>
                        <p className="text-xs text-[#8e8378]">
                          {new Date(thread.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-[#5e554c]">
                        {thread.messages[thread.messages.length - 1]?.text || "No messages yet."}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="mt-8 rounded-2xl border border-[#e7ddd1] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
                Admin Bestsellers
              </h2>
              <Link to="/admin-products" className="text-sm font-semibold text-[#cf7858]">
                Manage products
              </Link>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {bestSellers.length === 0 ? (
                <p className="text-sm text-[#7d7368]">Mark products as bestseller from the products page.</p>
              ) : (
                bestSellers.map((product) => (
                  <article key={product.id} className="overflow-hidden rounded-2xl border border-[#eadfd2] bg-[#fbf8f4]">
                    <img src={product.image} alt={product.name} className="h-36 w-full object-cover" />
                    <div className="p-4">
                      <p className="font-semibold text-[#2e2924]">{product.name}</p>
                      <p className="mt-1 text-sm text-[#7d7368]">{product.categoryName}</p>
                      <p className="mt-2 font-semibold text-[#cf7858]">{formatNaira(product.price)}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
