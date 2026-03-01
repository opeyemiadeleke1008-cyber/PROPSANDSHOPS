import React, { useEffect, useMemo, useState } from "react";
import { Heart, ShoppingCart, Tag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../Layouts/Footer";
import UserHeader from "../Layouts/UserHeader";
import NotificationToast from "../UI/NotificationToast";
import { formatNaira, getMergedCatalog } from "../data/adminStore";

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

function getDiscountPercent(product) {
  const value = Number(product?.discountPercent || 0);
  return value > 0 ? value : 0;
}

function getDiscountedPrice(product) {
  return Number(product?.price || 0);
}

function getOriginalPrice(product) {
  const compareAtPrice = Number(product?.compareAtPrice || 0);
  return compareAtPrice > getDiscountedPrice(product) ? compareAtPrice : null;
}

export default function Shop() {
  const navigate = useNavigate();
  const sessionUser = getSessionUser();
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [catalog, setCatalog] = useState(() => getMergedCatalog());
  const [wishlistedIds, setWishlistedIds] = useState(() => {
    if (!sessionUser?.email) return [];
    const wishlists = getMap(WISHLISTS_KEY);
    return (wishlists[sessionUser.email] || []).map((item) => item.id);
  });
  const [activeCategorySlug, setActiveCategorySlug] = useState(
    () => getMergedCatalog()[0]?.slug || "",
  );
  const [activeSubcategorySlug, setActiveSubcategorySlug] = useState(
    () => getMergedCatalog()[0]?.subcategories?.[0]?.slug || "",
  );

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
    const nextCategory = catalog.find((category) => category.slug === activeCategorySlug) || catalog[0];
    if (!nextCategory) return;
    if (nextCategory.slug !== activeCategorySlug) {
      setActiveCategorySlug(nextCategory.slug);
    }
    if (!nextCategory.subcategories.find((subcategory) => subcategory.slug === activeSubcategorySlug)) {
      setActiveSubcategorySlug(nextCategory.subcategories[0]?.slug || "");
    }
  }, [activeCategorySlug, activeSubcategorySlug, catalog]);

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

  const activeCategory = useMemo(
    () => catalog.find((category) => category.slug === activeCategorySlug) || catalog[0],
    [activeCategorySlug, catalog],
  );
  const activeSubcategory = useMemo(
    () =>
      activeCategory?.subcategories.find((subcategory) => subcategory.slug === activeSubcategorySlug) ||
      activeCategory?.subcategories[0],
    [activeCategory, activeSubcategorySlug],
  );
  const categoryBestSellers = useMemo(
    () => activeCategory?.subcategories.flatMap((sub) => sub.items).filter((item) => item.bestSeller) || [],
    [activeCategory],
  );

  const addToCart = (product) => {
    if (!sessionUser?.email) {
      navigate("/signin");
      return;
    }
    const carts = getMap(CARTS_KEY);
    const userCart = carts[sessionUser.email] || [];
    const cartKey = `${product.id}-nosize-nocolor`;
    const existing = userCart.find((entry) => entry.cartKey === cartKey);
    const nextQuantity = (existing?.quantity || 0) + 1;

    if (typeof product.stock === "number" && product.stock > 0 && nextQuantity > product.stock) {
      setToast({
        show: true,
        message: `Only ${product.stock} item(s) available for ${product.name}.`,
        type: "info",
      });
      return;
    }

    if (typeof product.stock === "number" && product.stock <= 0) {
      setToast({
        show: true,
        message: `${product.name} is out of stock.`,
        type: "info",
      });
      return;
    }

    const updated = existing
      ? userCart.map((entry) => (entry.cartKey === cartKey ? { ...entry, quantity: nextQuantity } : entry))
      : [...userCart, { ...product, cartKey, quantity: 1 }];

    saveMap(CARTS_KEY, { ...carts, [sessionUser.email]: updated });
    setToast({ show: true, message: `${product.name} added to cart.`, type: "success" });
  };

  const addToWishlist = (product) => {
    if (!sessionUser?.email) {
      navigate("/signin");
      return;
    }
    const wishlists = getMap(WISHLISTS_KEY);
    const list = wishlists[sessionUser.email] || [];
    if (list.some((entry) => entry.id === product.id)) {
      setToast({ show: true, message: "Item already in wishlist.", type: "info" });
      return;
    }
    saveMap(WISHLISTS_KEY, { ...wishlists, [sessionUser.email]: [...list, product] });
    setWishlistedIds((prev) => (prev.includes(product.id) ? prev : [...prev, product.id]));
    setToast({ show: true, message: `${product.name} added to wishlist.`, type: "success" });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#f3efe7_55%,#f8f5ef_100%)]">
      <UserHeader />
      <NotificationToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <main className="mx-auto w-[92%] max-w-6xl pt-28 pb-12">
        <section className="rounded-3xl border border-[#ddd3c6] bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.06)] sm:p-8">
          <h1 className="text-3xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
            Shop
          </h1>
          <p className="mt-2 text-sm text-[#5d5a55]">
            Browse admin-created categories, subcategories and products.
          </p>

          {catalog.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[#d8cdbd] bg-[#faf7f2] p-8 text-center">
              <p className="text-lg font-semibold text-[#2f2d2a]">No products yet</p>
              <p className="mt-2 text-sm text-[#6d655d]">
                The admin needs to create categories, subcategories and products first.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-6 flex flex-wrap gap-2">
                {catalog.map((category) => {
                  const isActive = category.slug === activeCategory?.slug;
                  return (
                    <button
                      key={category.slug}
                      type="button"
                      onClick={() => {
                        setActiveCategorySlug(category.slug);
                        setActiveSubcategorySlug(category.subcategories[0]?.slug || "");
                      }}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "border-[#8a5a36] text-[#8a5a36]"
                          : "border-[#d8cdbe] text-[#2f2d2a] hover:bg-[#efe8dc]"
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8d7b65]">Subcategories</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(activeCategory?.subcategories || []).map((subcategory) => (
                    <button
                      key={subcategory.slug}
                      type="button"
                      onClick={() => setActiveSubcategorySlug(subcategory.slug)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold ${subcategory.slug === activeSubcategory?.slug ? "border-[#8a5a36] bg-[#f6ece2] text-[#8a5a36]" : "border-[#d8cdbe] text-[#2f2d2a] hover:bg-[#efe8dc]"}`}
                    >
                      {subcategory.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
                  {activeSubcategory?.name || "Products"}
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(activeSubcategory?.items || []).map((product) => (
                    <article key={product.id} className="overflow-hidden rounded-2xl border border-[#ddd3c6] bg-white">
                      <div className="relative h-48">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        {product.bestSeller && (
                          <span className="absolute left-3 top-3 rounded-full bg-[#d1622d] px-3 py-1 text-xs font-bold text-white">
                            Best Seller
                          </span>
                        )}
                        {getDiscountPercent(product) > 0 && (
                          <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-black uppercase">
                            {getDiscountPercent(product)}% Off
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 p-4">
                        <p className="font-semibold text-[#2a2824]">{product.name}</p>
                        <p className="line-clamp-2 text-xs text-[#68635d]">{product.description}</p>
                        {typeof product.stock === "number" && (
                          <p className="text-xs font-semibold text-[#8a5a36]">Stock: {product.stock}</p>
                        )}
                        {getDiscountPercent(product) > 0 && getOriginalPrice(product) ? (
                          <div>
                            <p className="text-[11px] text-[#8f877d] line-through">{formatNaira(getOriginalPrice(product))}</p>
                            <p className="text-sm font-semibold text-[#5f5a53]">{formatNaira(getDiscountedPrice(product))}</p>
                          </div>
                        ) : (
                          <p className="text-sm font-semibold text-[#5f5a53]">{formatNaira(product.price)}</p>
                        )}
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            className="inline-flex items-center gap-1 rounded-full bg-[#2f2d2a] px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            <ShoppingCart size={13} />
                            Add to Cart
                          </button>
                          <button
                            type="button"
                            onClick={() => addToWishlist(product)}
                            className="inline-flex items-center gap-1 rounded-full border border-[#d7cfc2] px-3 py-1.5 text-xs font-semibold text-[#2f2d2a]"
                          >
                            <Heart size={13} className={wishlistedIds.includes(product.id) ? "fill-black text-black" : ""} />
                            Wishlist
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        {catalog.length > 0 && (
          <section className="mt-8 grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-[#ddd3c6] bg-white p-5">
              <h3 className="inline-flex items-center gap-2 text-xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
                <Tag size={18} />
                Discount Offers
              </h3>
              <div className="mt-4 space-y-3">
                {(activeSubcategory?.items || []).filter((item) => getDiscountPercent(item) > 0).length === 0 ? (
                  <p className="text-sm text-[#6b675f]">No discounted products in this subcategory right now.</p>
                ) : (
                  (activeSubcategory?.items || [])
                    .filter((item) => getDiscountPercent(item) > 0 && getOriginalPrice(item))
                    .slice(0, 4)
                    .map((item) => (
                      <div key={`${item.id}-discount`} className="flex items-center justify-between rounded-lg bg-[#f7f2e9] px-3 py-2">
                        <div>
                          <p className="text-sm font-semibold text-[#2f2d2a]">{item.name}</p>
                          <p className="text-xs text-[#8a5a36]">{getDiscountPercent(item)}% OFF</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-[#8f877d] line-through">{formatNaira(getOriginalPrice(item))}</p>
                          <p className="text-sm font-semibold text-[#8a5a36]">{formatNaira(getDiscountedPrice(item))}</p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-[#ddd3c6] bg-white p-5">
              <h3 className="text-xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
                Best Sellers
              </h3>
              <div className="mt-4 space-y-3">
                {categoryBestSellers.length === 0 ? (
                  <p className="text-sm text-[#6b675f]">No best sellers in this category yet.</p>
                ) : (
                  categoryBestSellers.slice(0, 4).map((item) => (
                    <div key={`${item.id}-category`} className="flex items-center justify-between rounded-lg bg-[#f7f2e9] px-3 py-2">
                      <p className="text-sm font-semibold text-[#2f2d2a]">{item.name}</p>
                      <p className="text-sm font-semibold text-[#8a5a36]">{formatNaira(item.price)}</p>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>
        )}

        {catalog.length === 0 && (
          <div className="mt-6 text-center">
            <Link
              to="/buyer-dashboard"
              className="rounded-full bg-[#2f2d2a] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
