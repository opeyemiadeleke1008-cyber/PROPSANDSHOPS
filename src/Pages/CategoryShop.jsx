import React, { useEffect, useMemo, useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatNaira, getMergedCatalog } from "../data/adminStore";
import Footer from "../Layouts/Footer";
import UserHeader from "../Layouts/UserHeader";
import NotificationToast from "../UI/NotificationToast";
import ProductVariantModal from "../UI/ProductVariantModal";

const SESSION_KEY = "propsandshops_session";
const CARTS_KEY = "propsandshops_carts";
const WISHLISTS_KEY = "propsandshops_wishlists";

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

function buildCartKey(item, variant) {
  return `${item.id}-${variant.size || "nosize"}-${variant.color || "nocolor"}`;
}

function getOriginalPrice(item) {
  const compareAtPrice = Number(item?.compareAtPrice || 0);
  const price = Number(item?.price || 0);
  return compareAtPrice > price ? compareAtPrice : null;
}

export default function CategoryShop() {
  const navigate = useNavigate();
  const { categorySlug, subcategorySlug } = useParams();
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [variantModal, setVariantModal] = useState({ open: false, product: null });
  const sessionUser = getSessionUser();
  const [catalog, setCatalog] = useState(() => getMergedCatalog());
  const [wishlistedIds, setWishlistedIds] = useState(() => {
    if (!sessionUser?.email) return [];
    const wishlists = getMap(WISHLISTS_KEY);
    return (wishlists[sessionUser.email] || []).map((item) => item.id);
  });

  useEffect(() => {
    const refreshCatalog = () => setCatalog(getMergedCatalog());
    window.addEventListener("storage", refreshCatalog);
    window.addEventListener("propsandshops-storage-updated", refreshCatalog);
    return () => {
      window.removeEventListener("storage", refreshCatalog);
      window.removeEventListener("propsandshops-storage-updated", refreshCatalog);
    };
  }, []);

  useEffect(() => {
    if (!sessionUser?.email) {
      navigate("/signin", { replace: true });
    }
  }, [navigate, sessionUser]);

  useEffect(() => {
    const syncWishlistIds = () => {
      if (!sessionUser?.email) {
        setWishlistedIds([]);
        return;
      }
      const wishlists = getMap(WISHLISTS_KEY);
      setWishlistedIds((wishlists[sessionUser.email] || []).map((item) => item.id));
    };

    syncWishlistIds();
    window.addEventListener("storage", syncWishlistIds);
    window.addEventListener("propsandshops-storage-updated", syncWishlistIds);
    return () => {
      window.removeEventListener("storage", syncWishlistIds);
      window.removeEventListener("propsandshops-storage-updated", syncWishlistIds);
    };
  }, [sessionUser?.email]);

  if (!sessionUser?.email) return null;

  const category = useMemo(
    () => catalog.find((item) => item.slug === categorySlug),
    [catalog, categorySlug],
  );
  const subcategory = useMemo(
    () => category?.subcategories.find((item) => item.slug === subcategorySlug),
    [category, subcategorySlug],
  );

  const addToCartWithVariant = (item, variant) => {
    const carts = getMap(CARTS_KEY);
    const userCart = carts[sessionUser.email] || [];
    const cartKey = buildCartKey(item, variant);
    const existing = userCart.find((cartItem) => cartItem.cartKey === cartKey);
    const payload = { ...item, ...variant, cartKey };
    const nextQuantity = (existing?.quantity || 0) + 1;

    if (typeof item.stock === "number" && item.stock > 0 && nextQuantity > item.stock) {
      setToast({
        show: true,
        message: `Only ${item.stock} item(s) available for ${item.name}.`,
        type: "info",
      });
      return;
    }

    if (typeof item.stock === "number" && item.stock <= 0) {
      setToast({
        show: true,
        message: `${item.name} is out of stock.`,
        type: "info",
      });
      return;
    }

    const updated = existing
      ? userCart.map((cartItem) =>
          cartItem.cartKey === cartKey ? { ...cartItem, quantity: nextQuantity } : cartItem,
        )
      : [...userCart, { ...payload, quantity: 1 }];
    saveMap(CARTS_KEY, { ...carts, [sessionUser.email]: updated });
    setToast({ show: true, message: `${item.name} added to cart.`, type: "success" });
  };

  const handleAddToCart = (item) => {
    const needsSizeChoice = (item.sizes?.length || 0) > 1;
    const needsColorChoice = (item.colors?.length || 0) > 1;
    if (needsSizeChoice || needsColorChoice) {
      setVariantModal({ open: true, product: item });
      return;
    }
    addToCartWithVariant(item, {
      size: item.sizes?.[0] ?? null,
      color: item.colors?.[0] ?? null,
    });
  };

  const addToWishlist = (item) => {
    const wishlists = getMap(WISHLISTS_KEY);
    const list = wishlists[sessionUser.email] || [];
    const exists = list.some((wishlistItem) => wishlistItem.id === item.id);
    if (exists) {
      setToast({ show: true, message: "Item already in wishlist.", type: "info" });
      return;
    }
    saveMap(WISHLISTS_KEY, { ...wishlists, [sessionUser.email]: [...list, item] });
    setWishlistedIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    setToast({ show: true, message: `${item.name} added to wishlist.`, type: "success" });
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
      <ProductVariantModal
        open={variantModal.open}
        product={variantModal.product}
        onClose={() => setVariantModal({ open: false, product: null })}
        onConfirm={(variant) => {
          addToCartWithVariant(variantModal.product, variant);
          setVariantModal({ open: false, product: null });
        }}
      />

      <main className="mx-auto w-[92%] max-w-6xl pt-28 pb-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full border border-[#d7cfc2] px-4 py-2 text-sm font-semibold text-[#2f2d2a] hover:bg-[#efe9df]"
        >
          Back
        </button>
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#9b7e63]">{category.name}</p>
        <h1 className="mt-1 text-3xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
          {subcategory.name}
        </h1>
        <p className="mt-2 text-[#5d5a55]">Choose an item and continue to cart or wishlist.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subcategory.items.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-[#ddd3c6] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
            >
              <img src={item.image} alt={item.name} className="h-45 w-full object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-[#252220]">{item.name}</h3>
                <p className="truncate text-xs text-[#666]">{item.description}</p>
                {typeof item.stock === "number" && (
                  <p className="mt-1 text-xs font-semibold text-[#8a5a36]">Stock: {item.stock}</p>
                )}
                {getOriginalPrice(item) ? (
                  <div>
                    <p className="text-[11px] text-[#8f877d] line-through">{formatNaira(getOriginalPrice(item))}</p>
                    <p className="text-sm font-semibold text-[#6a655d]">{formatNaira(item.price)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-[#6a655d]">{formatNaira(item.price)}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#2f2d2a] px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    <ShoppingCart size={14} />
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => addToWishlist(item)}
                    className="inline-flex items-center gap-1 rounded-full border border-[#d7cfc2] px-3 py-1.5 text-sm font-semibold text-[#2f2d2a]"
                  >
                    <Heart size={14} className={wishlistedIds.includes(item.id) ? "fill-black" : ""} />
                    Wishlist
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
