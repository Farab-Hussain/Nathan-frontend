"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProductsStore } from "@/store/productsStore";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingCart, Tag } from "lucide-react";

const shimmer =
  "before:absolute before:inset-0 before:animate-pulse before:bg-gradient-to-r before:from-gray-200 before:via-gray-100 before:to-gray-200";

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params?.id[0]
      : "";
  const { product, loading, error, fetchProductById, clearProduct } =
    useProductsStore();
  const { addToCart, loading: cartLoading, error: cartError } = useCartStore();

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) fetchProductById(id).catch(() => {});
    return () => clearProduct();
  }, [id, fetchProductById, clearProduct]);

  const handleAdd = async () => {
    if (!product) return;
    try {
      await addToCart({
        productId: product.id,
        title: product.name,
        imageUrl: product.imageUrl ?? undefined,
        quantity,
        total: product.price * quantity,
      });
      router.push("/cart");
    } catch {
      // handled in store
    }
  };

  if (loading)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="rounded-lg overflow-hidden border border-gray-200 h-96 bg-gray-100" />
          <div>
            <div className="h-10 bg-gray-200 rounded w-2/3 mb-4" />
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
            <div className="h-24 bg-gray-200 rounded w-full mb-6" />
            <div className="h-12 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-red-500 flex items-center gap-2">
        <Tag className="text-xl" />
        {error}
      </div>
    );
  if (!product)
    return (
      <div className="p-6 text-black flex items-center gap-2">
        <Tag className="text-xl" />
        Product not found.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm mb-6 flex items-center gap-2 text-gray-500">
        <Link href="/shop" className="hover:underline flex items-center gap-1">
          <ChevronLeft className="inline-block mr-1" />
          Shop
        </Link>
        <span className="mx-1 text-gray-400">/</span>
        <span className="text-black font-semibold">{product.name}</span>
      </nav>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-2xl shadow-lg p-6 md:p-10">
        <div className="relative">
          <div className="rounded-2xl overflow-hidden border-2 border-gray-100 shadow-md bg-white relative group">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={1000}
                height={750}
                className="w-full h-[28rem] object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 600px"
                priority
              />
            ) : (
              <div className="w-full h-[28rem] bg-gray-100 flex items-center justify-center text-4xl text-gray-300">
                <Tag />
              </div>
            )}
            <span className="absolute top-4 left-4 bg-primary/90 text-white text-xs px-3 py-1 rounded-full shadow font-semibold flex items-center gap-1">
              <Tag className="mr-1" />
              {product.category}
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-black mb-3 flex items-center gap-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block bg-gray-100 text-primary font-semibold px-3 py-1 rounded-full text-xs uppercase tracking-wide">
                {product.category}
              </span>
              <span className="inline-block bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full text-xs">
                In Stock
              </span>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-3xl text-primary font-bold">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-gray-400 line-through text-lg">
                ${(product.price * 1.2).toFixed(2)}
              </span>
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-semibold">
                20% OFF
              </span>
            </div>
            {product.description && (
              <p className="text-gray-700 mb-8 whitespace-pre-line leading-relaxed text-lg">
                {product.description}
              </p>
            )}
          </div>
          <div>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-black font-medium">Quantity</span>
              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <button
                  type="button"
                  className="px-4 py-2 text-xl text-primary hover:bg-gray-100 transition"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <ChevronLeft />
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-16 text-center text-black bg-white focus:outline-none text-lg font-semibold"
                />
                <button
                  type="button"
                  className="px-4 py-2 text-xl text-primary hover:bg-gray-100 transition"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
            {cartError && (
              <div className="text-red-500 mb-4 text-sm font-semibold">
                {cartError}
              </div>
            )}
            <button
              onClick={handleAdd}
              disabled={cartLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-orange-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:from-orange-500 hover:to-primary transition-all text-lg disabled:opacity-60"
            >
              <ShoppingCart className="text-xl" />
              {cartLoading ? "Adding..." : "Add to cart"}
            </button>
            <div className="mt-6 flex flex-col gap-2 text-xs text-gray-500">
              <div>
                <span className="font-semibold text-green-600">✓</span> Free
                shipping on orders over $50
              </div>
              <div>
                <span className="font-semibold text-green-600">✓</span> 30-day
                money-back guarantee
              </div>
              <div>
                <span className="font-semibold text-green-600">✓</span> Secure
                checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
