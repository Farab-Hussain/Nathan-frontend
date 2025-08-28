"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useProductsStore } from "@/store/productsStore";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import Image from "next/image";
import CustomButton from "@/components/custom/CustomButton";
import { useRouter } from "next/navigation";

const ORANGE = "#FF5D39";
const YELLOW = "#F1A900";
// const WHITE = "#fff";
const BLACK = "#000";

const ShopPage = () => {
  const {
    products,
    categories,
    pagination,
    loading,
    error,
    fetchProducts,
    fetchCategories,
  } = useProductsStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [sort, setSort] = useState<"relevance" | "price-asc" | "price-desc">(
    "relevance"
  );
  const { addToCart } = useCartStore();
  const [addingId, setAddingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCategories().catch(() => {});
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts({
      search: search.trim() || undefined,
      category: category || undefined,
      page,
      limit: 12,
    }).catch(() => {});
  }, [fetchProducts, search, category, page]);

  const totalPages = useMemo(() => pagination?.pages ?? 1, [pagination]);

  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === "price-asc") return list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, sort]);

  const quickAdd = async (p: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
  }) => {
    try {
      setAddingId(p.id);
      await addToCart({
        productId: p.id,
        title: p.name,
        imageUrl: p.imageUrl ?? undefined,
        quantity: 1,
        total: p.price,
      });
      // Redirect to cart after adding
      router.push("/cart");
    } catch {
      // handled in store
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <span
          className="inline-block w-2 h-8 rounded bg-[#FF5D39]"
          aria-hidden
        />
        <h1
          className="text-3xl font-extrabold tracking-tight"
          style={{ color: BLACK, letterSpacing: 0.5 }}
        >
          Shop
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center mb-8">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search products..."
          className="border border-[#FF5D39] focus:border-[#F1A900] rounded-lg px-4 py-2 text-black bg-white w-full md:w-1/2 shadow-sm transition-all"
        />
        <select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
          className="border border-[#FF5D39] focus:border-[#F1A900] rounded-lg px-4 py-2 text-black bg-white w-full md:w-1/3 shadow-sm transition-all"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as "relevance" | "price-asc" | "price-desc")
          }
          className="border border-[#FF5D39] focus:border-[#F1A900] rounded-lg px-4 py-2 text-black bg-white w-full md:w-1/4 shadow-sm transition-all"
          aria-label="Sort products"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-lg"
          style={{
            background: `${ORANGE}10`,
            border: `1px solid ${ORANGE}40`,
            color: ORANGE,
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse border-2 border-[#FF5D39] rounded-xl overflow-hidden bg-white shadow"
            >
              <div className="w-full h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto h-24 w-24 mb-4 flex items-center justify-center rounded-full border-4 border-[#FF5D39] bg-white">
            <svg fill="none" viewBox="0 0 24 24" stroke={BLACK} className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: BLACK }}>
            No products found
          </h3>
          <p className="mb-6" style={{ color: BLACK, opacity: 0.7 }}>
            Try adjusting your search or filter to find what you need.
          </p>
          <CustomButton
            title="Back to All"
            className="bg-[#FF5D39] hover:bg-[#F1A900] text-white font-bold rounded-lg px-6 py-3"
            onClick={() => {
              setSearch("");
              setCategory("");
              setPage(1);
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {sorted.map((p) => (
          <div
            key={p.id}
            className="group rounded-2xl overflow-hidden bg-white border border-[#FF5D39]/30 hover:border-[#FF5D39] shadow transition-all"
          >
            <div className="relative">
              <Link href={`/shop/${p.id}`} className="block">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    width={800}
                    height={600}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="w-full aspect-[4/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] bg-gray-100" />
                )}
              </Link>
              <span
                className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: YELLOW, color: BLACK, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
              >
                {p.category}
              </span>
            </div>
            <div className="p-4 space-y-2">
              <Link href={`/shop/${p.id}`} className="block">
                <div className="text-black font-bold text-lg truncate group-hover:underline">
                  {p.name}
                </div>
              </Link>
              <div className="flex items-center justify-between">
                <div className="text-[#FF5D39] font-semibold text-xl">${p.price.toFixed(2)}</div>
                <CustomButton
                  title={addingId === p.id ? "Adding..." : "Add to cart"}
                  className="!bg-[#FF5D39] hover:!bg-[#F1A900] !text-white text-xs font-bold px-4 py-2 rounded-lg shadow"
                  onClick={() => quickAdd(p)}
                  disabled={addingId === p.id}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <CustomButton
            title="Prev"
            className="px-5 py-2 rounded-lg border-2 border-[#FF5D39] text-black font-bold bg-white hover:bg-[#FF5D39] hover:text-white transition-all disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          />
          <span className="text-black font-semibold text-lg">
            Page {page} of {totalPages}
          </span>
          <CustomButton
            title="Next"
            className="px-5 py-2 rounded-lg border-2 border-[#FF5D39] text-black font-bold bg-white hover:bg-[#FF5D39] hover:text-white transition-all disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          />
        </div>
      )}
    </div>
  );
};

export default ShopPage;