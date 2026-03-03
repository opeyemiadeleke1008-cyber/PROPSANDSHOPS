import React, { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../Layouts/Footer";
import UserHeader from "../Layouts/UserHeader";
import { getAdminProducts, reduceAdminProductStock } from "../data/adminStore";

const SESSION_KEY = "propsandshops_session";
const CARTS_KEY = "propsandshops_carts";
const ORDERS_KEY = "propsandshops_orders";

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

function getOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveOrders(value) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event("propsandshops-storage-updated"));
}

function formatNaira(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function PaymentSuccessModal({ open, amount, onDone }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-190 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <CheckCircle2 className="mx-auto text-emerald-500" size={44} />
        <h2 className="mt-3 text-xl font-bold text-[#1f1f1f]">Payment Successful</h2>
        <p className="mt-2 text-sm text-[#555]">
          Your payment of {formatNaira(amount)} was successful.
        </p>
        <p className="mt-1 text-xs text-[#7a7a7a]">Redirecting to buyer dashboard...</p>
        <button
          type="button"
          onClick={onDone}
          className="mt-4 rounded-full bg-[#2f2d2a] px-5 py-2 text-sm font-semibold text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default function Payment() {
  const navigate = useNavigate();
  const sessionUser = getSessionUser();
  const carts = getCarts();
  const cartItems = sessionUser?.email ? carts[sessionUser.email] || [] : [];

  const [method, setMethod] = useState("card");
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [stockMessage, setStockMessage] = useState("");
  const [billing, setBilling] = useState({
    firstName: sessionUser?.firstName || "",
    lastName: sessionUser?.lastName || "",
    email: sessionUser?.email || "",
    city: "",
    state: "",
    phone: "",
    deliveryAddress: "",
  });

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const clearCartAndRedirect = () => {
    if (!sessionUser?.email) {
      navigate("/buyer-dashboard", { replace: true });
      return;
    }
    const next = { ...carts, [sessionUser.email]: [] };
    saveCarts(next);
    navigate("/buyer-dashboard", { replace: true });
  };

  const handleConfirmOrder = (event) => {
    event.preventDefault();
    setStockMessage("");
    if (!sessionUser?.email || cartItems.length === 0) {
      navigate("/cart");
      return;
    }

    if (method === "card") {
      if (
        !cardData.cardNumber.trim() ||
        !cardData.cardName.trim() ||
        !cardData.expiry.trim() ||
        !cardData.cvv.trim()
      ) {
        return;
      }
    }
    if (
      !billing.firstName.trim() ||
      !billing.lastName.trim() ||
      !billing.email.trim() ||
      !billing.city.trim() ||
      !billing.state.trim() ||
      !billing.phone.trim() ||
      !billing.deliveryAddress.trim()
    ) {
      return;
    }

    const adminProducts = getAdminProducts();
    const stockIssue = cartItems.find((item) => {
      const matchingProduct = adminProducts.find((product) => product.id === item.id);
      if (!matchingProduct) return false;
      return Number(item.quantity || 1) > Number(matchingProduct.stock || 0);
    });

    if (stockIssue) {
      setStockMessage(`Only ${stockIssue.stock || 0} item(s) left for ${stockIssue.name}. Update your cart and try again.`);
      return;
    }

    const previousOrders = getOrders();
    const orderPayload = {
      id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userEmail: sessionUser.email,
      buyerName: `${sessionUser.firstName || ""} ${sessionUser.lastName || ""}`.trim() || "Buyer",
      createdAt: new Date().toISOString(),
      status: "pending",
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity || 1,
      })),
      total,
      paymentMethod: method,
      billing,
      };
    saveOrders([orderPayload, ...previousOrders]);
    reduceAdminProductStock(cartItems);

    setShowSuccess(true);
    setTimeout(() => {
      clearCartAndRedirect();
    }, 1700);
  };

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      
      <PaymentSuccessModal open={showSuccess} amount={total} onDone={clearCartAndRedirect} />

      <main className="mx-auto w-[92%] max-w-5xl pt-28 pb-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full border border-[#d9d5cd] px-4 py-2 text-sm font-semibold text-[#2f2d2a] transition hover:bg-[#ece7de]"
        >
          Back
        </button>
        <h1 className="mt-4 text-3xl font-bold" style={{ fontFamily: '"Orbitron"' }}>
          Payment
        </h1>

        {cartItems.length === 0 && (
          <div className="mt-6 rounded-xl border bg-white p-6 text-center">
            <p className="text-[#4b4b4b]">Your cart is empty.</p>
            <Link to="/" className="mt-4 inline-block rounded-full bg-[#2f2d2a] px-5 py-2 text-white">
              Shop Now
            </Link>
          </div>
        )}

        {cartItems.length > 0 && (
          <form className="mt-6 grid gap-5 md:grid-cols-[1.1fr_0.9fr]" onSubmit={handleConfirmOrder}>
            <aside className="order-1 h-fit rounded-2xl border bg-white p-5 md:order-2">
              <h3 className="font-semibold">Order Summary</h3>
              <div className="mt-4 space-y-2 text-sm">
                {cartItems.map((item) => (
                  <p key={item.cartKey || item.id} className="flex items-center justify-between border-b border-[#d9d5cd] pb-2 last:border-0">
                    <span className="max-w-[75%] truncate">{item.name} x {item.quantity}</span>
                    <span>{formatNaira(item.price * item.quantity)}</span>
                  </p>
                ))}
              </div>
              <div className="mt-4 border-t pt-3">
                <p className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatNaira(total)}</span>
                </p>
              </div>
            </aside>

            <section className="order-2 rounded-2xl border bg-white p-5 md:order-1">
              {stockMessage && (
                <div className="mb-4 rounded-xl border border-[#f0c9c0] bg-[#fff3f0] px-4 py-3 text-sm text-[#8f3e3e]">
                  {stockMessage}
                </div>
              )}
              <h2 className="text-lg font-semibold">Choose Payment Method</h2>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMethod("card")}
                  className={`rounded-full border px-4 py-2 text-sm ${method === "card" ? "border-[#2f2d2a] bg-[#f3eee5]" : "border-[#d9d5cd]"}`}
                >
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("paypal")}
                  className={`rounded-full border px-4 py-2 text-sm ${method === "paypal" ? "border-[#2f2d2a] bg-[#f3eee5]" : "border-[#d9d5cd]"}`}
                >
                  PayPal
                </button>
              </div>

              {method === "card" ? (
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    value={cardData.cardNumber}
                    onChange={(e) => setCardData((p) => ({ ...p, cardNumber: e.target.value }))}
                    placeholder="Card Number(1234-5678-9012-3456)"
                    className="w-full rounded-lg border border-[#d9d5cd] px-3 py-2"
                  />
                  <input
                    type="text"
                    value={cardData.cardName}
                    onChange={(e) => setCardData((p) => ({ ...p, cardName: e.target.value }))}
                    placeholder="Card Holder Name"
                    maxLength={50}
                    className="w-full rounded-lg border border-[#d9d5cd] px-3 py-2"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={cardData.expiry}
                      onChange={(e) => setCardData((p) => ({ ...p, expiry: e.target.value }))}
                      placeholder="MM/YY"
                      className="w-full rounded-lg border border-[#d9d5cd] px-3 py-2"
                    />
                    <input
                      type="text"
                      value={cardData.cvv}
                      onChange={(e) => setCardData((p) => ({ ...p, cvv: e.target.value }))}
                      placeholder="cvv"
                      maxLength={3}
                      className="w-full rounded-lg border border-[#d9d5cd] px-3 py-2"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-[#d9d5cd] bg-[#faf7f2] p-4 text-sm text-[#4f4f4f]">
                  PayPal selected. Click confirm to continue with PayPal checkout simulation.
                </div>
              )}

              <div className="mt-5 space-y-3 border-t border-[#ebe5dc] pt-4">
                <h3 className="text-sm font-semibold text-[#2f2d2a]">Billing Details</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={billing.firstName}
                    onChange={(e) => setBilling((p) => ({ ...p, firstName: e.target.value }))}
                    placeholder="First Name"
                    className="w-full rounded-lg border border-[#d9d5cd] px-3 py-2"
                  />
                  <input
                    type="text"
                    value={billing.lastName}
                    onChange={(e) => setBilling((p) => ({ ...p, lastName: e.target.value }))}
                    placeholder="Last Name"
                    className="w-full rounded-lg border border-[#d9d5cd] px-3 py-2"
                  />
                </div>
                <input
                  type="email"
                  value={billing.email}
                  onChange={(e) => setBilling((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Email Address"
                  className="w-full rounded-lg border border-[#d9d5cd] px-3 py-2"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={billing.city}
                    onChange={(e) => setBilling((p) => ({ ...p, city: e.target.value }))}
                    placeholder="City"
                    className="w-full rounded-lg border border-[#d9d5cd] px-3 py-2"
                  />
                  <input
                    type="text"
                    value={billing.state}
                    onChange={(e) => setBilling((p) => ({ ...p, state: e.target.value }))}
                    placeholder="State"
                    className="w-full rounded-lg border border-[#d9d5cd] px-3 py-2"
                  />
                </div>
                <textarea
                  value={billing.deliveryAddress}
                  onChange={(e) => setBilling((p) => ({ ...p, deliveryAddress: e.target.value }))}
                  placeholder="Delivery Address"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[#d9d5cd] px-3 py-2"
                />
                <div className="flex overflow-hidden rounded-lg border border-[#d9d5cd]">
                  <span className="bg-[#f4efe6] px-3 py-2 text-sm text-[#5d5a55]">+234</span>
                  <input
                    type="tel"
                    value={billing.phone}
                    maxLength={10}
                    onChange={(e) => setBilling((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="1234567890"
                    className="min-w-0 w-full px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-5 w-full rounded-full bg-[#2f2d2a] px-5 py-3 font-semibold text-white"
              >
                Confirm Order
              </button>
            </section>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
