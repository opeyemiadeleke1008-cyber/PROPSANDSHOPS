import React, { useEffect, useState } from "react";

export default function ProductVariantModal({ open, product, onClose, onConfirm }) {
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    if (!product) return;
    setSize(product.sizes?.length === 1 ? product.sizes[0] : "");
    setColor(product.colors?.length === 1 ? product.colors[0] : "");
  }, [product]);

  if (!open || !product) return null;

  const needsSizeChoice = (product.sizes?.length || 0) > 1;
  const needsColorChoice = (product.colors?.length || 0) > 1;

  const canSubmit = (!needsSizeChoice || size) && (!needsColorChoice || color);

  const handleConfirm = () => {
    onConfirm({
      size: size || (product.sizes?.[0] ?? null),
      color: color || (product.colors?.[0] ?? null),
    });
  };

  return (
    <div className="fixed inset-0 z-160 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <h3 className="text-xl font-bold text-[#1f1f1f]">Choose Options</h3>
        <p className="mt-1 text-sm text-[#666]">{product.name}</p>

        {product.sizes?.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-[#2b2b2b]">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setSize(entry)}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    size === entry ? "border-[#2f2d2a] bg-[#f3eee5]" : "border-[#d9d5cd]"
                  }`}
                >
                  {entry}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.colors?.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-[#2b2b2b]">Color</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setColor(entry)}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    color === entry ? "border-[#2f2d2a] bg-[#f3eee5]" : "border-[#d9d5cd]"
                  }`}
                >
                  {entry}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-[#d9d5cd] px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canSubmit}
            className="flex-1 rounded-full bg-[#2f2d2a] px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
