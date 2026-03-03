import { User } from "lucide-react";
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "About", sectionId: "about" },
  { label: "Testimonials", sectionId: "testimonials" },
  { label: "FAQs", sectionId: "faqs" },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSectionNav = (sectionId) => {
    if (location.pathname === "/") {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      window.history.replaceState(null, "", `/#${sectionId}`);
      return;
    }

    navigate(`/#${sectionId}`);
  };

  return (
    <div className="fixed left-1/2 top-4 z-50 flex w-[95%] -translate-x-1/2 items-center justify-between rounded-3xl border border-white/30 bg-white/60 px-3 py-2 shadow-2xl backdrop-blur-md sm:top-6 sm:w-[90%] sm:px-5">
      <nav className="hidden list-none gap-5 text-sm font-semibold md:flex">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.sectionId}
            type="button"
            onClick={() => handleSectionNav(item.sectionId)}
            className="cursor-pointer hover:border-b hover:border-gray-900"
          >
            {item.label}
          </button>
        ))}
        <Link to="/contact" className="cursor-pointer hover:border-b hover:border-gray-900">
          Contact
        </Link>
      </nav>

      <Link to="/">
        <h1
          className="text-sm font-semibold sm:text-md"
          style={{ fontFamily: '"Orbitron"' }}
        >
          PropsAndShops
        </h1>
      </Link>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          onClick={() => handleSectionNav("newsletter")}
          className="hidden cursor-pointer text-sm font-semibold hover:border-b hover:border-gray-900 md:block"
        >
          Subscribe
        </button>
        <Link to="/signin">
          <User size={18} strokeWidth={2} className="rounded-full border border-gray-900 p-2 box-content cursor-pointer focus:fill-black"/>
        </Link>
      </div>
    </div>
  );
}
