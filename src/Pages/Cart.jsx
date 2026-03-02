import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../Layouts/Footer";
import UserHeader from "../Layouts/UserHeader";
import NotificationToast from "../UI/NotificationToast";
import ProductDetailModal from "../UI/ProductDetailModal";

const SESSION_KEY = "propsandshops_session";
const CARTS_KEY = "propsandshops_carts";

function getSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function getCarts() {
  try {
    const raw = localStorage.getItem(CARTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveCarts(value) {
  localStorage.setItem(CARTS_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event("propsandshops-storage-updated"));
}

function formatNaira(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Cart() {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [detailModal, setDetailModal] = useState({ open: false, product: null });
  const sessionUser = getSessionUser();
  const [cartItems, setCartItems] = useState(() => {
    const carts = getCarts();
    return sessionUser?.email ? carts[sessionUser.email] || [] : [];
  });

  useEffect(() => {
    const carts = getCarts();
    setCartItems(sessionUser?.email ? carts[sessionUser.email] || [] : []);
  }, [sessionUser?.email]);

  const persistCartItems = (nextItems) => {
    if (!sessionUser?.email) return;
    const carts = getCarts();
    saveCarts({ ...carts, [sessionUser.email]: nextItems });
    setCartItems(nextItems);
  };

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const removeFromCart = (cartKeyOrId) => {
    if (!sessionUser?.email) return;
    const updated = cartItems.filter(
      (item) => (item.cartKey || `${item.id}`) !== cartKeyOrId,
    );
    persistCartItems(updated);
    setToast({ show: true, message: "Item removed from cart.", type: "success" });
  };

  const updateQuantity = (cartKeyOrId, delta) => {
    if (!sessionUser?.email) return;
    const updated = cartItems
      .map((item) => {
        const key = item.cartKey || `${item.id}`;
        if (key !== cartKeyOrId) return item;
        const nextQuantity = Math.max(1, (item.quantity || 1) + delta);
        if (typeof item.stock === "number" && item.stock > 0) {
          return { ...item, quantity: Math.min(nextQuantity, item.stock) };
        }
        return { ...item, quantity: nextQuantity };
      })
      .filter((item) => (item.quantity || 1) > 0);

    persistCartItems(updated);
  };

  const clearCart = () => {
    if (!sessionUser?.email) return;
    persistCartItems([]);
    setToast({ show: true, message: "Cart cleared.", type: "success" });
  };

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <UserHeader />
      <NotificationToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
      <ProductDetailModal
        open={detailModal.open}
        product={detailModal.product}
        onClose={() => setDetailModal({ open: false, product: null })}
      />

      <main className="mx-auto w-[92%] max-w-5xl pt-28 pb-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full border border-[#d9d5cd] px-4 py-2 text-sm font-semibold text-[#2f2d2a] transition hover:bg-[#ece7de]"
        >
          Back
        </button>
        <h1 className="text-3xl font-bold" style={{ fontFamily: '"Orbitron"' }}>
          Your Cart
        </h1>

        {!sessionUser?.email && (
          <div className="mt-6 rounded-xl border bg-white p-6 text-center">
            <p className="text-[#4b4b4b]">Your cart is empty. Sign in to add items.</p>
            <Link to="/signin" className="mt-4 inline-block rounded-full bg-[#2f2d2a] px-5 py-2 text-white">
              Sign In
            </Link>
          </div>
        )}

        {sessionUser?.email && cartItems.length === 0 && (
          <div className="mt-6 rounded-xl border bg-white p-6 text-center text-[#4b4b4b]">
            <p>Your cart is empty.</p>
            <Link
              to="/shop"
              className="mt-4 inline-block rounded-full bg-[#2f2d2a] px-5 py-2 text-sm font-semibold text-white"
            >
              Shop Now
            </Link>
          </div>
        )}

        {sessionUser?.email && cartItems.length > 0 && (
          <>
            <div className="mt-6 space-y-3">
              {cartItems.map((item) => (
                <article
                  key={item.cartKey || item.id}
                  className="rounded-xl border bg-white p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-28 w-full rounded-lg object-cover sm:h-18 sm:w-18"
                    />
                    <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="truncate text-xs text-[#666]">{item.description || "No description available."}</p>
                    {(item.size || item.color) && (
                      <p className="text-xs text-[#777]">
                        {item.size ? `Size: ${item.size}` : ""} {item.color ? `Color: ${item.color}` : ""}
                      </p>
                    )}
                    {typeof item.stock === "number" && (
                      <p className="text-xs font-semibold text-[#8a5a36]">Stock available: {item.stock}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartKey || `${item.id}`, -1)}
                        className="h-7 w-7 rounded-full border border-[#d9d5cd] text-sm"
                      >
                        -
                      </button>
                      <span className="min-w-6 text-center text-sm text-[#444]">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartKey || `${item.id}`, 1)}
                        className="h-7 w-7 rounded-full border border-[#d9d5cd] text-sm"
                      >
                        +
                      </button>
                      <span className="ml-2 text-sm text-[#666]">{formatNaira(item.price)} each</span>
                    </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:flex-col">
                      <button
                        type="button"
                        onClick={() => setDetailModal({ open: true, product: item })}
                        className="rounded-full border border-[#d9d5cd] px-3 py-1 text-sm"
                      >
                        View Full
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartKey || `${item.id}`)}
                        className="rounded-full border border-[#d9d5cd] px-3 py-1 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold">Total: {formatNaira(total)}</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={clearCart}
                  className="rounded-full border border-[#d9d5cd] px-4 py-2 text-sm"
                >
                  Clear Cart
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/payment")}
                  className="rounded-full bg-[#2f2d2a] px-4 py-2 text-sm text-white"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
