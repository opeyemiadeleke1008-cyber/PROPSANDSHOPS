import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { formatNaira, getMergedCatalog, getOrders } from "../data/adminStore";
import Footer from "../Layouts/Footer";
import UserHeader from "../Layouts/UserHeader";

const SESSION_KEY = "propsandshops_session";
const USERS_KEY = "propsandshops_users";

function getSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveStoredUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [sessionUser, setSessionUser] = useState(getSessionUser());
  const [catalog, setCatalog] = useState(() => getMergedCatalog());
  const [activeCategorySlug, setActiveCategorySlug] = useState(
    () => getMergedCatalog()[0]?.slug || "",
  );

  useEffect(() => {
    const refreshCatalog = () => setCatalog(getMergedCatalog());
    const refreshSession = () => setSessionUser(getSessionUser());
    window.addEventListener("storage", refreshCatalog);
    window.addEventListener("propsandshops-storage-updated", refreshCatalog);
    window.addEventListener("storage", refreshSession);
    window.addEventListener("propsandshops-storage-updated", refreshSession);
    return () => {
      window.removeEventListener("storage", refreshCatalog);
      window.removeEventListener("propsandshops-storage-updated", refreshCatalog);
      window.removeEventListener("storage", refreshSession);
      window.removeEventListener("propsandshops-storage-updated", refreshSession);
    };
  }, []);

  useEffect(() => {
    if (!catalog.find((item) => item.slug === activeCategorySlug) && catalog[0]) {
      setActiveCategorySlug(catalog[0].slug);
    }
  }, [activeCategorySlug, catalog]);

  useEffect(() => {
    if (!sessionUser?.email) {
      navigate("/signin", { replace: true });
    }
  }, [navigate, sessionUser]);

  if (!sessionUser?.email) return null;

  const activeCategory = useMemo(
    () =>
      catalog.find((item) => item.slug === activeCategorySlug) || catalog[0],
    [activeCategorySlug, catalog],
  );

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event("propsandshops-storage-updated"));
    navigate("/", { replace: true });
  };

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file || !sessionUser?.email) return;

    const reader = new FileReader();
    reader.onload = () => {
      const patch = {
        photoName: file.name,
        photoDataUrl: String(reader.result || ""),
      };
      const nextSession = { ...sessionUser, ...patch };
      const nextUsers = getStoredUsers().map((user) =>
        user.email?.toLowerCase() === sessionUser.email.toLowerCase() ? { ...user, ...patch } : user,
      );

      saveStoredUsers(nextUsers);
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      setSessionUser(nextSession);
      window.dispatchEvent(new Event("propsandshops-storage-updated"));
    };
    reader.readAsDataURL(file);
  };

  const recentOrders = useMemo(() => {
    const allOrders = getOrders();
    return allOrders
      .filter((order) => order.userEmail === sessionUser.email)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [sessionUser.email]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#f3efe7_55%,#f8f5ef_100%)]">
     <UserHeader/>

      <main className="mx-auto w-[92%] max-w-6xl pt-30 pb-12">
        {catalog.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-[#d8cdbd] bg-white p-10 text-center shadow-[0_12px_45px_rgba(41,37,36,0.08)]">
            <h1 className="text-3xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
              No products yet
            </h1>
            <p className="mt-3 text-sm text-[#5d5a55]">
              The admin needs to create categories and products before shoppers can browse.
            </p>
          </section>
        ) : (
          <>
        <section className="overflow-hidden rounded-3xl border border-[#e2dacd] bg-white shadow-[0_12px_45px_rgba(41,37,36,0.08)]">
          <div className="grid lg:grid-cols-[1.1fr_1fr]">
            <div className="p-8 sm:p-10">
              <p className="text-xs uppercase tracking-[0.2em] text-[#9b7e63]">
                Buyer Space
              </p>
              <h1
                className="mt-3 text-4xl font-bold text-[#1f1f1f]"
                style={{ fontFamily: '"Orbitron"' }}
              >
                Welcome, {sessionUser.firstName || "Shopper"}
              </h1>
              <p className="mt-4 max-w-xl text-[#5d5a55]">
                Choose a category, explore subcategories, and jump straight into
                curated collections.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/cart"
                  className="rounded-full bg-[#2f2d2a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f1e1c]"
                >
                  Open Cart
                </Link>
                <Link
                  to="/wishlist"
                  className="rounded-full border border-[#cfc4b4] px-5 py-2.5 text-sm font-semibold text-[#2f2d2a] transition hover:bg-[#f0ece4]"
                >
                  Open Wishlist
                </Link>
                <Link
                  to="/notifications"
                  className="rounded-full border border-[#cfc4b4] px-5 py-2.5 text-sm font-semibold text-[#2f2d2a] transition hover:bg-[#f0ece4] cursor-pointer"
                >
                  Notifications
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-[#e3b8b8] px-5 py-2.5 text-sm font-semibold text-[#8f3e3e] transition hover:bg-[#faecec]"
                >
                  Log Out
                </button>
              </div>
              <div className="mt-7 rounded-2xl border border-[#e7dece] bg-[#faf7f2] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#2f2d2a]">Recent Orders</p>
                  <Link to="/orders" className="text-xs font-semibold text-[#8a5a36] hover:underline">
                    View all
                  </Link>
                </div>
                {recentOrders.length === 0 ? (
                  <p className="mt-2 text-sm text-[#666]">No recent orders yet.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-xl border border-[#e7dece] bg-white px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-[#2f2d2a]">{order.id}</p>
                          <p className="text-xs text-[#70695f]">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#2f2d2a]">{formatNaira(order.total || 0)}</p>
                          <p
                            className={`text-xs font-semibold uppercase ${order.status === "delivered" ? "text-emerald-600" : "text-amber-700"}`}
                          >
                            {order.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex min-h-[260px] items-center justify-center bg-[linear-gradient(180deg,#f4ede2_0%,#efe6d8_100%)] p-8">
              <div className="w-full max-w-sm rounded-[28px] border border-[#e2dacd] bg-white/90 p-6 text-center shadow-[0_12px_35px_rgba(79,64,54,0.08)]">
                <div className="mx-auto h-40 w-40 overflow-hidden rounded-full border border-[#d8ccb9] bg-[#faf7f2]">
                  {sessionUser.photoDataUrl ? (
                    <img
                      src={sessionUser.photoDataUrl}
                      alt={`${sessionUser.firstName || "Buyer"} profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center px-4 text-sm font-semibold text-[#8d7b65]">
                      No profile pics
                    </div>
                  )}
                </div>
                <p className="mt-4 text-sm text-[#5d5a55]">
                  {sessionUser.photoName || "No profile pics"}
                </p>
                <label
                  htmlFor="buyer-dashboard-profile-photo"
                  className="mt-4 inline-block cursor-pointer rounded-full bg-[#2f2d2a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f1e1c]"
                >
                  Choose Profile Pic
                </label>
                <input
                  id="buyer-dashboard-profile-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2
              className="text-2xl font-bold text-[#1f1f1f]"
              style={{ fontFamily: '"Orbitron"' }}
            >
              Categories
            </h2>
            <Link
              to="/shop"
              className="rounded-full border border-[#cfc4b4] px-4 py-2 text-sm font-semibold text-[#2f2d2a] transition hover:bg-[#f0ece4]"
            >
              View All Categories
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.map((category) => {
              const isActive = activeCategory.slug === category.slug;
              return (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => setActiveCategorySlug(category.slug)}
                  className={`group rounded-2xl border p-4 text-left transition ${
                    isActive
                      ? "border-[#2f2d2a] bg-[#f4efe6] shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                      : "border-[#ddd3c6] bg-white hover:bg-[#f8f3eb]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[#272522]">
                      {category.name}
                    </h3>
                    <ChevronRight
                      size={16}
                      className={isActive ? "text-[#2f2d2a]" : "text-[#8e857a]"}
                    />
                  </div>
                  <p className="mt-1 text-sm text-[#68635d]">
                    {category.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2
              className="text-2xl font-bold text-[#1f1f1f]"
              style={{ fontFamily: '"Orbitron"' }}
            >
              {activeCategory.name} Subcategories
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {activeCategory.subcategories.map((subcategory) => (
              <article
                key={subcategory.slug}
                className="rounded-2xl border border-[#ddd3c6] bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.04)]"
              >
                <h3 className="text-lg font-semibold text-[#252220]">
                  {subcategory.name}
                </h3>
                <p className="mt-1 text-sm text-[#68635d]">
                  {subcategory.items.length} featured items available
                </p>
                <Link
                  to={`/shop/${activeCategory.slug}/${subcategory.slug}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2f2d2a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f1e1c]"
                >
                  Shop {subcategory.name}
                  <ArrowRight size={15} />
                </Link>
              </article>
            ))}
          </div>
        </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
