import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../Layouts/Footer";
import UserHeader from "../Layouts/UserHeader";
import NotificationToast from "../UI/NotificationToast";
import ProductDetailModal from "../UI/ProductDetailModal";
import ProductVariantModal from "../UI/ProductVariantModal";

const SESSION_KEY = "propsandshops_session";
const WISHLISTS_KEY = "propsandshops_wishlists";
const CARTS_KEY = "propsandshops_carts";

function getSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function getMap(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveMap(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("propsandshops-storage-updated"));
}

function formatNaira(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Wishlist() {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [detailModal, setDetailModal] = useState({ open: false, product: null });
  const [variantModal, setVariantModal] = useState({ open: false, product: null });
  const sessionUser = getSessionUser();
  const wishlists = getMap(WISHLISTS_KEY);
  const carts = getMap(CARTS_KEY);
  const items = sessionUser?.email ? wishlists[sessionUser.email] || [] : [];

  const removeFromWishlist = (id) => {
    if (!sessionUser?.email) return;
    const updated = items.filter((item) => item.id !== id);
    saveMap(WISHLISTS_KEY, { ...wishlists, [sessionUser.email]: updated });
    setToast({ show: true, message: "Item removed from wishlist.", type: "success" });
  };

  const moveToCartWithVariant = (item, variant) => {
    if (!sessionUser?.email) return;
    const userCart = carts[sessionUser.email] || [];
    const cartKey = `${item.id}-${variant.size || "nosize"}-${variant.color || "nocolor"}`;
    const exists = userCart.find((cartItem) => cartItem.cartKey === cartKey);
    const updatedCart = exists
      ? userCart.map((cartItem) =>
          cartItem.cartKey === cartKey
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        )
      : [...userCart, { ...item, ...variant, cartKey, quantity: 1 }];

    saveMap(CARTS_KEY, { ...carts, [sessionUser.email]: updatedCart });
    setToast({ show: true, message: "Moved to cart.", type: "success" });
  };

  const moveToCart = (item) => {
    if ((item.sizes?.length || 0) > 1 || (item.colors?.length || 0) > 1) {
      setVariantModal({ open: true, product: item });
      return;
    }
    moveToCartWithVariant(item, {
      size: item.sizes?.[0] ?? null,
      color: item.colors?.[0] ?? null,
    });
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
      <ProductVariantModal
        open={variantModal.open}
        product={variantModal.product}
        onClose={() => setVariantModal({ open: false, product: null })}
        onConfirm={(variant) => {
          moveToCartWithVariant(variantModal.product, variant);
          setVariantModal({ open: false, product: null });
        }}
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
          Wishlist
        </h1>

        {!sessionUser?.email && (
          <div className="mt-6 rounded-xl border bg-white p-6 text-center">
            <p className="text-[#4b4b4b]">Your wishlist is empty. Sign in to save items.</p>
            <Link to="/signin" className="mt-4 inline-block rounded-full bg-[#2f2d2a] px-5 py-2 text-white">
              Sign In
            </Link>
          </div>
        )}

        {sessionUser?.email && items.length === 0 && (
          <div className="mt-6 rounded-xl border bg-white p-6 text-center text-[#4b4b4b]">
            Your wishlist is empty.
          </div>
        )}

        {sessionUser?.email && items.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <article key={item.id} className="rounded-xl border bg-white p-4">
                <img src={item.image} alt={item.name} className="h-40 w-full rounded-lg object-cover" />
                <h3 className="mt-3 font-semibold">{item.name}</h3>
                <p className="truncate text-xs text-[#666]">{item.description || "No description available."}</p>
                <p className="text-sm text-[#666]">{formatNaira(item.price)}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailModal({ open: true, product: item })}
                    className="rounded-full border border-[#d9d5cd] px-3 py-1.5 text-sm"
                  >
                    View Full
                  </button>
                  <button
                    type="button"
                    onClick={() => moveToCart(item)}
                    className="rounded-full bg-[#2f2d2a] px-3 py-1.5 text-sm text-white"
                  >
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    className="rounded-full border border-[#d9d5cd] px-3 py-1.5 text-sm"
                  >
                    Remove
                  </button>
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
