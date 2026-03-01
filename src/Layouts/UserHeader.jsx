import { Heart, ShoppingCart, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import UserNavbar from "../UI/UserNavbar";

const SESSION_KEY = "propsandshops_session";
const CARTS_KEY = "propsandshops_carts";
const WISHLISTS_KEY = "propsandshops_wishlists";

function readMap(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export default function UserHeader() {
  const location = useLocation();
  const [counts, setCounts] = useState({ cart: 0, wishlist: 0 });

  useEffect(() => {
    const computeCounts = () => {
      const session = readSession();
      if (!session?.email) {
        setCounts({ cart: 0, wishlist: 0 });
        return;
      }

      const carts = readMap(CARTS_KEY);
      const wishlists = readMap(WISHLISTS_KEY);
      const cartCount = (carts[session.email] || []).reduce(
        (sum, item) => sum + (item.quantity || 1),
        0,
      );
      const wishlistCount = (wishlists[session.email] || []).length;
      setCounts({ cart: cartCount, wishlist: wishlistCount });
    };

    computeCounts();
    window.addEventListener("storage", computeCounts);
    window.addEventListener("propsandshops-storage-updated", computeCounts);
    return () => {
      window.removeEventListener("storage", computeCounts);
      window.removeEventListener("propsandshops-storage-updated", computeCounts);
    };
  }, [location.pathname]);

  return (
    <div className="fixed top-4 z-50 flex w-[95%] items-center justify-between rounded-3xl border border-white/30 bg-white/60 px-3 py-2 shadow-2xl backdrop-blur-md sm:top-6 sm:w-[90%] sm:px-5 justify-self-center">
      <UserNavbar />
      <nav className="text-sm font-semibold hidden md:flex list-none gap-5">
        <Link to="/shop">Shop</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/buyer-dashboard">Dashboard</Link>
        <Link to="/messages">Messages</Link>
      </nav>
      <Link to="/buyer-dashboard">
      <h1
        className="text-sm font-semibold sm:text-md"
        style={{ fontFamily: '"Orbitron"' }}
      >
        PropsAndShops
      </h1>
      </Link>
      <div className="flex gap-1.5 sm:gap-2">
        <Link to="/wishlist" className="relative">
            <Heart size={18} strokeWidth={2} className="rounded-full border border-gray-900 p-2 box-content cursor-pointer focus:fill-black"/>
            {counts.wishlist > 0 && (
              <span className="absolute -top-2 right-0 min-w-4 rounded-full bg-[#d1622d] px-1 text-center text-[10px] font-bold text-white">
                {counts.wishlist}
              </span>
            )}
        </Link>
        <Link to="/cart" className="relative">
            <ShoppingCart size={18} strokeWidth={2} className="rounded-full border border-gray-900 p-2 box-content cursor-pointer focus:fill-black"/>
            {counts.cart > 0 && (
              <span className="absolute -top-2 right-0 min-w-4 rounded-full bg-[#d1622d] px-1 text-center text-[10px] font-bold text-white">
                {counts.cart}
              </span>
            )}
        </Link>
        <Link to="/buyer-profile">
            <User size={18} strokeWidth={2} className="rounded-full border border-gray-900 p-2 box-content cursor-pointer focus:fill-black"/>
        </Link>
      </div>
    </div>
  );
}
