import React from "react";

export default function ProductDetailModal({ open, product, onClose }) {
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-[#1f1f1f]">{product.name}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d9d5cd] px-3 py-1 text-sm text-[#2f2d2a]"
          >
            Close
          </button>
        </div>
        <img
          src={product.image}
          alt={product.name}
          className="mt-4 h-[340px] w-full rounded-xl object-cover"
        />
        <p className="mt-4 text-[#4e4e4e]">{product.description || "No description available."}</p>
      </div>
    </div>
  );
}
