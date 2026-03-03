import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-[#d9d5cd] bg-[#f2eee6]">
      <div className="mx-auto grid w-[92%] gap-6 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
            PropsAndShops
          </h3>
          <p className="mt-2 text-sm text-[#5c5c5c]">
            Premium props and furniture-inspired picks for modern interiors.
          </p>
          <p className="mt-2 text-sm text-[#444]">18, alh.Afoke, gowon estate, egbeda road, lagos</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
            Quick Links
          </h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[#444]">
            <Link to="/cart">Cart</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/orders">Orders</Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
            Contact
          </h4>
          <p className="mt-3 text-sm text-[#444]">propsandshops@gmail.com</p>
          <p className="text-sm text-[#444]">+234 800 000 0000</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
            Policies
          </h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[#444]">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/return">Return Policy</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[#d9d5cd] py-4 text-center text-xs text-[#666]">
        © {new Date().getFullYear()} PropsAndShops. All rights reserved.
      </div>
    </footer>
  );
}
