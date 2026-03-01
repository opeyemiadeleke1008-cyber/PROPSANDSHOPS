import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../Layouts/Footer";
import UserHeader from "../Layouts/UserHeader";

const SESSION_KEY = "propsandshops_session";
const ORDERS_KEY = "propsandshops_orders";

function getSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function getOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function formatNaira(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BuyerOrder() {
  const navigate = useNavigate();
  const sessionUser = getSessionUser();

  const orders = useMemo(() => {
    if (!sessionUser?.email) return [];
    return getOrders()
      .filter((order) => order.userEmail === sessionUser.email)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [sessionUser?.email]);


  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <UserHeader />
      <main className="mx-auto w-[92%] max-w-5xl pt-28 pb-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full border border-[#d9d5cd] px-4 py-2 text-sm font-semibold text-[#2f2d2a] transition hover:bg-[#ece7de]"
        >
          Back
        </button>
        <h1 className="mt-4 text-3xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="mt-6 rounded-xl border bg-white p-6 text-center">
            <p className="text-[#4b4b4b]">You have no orders yet.</p>
            <Link to="/shop" className="mt-4 inline-block rounded-full bg-[#2f2d2a] px-5 py-2 text-white">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl border bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-[#2f2d2a]">{order.id}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${order.status === "delivered" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#6a6a6a]">{new Date(order.createdAt).toLocaleString()}</p>
                <div className="mt-3 space-y-2 text-sm">
                  {(order.items || []).map((item) => (
                    <div key={`${order.id}-${item.id}`} className="flex items-center justify-between border-b border-[#e9e2d8] pb-2 last:border-0">
                      <p>
                        {item.name} x {item.quantity}
                      </p>
                      <p className="font-semibold">{formatNaira(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[#ece6db] pt-3">
                  <p className="text-xs text-[#6a6a6a] uppercase">Total</p>
                  <p className="font-semibold">{formatNaira(order.total || 0)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
