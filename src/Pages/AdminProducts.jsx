import React, { useEffect, useMemo, useState } from "react";
import AdminHeader from "../Layouts/AdminHeader";
import {
  formatNaira,
  getAdminCategories,
  getAdminProducts,
  getAdminSession,
  getMergedCatalog,
  saveAdminCategories,
  saveAdminProducts,
  slugify,
  titleCase,
} from "../data/adminStore";
import { useNavigate } from "react-router-dom";

function emptyForm() {
  return {
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    discountPercent: "",
    stock: "",
    categoryName: "",
    subcategoryName: "",
    image: "",
    imageName: "",
    bestSeller: false,
  };
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const adminSession = getAdminSession();
  const [products, setProducts] = useState(getAdminProducts());
  const [adminCategories, setAdminCategories] = useState(getAdminCategories());
  const [catalog, setCatalog] = useState(getMergedCatalog());
  const [form, setForm] = useState(emptyForm());
  const [categoryForm, setCategoryForm] = useState({
    categoryName: "",
    subcategoryName: "",
  });

  useEffect(() => {
    if (!adminSession?.email) {
      navigate("/admin-signin", { replace: true });
    }
  }, [adminSession, navigate]);

  useEffect(() => {
    const refresh = () => {
      setAdminCategories(getAdminCategories());
      setProducts(getAdminProducts());
      setCatalog(getMergedCatalog());
    };
    window.addEventListener("storage", refresh);
    window.addEventListener("propsandshops-storage-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("propsandshops-storage-updated", refresh);
    };
  }, []);

  if (!adminSession?.email) return null;

  const categories = useMemo(() => catalog.map((category) => category.name), [catalog]);
  const subcategories = useMemo(
    () => catalog.flatMap((category) => category.subcategories.map((subcategory) => subcategory.name)),
    [catalog],
  );

  const previewPrice = Number(form.price || 0);
  const previewDiscount = Number(form.discountPercent || 0);
  const previewCompare =
    previewDiscount > 0 && previewDiscount < 100
      ? previewPrice / (1 - previewDiscount / 100)
      : Number(form.compareAtPrice || 0);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        image: String(reader.result || ""),
        imageName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.price || !form.categoryName.trim() || !form.subcategoryName.trim() || !form.image) {
      return;
    }

    const price = Number(form.price);
    const explicitDiscount = Number(form.discountPercent || 0);
    const rawCompareAtPrice = Number(form.compareAtPrice || 0);
    const discountPercent =
      explicitDiscount > 0 && explicitDiscount < 100
        ? explicitDiscount
        : rawCompareAtPrice > price
          ? Math.round(((rawCompareAtPrice - price) / rawCompareAtPrice) * 100)
          : 0;
    const compareAtPrice =
      discountPercent > 0 ? Number((price / (1 - discountPercent / 100)).toFixed(2)) : null;

    const nextProduct = {
      id: `admin-product-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      compareAtPrice: compareAtPrice || null,
      discountPercent,
      stock: Number(form.stock || 0),
      categoryName: titleCase(form.categoryName),
      categorySlug: slugify(form.categoryName),
      subcategoryName: titleCase(form.subcategoryName),
      subcategorySlug: slugify(form.subcategoryName),
      image: form.image,
      imageName: form.imageName,
      bestSeller: form.bestSeller,
      createdAt: new Date().toISOString(),
      createdBy: adminSession.email,
    };

    const nextProducts = [nextProduct, ...products];
    setProducts(nextProducts);
    saveAdminProducts(nextProducts);
    setForm(emptyForm());
  };

  const handleCreateCategory = (event) => {
    event.preventDefault();
    if (!categoryForm.categoryName.trim() || !categoryForm.subcategoryName.trim()) {
      return;
    }

    const exists = adminCategories.some(
      (entry) =>
        entry.categoryName.toLowerCase() === categoryForm.categoryName.trim().toLowerCase() &&
        entry.subcategoryName.toLowerCase() === categoryForm.subcategoryName.trim().toLowerCase(),
    );
    if (exists) return;

    const nextEntry = {
      id: `admin-category-${Date.now()}`,
      categoryName: titleCase(categoryForm.categoryName),
      categorySlug: slugify(categoryForm.categoryName),
      subcategoryName: titleCase(categoryForm.subcategoryName),
      subcategorySlug: slugify(categoryForm.subcategoryName),
      createdAt: new Date().toISOString(),
    };

    const nextCategories = [nextEntry, ...adminCategories];
    setAdminCategories(nextCategories);
    saveAdminCategories(nextCategories);
    setCategoryForm({ categoryName: "", subcategoryName: "" });
  };

  return (
    <div className="min-h-screen bg-[#f5f1eb]">
      <AdminHeader />
      <main className="mx-auto w-[94%] max-w-7xl pt-28 pb-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-[#dfd4c7] bg-[#fbf8f4] p-6">
            <h1 className="text-3xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
              Add New Product
            </h1>
            <p className="mt-2 text-sm text-[#766d63]">
              Create products, reuse existing categories, or introduce new ones.
            </p>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <section className="rounded-2xl border border-[#e9dfd3] bg-white p-5">
                <p className="text-lg font-semibold text-[#25211d]">Product Photo</p>
                <label
                  htmlFor="admin-product-image"
                  className="mt-4 flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#d7cabb] bg-[#faf6f1] text-sm text-[#7f766d]"
                >
                  {form.image ? (
                    <img src={form.image} alt="Preview" className="h-full w-full rounded-2xl object-cover" />
                  ) : (
                    <>
                      <span className="font-semibold text-[#2d2924]">Click to drop image</span>
                      <span className="mt-1 text-xs">PNG, JPG up to 10MB</span>
                    </>
                  )}
                </label>
                <input id="admin-product-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </section>

              <section className="rounded-2xl border border-[#e9dfd3] bg-white p-5">
                <p className="text-lg font-semibold text-[#25211d]">Product Information</p>
                <div className="mt-4 grid gap-4">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Product name"
                    className="rounded-full border border-[#dfd4c7] px-4 py-3 outline-none"
                  />
                  <textarea
                    value={form.description}
                    onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Describe your product..."
                    rows={5}
                    className="rounded-3xl border border-[#dfd4c7] px-4 py-3 outline-none"
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-[#e9dfd3] bg-white p-5">
                <p className="text-lg font-semibold text-[#25211d]">Pricing & Stock</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                    placeholder="Selling price"
                    className="rounded-full border border-[#dfd4c7] px-4 py-3 outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    value={form.compareAtPrice}
                    onChange={(event) => setForm((prev) => ({ ...prev, compareAtPrice: event.target.value }))}
                    placeholder="Compare at price (optional)"
                    className="rounded-full border border-[#dfd4c7] px-4 py-3 outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={form.discountPercent}
                    onChange={(event) => setForm((prev) => ({ ...prev, discountPercent: event.target.value }))}
                    placeholder="Discount % (optional)"
                    className="rounded-full border border-[#dfd4c7] px-4 py-3 outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                    placeholder="Stock quantity"
                    className="rounded-full border border-[#dfd4c7] px-4 py-3 outline-none"
                  />
                  <label className="flex items-center gap-2 rounded-full border border-[#dfd4c7] px-4 py-3 text-sm font-semibold text-[#4c463f]">
                    <input
                      type="checkbox"
                      checked={form.bestSeller}
                      onChange={(event) => setForm((prev) => ({ ...prev, bestSeller: event.target.checked }))}
                    />
                    Mark as bestseller
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-[#e9dfd3] bg-white p-5">
                <p className="text-lg font-semibold text-[#25211d]">Categories</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <input
                      list="admin-category-list"
                      type="text"
                      value={form.categoryName}
                      onChange={(event) => setForm((prev) => ({ ...prev, categoryName: event.target.value }))}
                      placeholder="Category name"
                      className="w-full rounded-full border border-[#dfd4c7] px-4 py-3 outline-none"
                    />
                    <datalist id="admin-category-list">
                      {categories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <input
                      list="admin-subcategory-list"
                      type="text"
                      value={form.subcategoryName}
                      onChange={(event) => setForm((prev) => ({ ...prev, subcategoryName: event.target.value }))}
                      placeholder="Subcategory name"
                      className="w-full rounded-full border border-[#dfd4c7] px-4 py-3 outline-none"
                    />
                    <datalist id="admin-subcategory-list">
                      {subcategories.map((subcategory) => (
                        <option key={subcategory} value={subcategory} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </section>

              <button
                type="submit"
                className="rounded-full bg-[#cf7858] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#bb694a]"
              >
                Publish Product
              </button>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-[#dfd4c7] bg-[#fbf8f4] p-6">
              <h2 className="text-2xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
                Create Category
              </h2>
              <form className="mt-4 space-y-3" onSubmit={handleCreateCategory}>
                <input
                  type="text"
                  value={categoryForm.categoryName}
                  onChange={(event) =>
                    setCategoryForm((prev) => ({ ...prev, categoryName: event.target.value }))
                  }
                  placeholder="Category name"
                  className="w-full rounded-full border border-[#dfd4c7] px-4 py-3 outline-none"
                />
                <input
                  type="text"
                  value={categoryForm.subcategoryName}
                  onChange={(event) =>
                    setCategoryForm((prev) => ({ ...prev, subcategoryName: event.target.value }))
                  }
                  placeholder="Subcategory name"
                  className="w-full rounded-full border border-[#dfd4c7] px-4 py-3 outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#2f2d2a] px-4 py-2 text-sm font-semibold text-white"
                >
                  Save Category
                </button>
              </form>
            </section>

            <section className="rounded-[28px] border border-[#dfd4c7] bg-[#fbf8f4] p-6">
              <h2 className="text-2xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
                Product Preview
              </h2>
              <div className="mt-5 rounded-2xl border border-[#e9dfd3] bg-white p-4">
                <div className="h-52 overflow-hidden rounded-2xl bg-[#f5efe8]">
                  {form.image ? (
                    <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <p className="mt-4 font-semibold text-[#2d2924]">{form.name || "Product name"}</p>
                <p className="mt-2 text-sm text-[#7c7369]">{form.description || "Description preview appears here."}</p>
                <p className="mt-3 font-semibold text-[#cf7858]">
                  {previewPrice ? formatNaira(previewPrice) : "₦0.00"}
                </p>
                {previewCompare > previewPrice && previewPrice > 0 && (
                  <div className="mt-1">
                    <p className="text-xs text-[#8e8378] line-through">{formatNaira(previewCompare)}</p>
                    <p className="text-[11px] font-semibold uppercase text-[#8a5a36]">
                      {Math.round(((previewCompare - previewPrice) / previewCompare) * 100)}% off
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-[#dfd4c7] bg-[#fbf8f4] p-6">
              <h2 className="text-2xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
                Admin Products
              </h2>
              <div className="mt-4 space-y-3">
                {products.length === 0 ? (
                  <p className="text-sm text-[#766d63]">No admin products yet.</p>
                ) : (
                  products.slice(0, 6).map((product) => (
                    <article key={product.id} className="rounded-xl border border-[#e9dfd3] bg-white p-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="h-14 w-14 rounded-xl object-cover" />
                        <div>
                          <p className="font-semibold text-[#2d2924]">{product.name}</p>
                          <p className="text-xs text-[#7c7369]">
                            {product.categoryName} / {product.subcategoryName}
                          </p>
                          <p className="text-sm font-semibold text-[#cf7858]">{formatNaira(product.price)}</p>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
