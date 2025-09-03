"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  stock?: number;
  sku?: string;
  flavors?: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
};

type Flavor = {
  id: string;
  name: string;
  quantity: number;
};

const AddProductsPage = () => {
  const { user, loading: userLoading } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Product>>({
    name: "",
    price: 0,
    stock: 0,
    category: "",
    isActive: true,
    sku: "",
    flavors: [],
  });
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);
  const [availableFlavors] = useState<Array<{id: string, name: string}>>([
    { id: "red_twist", name: "Red Twist" },
    { id: "blue_raspberry", name: "Blue Raspberry" },
    { id: "fruit_rainbow", name: "Fruit Rainbow" },
    { id: "green_apple", name: "Green Apple" },
    { id: "watermelon", name: "Watermelon" },
    { id: "cherry", name: "Cherry" },
    { id: "berry_delight", name: "Berry Delight" },
    { id: "cotton_candy", name: "Cotton Candy" },
    { id: "strawberry_banana", name: "Strawberry Banana" },
  ]);

  useEffect(() => {
    if (!userLoading && user?.role !== "admin") {
      if (typeof window !== "undefined") window.location.href = "/";
    }
  }, [user, userLoading]);

  const fetchProducts = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setLoading(true);
    setError(null);
    try {
      // Use admin endpoint that returns ALL products (active + inactive)
      const { data } = await axios.get<{ products: Product[] }>(
        `${API_URL}/products/admin/all`,
        { withCredentials: true }
      );
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (e) {
      // Fallback: try alternate mount
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        try {
          const { data } = await axios.get<{ products: Product[] }>(
            `${API_URL}/admin/all`,
            { withCredentials: true }
          );
          setProducts(Array.isArray(data.products) ? data.products : []);
          setError(null);
        } catch (e2) {
          const message = (e2 as { message?: string })?.message || 'Failed to load products';
          setError(message);
          setProducts([]);
        }
      } else {
        const message = (e as { message?: string })?.message || 'Failed to load products';
        setError(message);
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const { data } = await axios.get<string[]>(
        `${API_URL}/products/categories`,
        { withCredentials: true }
      );
      if (Array.isArray(data)) setCategories(data);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        try {
          const { data } = await axios.get<string[]>(
            `${API_URL}/products/categories`,
            { withCredentials: true }
          );
          if (Array.isArray(data)) setCategories(data);
        } catch (e2) {
          if (axios.isAxiosError(e2) && e2.response?.status === 404) {
            try {
              const { data } = await axios.get<string[]>(
                `${API_URL}/products/categories`,
                { withCredentials: true }
              );
              if (Array.isArray(data)) setCategories(data);
            } catch {
              /* ignore */
            }
          }
        }
      }
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchProducts();
      fetchCategories();
    }
  }, [user]);

  const pageSize = 10;
  const filteredByCategory = useMemo(
    () =>
      categoryFilter
        ? products.filter((p) => p.category === categoryFilter)
        : products,
    [products, categoryFilter]
  );
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filteredByCategory;
    return filteredByCategory.filter((p) => p.name.toLowerCase().includes(q));
  }, [filteredByCategory, search]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / pageSize)),
    [filtered.length]
  );
  const current = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page]
  );

  const resetForm = () =>
    setForm({
      name: "",
      price: 0,
      category: "",
      description: "",
      imageUrl: "",
      sku: "",
      flavors: [],
    });

  const addFlavor = () => {
    if (form.flavors && form.flavors.length < 3) {
      setForm(prev => ({
        ...prev,
        flavors: [...(prev.flavors || []), { id: "", name: "", quantity: 1 }]
      }));
    }
  };

  const removeFlavor = (index: number) => {
    setForm(prev => ({
      ...prev,
      flavors: prev.flavors?.filter((_, i) => i !== index) || []
    }));
  };

  const updateFlavor = (index: number, field: keyof Flavor, value: string | number) => {
    setForm(prev => ({
      ...prev,
      flavors: prev.flavors?.map((flavor, i) => 
        i === index ? { ...flavor, [field]: value } : flavor
      ) || []
    }));
  };



  const createProduct = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        price: Number(form.price || 0),
        stock: Number(form.stock || 0),
        category: form.category,
        description: form.description,
        imageUrl: form.imageUrl || preview || undefined,
        imageBase64: preview || undefined,
        isActive: !!form.isActive,
        sku: form.sku || undefined,
        flavors: form.flavors || undefined,
      };
      const { data: dataResp } = await axios.post<Product>(
        `${API_URL}/products/admin/products`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = dataResp as Product;
      setProducts((prev) => [data, ...prev]);
      resetForm();
      setPreview(null);
    } catch (e) {
      const message =
        (e as { message?: string })?.message || "Failed to create product";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const updateProduct = async (id: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setSaving(true);
    setError(null);
    try {
      if (!id) {
        setError("Missing product id");
        setSaving(false);
        return;
      }
      const payload = {
        name: form.name,
        price: Number(form.price || 0),
        stock: Number(form.stock || 0),
        category: form.category,
        description: form.description,
        imageUrl: form.imageUrl || preview || undefined,
        imageBase64: preview || undefined,
        isActive: !!form.isActive,
        sku: form.sku || undefined,
        flavors: form.flavors || undefined,
      };
      let dataResp: Product;
      try {
        const { data } = await axios.put<Product>(
          `${API_URL}/products/admin/${id}`,
          payload,
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        dataResp = data;
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          const { data } = await axios.put<Product>(
            `${API_URL}/admin/${id}`,
            payload,
            {
              withCredentials: true,
              headers: { "Content-Type": "application/json" },
            }
          );
          dataResp = data;
        } else {
          throw e;
        }
      }
      const data = dataResp as Product;
      setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
      setOpenId(null);
      resetForm();
      setPreview(null);
    } catch (e) {
      const message =
        (e as { message?: string })?.message || "Failed to update product";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // Update using row data to avoid stale form state
  const updateProductByRow = async (
    row: Product,
    overrides: Partial<Product>
  ) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setSaving(true);
    setError(null);
    try {
      const id = row.id;
      if (!id) {
        setError("Missing product id");
        setSaving(false);
        return;
      }
      const payload = {
        name: overrides.name ?? row.name,
        price: Number(overrides.price ?? row.price ?? 0),
        stock: Number(overrides.stock ?? row.stock ?? 0),
        category: overrides.category ?? row.category,
        description: overrides.description ?? row.description,
        imageUrl: overrides.imageUrl ?? row.imageUrl,
        isActive: overrides.isActive ?? row.isActive ?? true,
        sku: overrides.sku ?? row.sku,
        flavors: overrides.flavors ?? row.flavors,
      };

      // Optimistic update
      const prev = products;
      setProducts((cur) =>
        cur.map((p) => (p.id === id ? { ...p, ...payload } : p))
      );

      let dataResp: Product;
      try {
        const { data } = await axios.put<Product>(
          `${API_URL}/products/admin/${id}`,
          payload,
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        dataResp = data;
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          const { data } = await axios.put<Product>(
            `${API_URL}/admin/${id}`,
            payload,
            {
              withCredentials: true,
              headers: { "Content-Type": "application/json" },
            }
          );
          dataResp = data;
        } else {
          // Revert optimistic update
          setProducts(prev);
          throw e;
        }
      }
      const updated = dataResp as Product;
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      );
    } catch (e) {
      const message =
        (e as { message?: string })?.message || "Failed to update product";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setSaving(true);
    setError(null);
    try {
      try {
        await axios.delete(`${API_URL}/products/admin/products/${id}`, {
          withCredentials: true,
        });
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          // Fallback to alternative mount: /admin/products/:id
          await axios.delete(`${API_URL}/products/admin/${id}`, {
            withCredentials: true,
          });
        } else {
          throw e;
        }
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      const message =
        (e as { message?: string })?.message || "Failed to delete product";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-black mb-6">Products</h1>

      {error && (
        <div
          className="mb-4 p-3 rounded border"
          style={{
            background: "#FFF4F1",
            borderColor: "#FF5D39",
            color: "#FF5D39",
          }}
        >
          {error}
        </div>
      )}

      {/* Create / Edit form */}
      <div className="rounded-2xl border shadow bg-white p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black">
            {openId ? "Edit product" : "Add new product"}
          </h2>
          {openId && (
            <button
              onClick={() => {
                setOpenId(null);
                resetForm();
              }}
              className="text-sm text-black underline"
            >
              Cancel edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-black/70">Name</label>
              <input
                className="border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                placeholder="Product name"
                value={form.name || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-black/70">Price</label>
              <input
                className="border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                placeholder="0.00"
                type="number"
                value={form.price || 0}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: Number(e.target.value) }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-black/70">Stock</label>
              <input
                className="border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                placeholder="0"
                type="number"
                value={form.stock || 0}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: Number(e.target.value) }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-black/70">Category</label>
              <select
                className="border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                value={form.category || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                className="border rounded px-3 py-2 bg-white text-black mt-2 focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                placeholder="Or type new category"
                value={form.category || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-black/70">SKU</label>
              <input
                className="border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                placeholder="e.g., 3P-SWE-WAT-BERDEL-CHE"
                value={form.sku || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sku: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              {/* Image URL input removed as per instructions; already provided elsewhere */}
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm text-black/70">Description</label>
              <textarea
                className="border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                rows={3}
                placeholder="Optional description"
                value={form.description || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-black/70">Flavors (Max 3)</label>
                <button
                  type="button"
                  onClick={addFlavor}
                  disabled={(form.flavors?.length || 0) >= 3}
                  className="text-sm text-[#FF5D39] hover:underline disabled:opacity-50"
                >
                  + Add Flavor
                </button>
              </div>
              <div className="space-y-2">
                {form.flavors?.map((flavor, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <select
                      className="border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39] flex-1"
                      value={flavor.id}
                      onChange={(e) => updateFlavor(index, 'id', e.target.value)}
                    >
                      <option value="">Select flavor</option>
                      {availableFlavors.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      max="3"
                      className="border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39] w-20"
                      placeholder="Qty"
                      value={flavor.quantity}
                      onChange={(e) => updateFlavor(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                    <button
                      type="button"
                      onClick={() => removeFlavor(index)}
                      className="px-2 py-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {(!form.flavors || form.flavors.length === 0) && (
                  <div className="text-sm text-gray-500 italic">
                    No flavors added. Click &quot;Add Flavor&quot; to add up to 3 flavors.
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-white p-3 flex flex-col items-center justify-center">
              <div className="text-sm text-black/70 mb-2">Preview</div>
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt={form.name || "preview"}
                  className="w-full max-w-[260px] aspect-[4/3] object-cover rounded"
                />
              ) : form.imageUrl ? (
                <Image
                  src={form.imageUrl}
                  alt={form.name || "preview"}
                  width={240}
                  height={180}
                  className="w-full max-w-[260px] aspect-[4/3] object-cover rounded"
                />
              ) : (
                <div className="w-full max-w-[260px] aspect-[4/3] bg-gray-100 rounded" />
              )}
            </div>
            <div className="mt-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setPreview(url);
                    setForm((f) => ({ ...f, imageUrl: "" }));
                  } else {
                    setPreview(null);
                  }
                }}
                className="block text-black text-sm"
              />
            </div>
            <label className="mt-4 flex items-center gap-2 text-black">
              <input
                type="checkbox"
                checked={!!form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
              />
              Active
            </label>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            disabled={
              saving ||
              !form.name ||
              !form.category ||
              !form.sku ||
              Number(form.price || 0) <= 0 ||
              !form.flavors ||
              form.flavors.length === 0 ||
              !!openId
            }
            onClick={createProduct}
            className="px-4 py-2 rounded bg-[#FF5D39] text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add product"}
          </button>
          <button
            disabled={
              saving ||
              !openId ||
              !form.name ||
              !form.category ||
              !form.sku ||
              Number(form.price || 0) <= 0 ||
              !form.flavors ||
              form.flavors.length === 0
            }
            onClick={() => {
              if (openId) updateProduct(openId);
            }}
            className="px-4 py-2 rounded bg-[#F1A900] text-black disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            disabled={saving}
            onClick={resetForm}
            className="px-4 py-2 rounded border"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-4">
        <input
          className="border rounded px-3 py-2 bg-white text-black w-full md:w-auto"
          placeholder="Search products by name"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          className="border rounded px-3 py-2 bg-white text-black"
          value={categoryFilter}
          onChange={(e) => {
            setPage(1);
            setCategoryFilter(e.target.value);
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Products table */}
      <div className="overflow-x-auto border border-gray-200 rounded">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-black">Image</th>
              <th className="px-4 py-2 text-black">Name</th>
              <th className="px-4 py-2 text-black">Price</th>
              <th className="px-4 py-2 text-black">Category</th>
              <th className="px-4 py-2 text-black">SKU</th>
              <th className="px-4 py-2 text-black">Stock</th>
              <th className="px-4 py-2 text-black">Flavors</th>
              <th className="px-4 py-2 text-black">Active</th>
              <th className="px-4 py-2 text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {current.map((p, idx) => {
              // Use only 'id' for Product type, remove reference to '_id'
              const pid = p.id || "";
              return (
                <tr key={pid || idx} className="border-t border-gray-200">
                  <td className="px-4 py-2">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        width={64}
                        height={48}
                        className="w-16 h-12 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-16 h-12 rounded bg-gray-100 border" />
                    )}
                  </td>
                  <td className="px-4 py-2 text-black">{p.name}</td>
                  <td className="px-4 py-2 text-black">
                    ${Number(p.price || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-black">{p.category}</td>
                  <td className="px-4 py-2 text-black text-sm">{p.sku || "-"}</td>
                  <td className="px-4 py-2 text-black">{p.stock || 0}</td>
                  <td className="px-4 py-2 text-black text-sm">
                    {p.flavors?.map(f => `${f.name} (${f.quantity})`).join(", ") || "-"}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        p.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 rounded border text-white hover:opacity-90 bg-secondary"
                        onClick={() => {
                          setOpenId(pid);
                          setForm(p);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 rounded border text-white hover:opacity-90 bg-primary"
                        onClick={() => deleteProduct(pid)}
                      >
                        Delete
                      </button>
                      <button
                        className="px-3 py-1 rounded border  bg-secondary"
                        onClick={() =>
                          updateProductByRow(p as Product, {
                            isActive: !p.isActive,
                          })
                        }
                      >
                        {p.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded border text-black disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span className="text-black">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded border text-black disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      )}
      {loading && <div className="mt-4 text-black">Loading...</div>}
    </div>
  );
};

export default AddProductsPage;
