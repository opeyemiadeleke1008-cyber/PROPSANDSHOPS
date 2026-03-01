import { CATEGORY_CATALOG } from "./categoryCatalog";

export const ADMIN_SESSION_KEY = "propsandshops_admin_session";
export const ADMIN_PRODUCTS_KEY = "propsandshops_admin_products";
export const ADMIN_CATEGORIES_KEY = "propsandshops_admin_categories";
export const ORDERS_KEY = "propsandshops_orders";
export const MESSAGES_KEY = "propsandshops_messages";
export const SESSION_KEY = "propsandshops_session";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("propsandshops-storage-updated"));
}

export function formatNaira(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function titleCase(value) {
  return String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getAdminSession() {
  return readJson(ADMIN_SESSION_KEY, null);
}

export function getUserSession() {
  return readJson(SESSION_KEY, null);
}

export function getAdminProducts() {
  return readJson(ADMIN_PRODUCTS_KEY, []);
}

export function saveAdminProducts(value) {
  writeJson(ADMIN_PRODUCTS_KEY, value);
}

export function reduceAdminProductStock(items) {
  if (!Array.isArray(items) || items.length === 0) return;

  const quantitiesById = items.reduce((accumulator, item) => {
    if (!item?.id) return accumulator;
    accumulator[item.id] = (accumulator[item.id] || 0) + Number(item.quantity || 1);
    return accumulator;
  }, {});

  const nextProducts = getAdminProducts().map((product) => {
    const reduction = quantitiesById[product.id];
    if (!reduction) return product;

    return {
      ...product,
      stock: Math.max(0, Number(product.stock || 0) - reduction),
    };
  });

  saveAdminProducts(nextProducts);
}

export function getAdminCategories() {
  return readJson(ADMIN_CATEGORIES_KEY, []);
}

export function saveAdminCategories(value) {
  writeJson(ADMIN_CATEGORIES_KEY, value);
}

export function getOrders() {
  return readJson(ORDERS_KEY, []);
}

export function saveOrders(value) {
  writeJson(ORDERS_KEY, value);
}

export function getMessageThreads() {
  return readJson(MESSAGES_KEY, []);
}

export function saveMessageThreads(value) {
  writeJson(MESSAGES_KEY, value);
}

export function ensureMessageThreadForUser(user) {
  const threads = getMessageThreads();
  const existing = threads.find(
    (thread) => thread.userEmail?.toLowerCase() === user.email?.toLowerCase(),
  );

  if (existing) return existing;

  const newThread = {
    id: `thread-${Date.now()}`,
    userEmail: user.email,
    userName:
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
    userPhoto: user.photoDataUrl || "",
    notes: "",
    unreadByAdmin: 0,
    unreadByUser: 0,
    updatedAt: new Date().toISOString(),
    messages: [],
  };

  saveMessageThreads([newThread, ...threads]);
  return newThread;
}

export function appendMessageToThread(threadId, payload) {
  const threads = getMessageThreads();
  const nextThreads = threads.map((thread) => {
    if (thread.id !== threadId) return thread;

    const nextMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      ...payload,
    };

    return {
      ...thread,
      updatedAt: nextMessage.createdAt,
      unreadByAdmin:
        payload.sender === "user" ? (thread.unreadByAdmin || 0) + 1 : 0,
      unreadByUser:
        payload.sender === "admin" ? (thread.unreadByUser || 0) + 1 : 0,
      messages: [...thread.messages, nextMessage],
    };
  });

  saveMessageThreads(nextThreads);
}

export function markThreadRead(threadId, viewer) {
  const threads = getMessageThreads();
  const target = threads.find((thread) => thread.id === threadId);
  if (!target) return;
  if (viewer === "admin" && !(target.unreadByAdmin || 0)) return;
  if (viewer === "user" && !(target.unreadByUser || 0)) return;

  const nextThreads = threads.map((thread) =>
    thread.id === threadId
      ? {
          ...thread,
          unreadByAdmin: viewer === "admin" ? 0 : thread.unreadByAdmin || 0,
          unreadByUser: viewer === "user" ? 0 : thread.unreadByUser || 0,
        }
      : thread,
  );
  saveMessageThreads(nextThreads);
}

export function updateThreadNotes(threadId, notes) {
  const threads = getMessageThreads();
  const nextThreads = threads.map((thread) =>
    thread.id === threadId ? { ...thread, notes } : thread,
  );
  saveMessageThreads(nextThreads);
}

function cloneBaseCatalog() {
  return CATEGORY_CATALOG.map((category) => ({
    ...category,
    subcategories: category.subcategories.map((subcategory) => ({
      ...subcategory,
      items: [...subcategory.items],
    })),
  }));
}

export function getMergedCatalog() {
  const catalog = cloneBaseCatalog();
  const adminCategories = getAdminCategories();
  const adminProducts = getAdminProducts();

  adminCategories.forEach((entry) => {
    const categorySlug = slugify(entry.categoryName);
    const subcategorySlug = slugify(entry.subcategoryName);

    let category = catalog.find(
      (item) =>
        item.slug === categorySlug ||
        item.name.toLowerCase() === entry.categoryName.toLowerCase(),
    );

    if (!category) {
      category = {
        slug: categorySlug,
        name: titleCase(entry.categoryName),
        description: `Admin curated picks for ${titleCase(entry.categoryName)}.`,
        image: entry.image || "",
        subcategories: [],
      };
      catalog.push(category);
    }

    const hasSubcategory = category.subcategories.some(
      (item) =>
        item.slug === subcategorySlug ||
        item.name.toLowerCase() === entry.subcategoryName.toLowerCase(),
    );

    if (!hasSubcategory) {
      category.subcategories.push({
        slug: subcategorySlug,
        name: titleCase(entry.subcategoryName),
        items: [],
      });
    }
  });

  adminProducts.forEach((product) => {
    const categorySlug = slugify(product.categoryName);
    const subcategorySlug = slugify(product.subcategoryName);

    let category = catalog.find(
      (entry) =>
        entry.slug === categorySlug ||
        entry.name.toLowerCase() === product.categoryName.toLowerCase(),
    );

    if (!category) {
      category = {
        slug: categorySlug,
        name: titleCase(product.categoryName),
        description: `Admin curated picks for ${titleCase(product.categoryName)}.`,
        image: product.image,
        subcategories: [],
      };
      catalog.push(category);
    }

    let subcategory = category.subcategories.find(
      (entry) =>
        entry.slug === subcategorySlug ||
        entry.name.toLowerCase() === product.subcategoryName.toLowerCase(),
    );

    if (!subcategory) {
      subcategory = {
        slug: subcategorySlug,
        name: titleCase(product.subcategoryName),
        items: [],
      };
      category.subcategories.push(subcategory);
    }

    subcategory.items.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      sizes: product.sizes?.length ? product.sizes : ["Standard"],
      colors: product.colors?.length ? product.colors : ["Default"],
      stock: product.stock || 0,
      bestSeller: Boolean(product.bestSeller),
      compareAtPrice: product.compareAtPrice || null,
      discountPercent: product.discountPercent || 0,
      adminCreated: true,
    });
  });

  return catalog;
}
