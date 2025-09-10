"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { useOrdersStore } from "@/store/ordersStore";

const ORANGE = "#FF5D39";
const YELLOW = "#F1A900";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

const CartPage = () => {
  const {
    items,
    loading,
    error,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
    loadFromBackend,
  } = useCartStore();

  const { createOrder } = useOrdersStore();
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [clearCartLoading, setClearCartLoading] = useState<boolean>(false);
  const [notes, setNotes] = useState("");
  const [shipping] = useState({
    name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postal: "",
    country: "US",
  });

  useEffect(() => {
    loadFromBackend();
  }, [loadFromBackend]);

  const handleQuantity = async (itemId: string, quantity: number) => {
    await updateQuantity(itemId, quantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItem(itemId);
  };

  const handleClearCart = async () => {
    setClearCartLoading(true);
    try {
      await clearCart();
    } finally {
      setClearCartLoading(false);
    }
  };

  const checkout = async () => {
    setOrderError(null);
    try {
      setOrderLoading(true);

      console.log("=== CHECKOUT DEBUG ===");
      console.log("Cart items count:", items.length);
      console.log("Cart items:", items);
      console.log(
        "Product IDs in cart:",
        items.map((item) => item.productId)
      );
      console.log("Total:", getTotal());

      if (items.length === 0) {
        throw new Error("Cart is empty");
      }

      // Enhanced product verification with detailed logging
      try {
        const productIds = items.map((item) => item.productId);
        console.log("🔍 Verifying products exist in backend:", productIds);

        // Check if products exist by fetching them from backend
        const response = await fetch("/api/products", {
          credentials: "include"
        });
        console.log("📡 API Response status:", response.status);

        if (response.ok) {
          const products = await response.json();
          console.log("📦 Backend products response:", products);

          const availableProductIds = Array.isArray(products)
            ? products.map((p: { id: string }) => p.id)
            : products.products?.map((p: { id: string }) => p.id) || [];

          console.log(
            "✅ Available product IDs in backend:",
            availableProductIds
          );

          const missingProducts = productIds.filter(
            (id) => !availableProductIds.includes(id)
          );
          if (missingProducts.length > 0) {
            console.error("❌ Missing products in backend:", missingProducts);
            throw new Error(
              `Products not found in backend: ${missingProducts.join(", ")}`
            );
          } else {
            console.log("✅ All products verified in backend");
          }
        } else {
          console.warn(
            "⚠️ API response not OK:",
            response.status,
            response.statusText
          );
        }
      } catch (verifyError) {
        console.warn("⚠️ Could not verify products with backend:", verifyError);
        // Continue anyway - backend will handle validation
      }

      // Try the format that matches the backend database
      const orderData = {
        orderItems: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        total: getTotal(),
        // Add any additional fields the backend might expect
        status: "pending" as const,
        notes: notes || "",
        shippingAddress: {
          name: shipping.name,
          email: shipping.email,
          phone: shipping.phone,
          address1: shipping.address1,
          address2: shipping.address2,
          city: shipping.city,
          state: shipping.state,
          postal: shipping.postal,
          country: shipping.country,
        },
      };

      console.log("Sending order data:", orderData);
      console.log("Order items structure:", orderData.orderItems);

      // Fix: shippingAddress should be a string, not an object
      const orderDataForBackend = {
        ...orderData,
        shippingAddress: [
          orderData.shippingAddress.name,
          orderData.shippingAddress.email,
          orderData.shippingAddress.phone,
          orderData.shippingAddress.address1,
          orderData.shippingAddress.address2,
          orderData.shippingAddress.city,
          orderData.shippingAddress.state,
          orderData.shippingAddress.postal,
          orderData.shippingAddress.country,
        ]
          .filter(Boolean)
          .join(", "),
      };

      const created = await createOrder(orderDataForBackend);
      if (!created) throw new Error("Failed to create order");

      // Create Stripe Checkout Session
      const resp = await fetch("/payments/create-checkout-session", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: created.id,
          items: orderData.orderItems,
          customerEmail: shipping.email || undefined,
          shippingAddress: orderData.shippingAddress,
          successUrl: `${window.location.origin}/profile?order=${created.id}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/cart`,
        }),
       });
      if (!resp.ok) throw new Error("Unable to start checkout");
      const data = await resp.json();
      if (!data?.url) throw new Error("Invalid checkout session");
      window.location.href = data.url;
    } catch (e: unknown) {
      const message =
        (e as { message?: string })?.message || "Failed to place order";
      setOrderError(message);
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-[#FF5D39] to-[#F1A900] bg-clip-text text-transparent">
            Your Shopping Cart
          </h1>
          <p
            className="text-base sm:text-lg"
            style={{ color: BLACK, opacity: 0.7 }}
          >
            Review your items and complete your purchase
          </p>
        </div>

        {/* Error and Loading States */}
        {error && (
          <div
            className="mb-6 p-4 rounded-xl shadow-sm"
            style={{
              background: `${ORANGE}10`,
              border: `1px solid ${ORANGE}40`,
            }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill={ORANGE}>
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm" style={{ color: ORANGE }}>
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-16 sm:py-20">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: ORANGE }}
            ></div>
            <span
              className="ml-3 text-lg"
              style={{ color: BLACK, opacity: 0.7 }}
            >
              Loading your cart...
            </span>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <div
              className="mx-auto h-20 w-20 sm:h-24 sm:w-24 mb-4"
              style={{ color: "#E5E5E5" }}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke={BLACK}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                />
              </svg>
            </div>
            <h3
              className="text-lg sm:text-xl font-semibold mb-2"
              style={{ color: BLACK }}
            >
              Your cart is empty
            </h3>
            <p
              className="mb-6 text-sm sm:text-base"
              style={{ color: BLACK, opacity: 0.7 }}
            >
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <button
              className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg"
              style={{
                background: ORANGE,
                color: WHITE,
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = YELLOW)}
              onMouseOut={(e) => (e.currentTarget.style.background = ORANGE)}
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* Cart Items */}
        {items.length > 0 && (
          <div className="space-y-4 sm:space-y-6 mb-8">
            {items.map((item) => {
              const unit = item.price;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300"
                  style={{
                    background: WHITE,
                    borderColor: "#F3F3F3",
                  }}
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.imageUrl ? (
                        <div className="relative">
                          <Image
                            src={item.imageUrl}
                            alt={item.productName}
                            width={120}
                            height={120}
                            className="w-30 h-30 object-cover rounded-xl shadow-md"
                          />
                          <div
                            className="absolute inset-0 rounded-xl"
                            style={{
                              background:
                                "linear-gradient(to top, rgba(0,0,0,0.08), transparent)",
                            }}
                          ></div>
                        </div>
                      ) : (
                        <div
                          className="w-30 h-30 rounded-xl flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, #F3F3F3 0%, #E5E5E5 100%)`,
                          }}
                        >
                          <svg
                            className="w-12 h-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke={BLACK}
                            style={{ opacity: 0.3 }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      {/* Header with title and remove button */}
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <h3
                          className="text-lg sm:text-xl font-semibold flex-1"
                          style={{ color: BLACK }}
                        >
                          {item.productName}
                        </h3>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="flex-shrink-0 p-2 rounded-full transition-colors duration-200"
                          style={{
                            color: BLACK,
                            background: "transparent",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = `${ORANGE}10`;
                            e.currentTarget.style.color = ORANGE;
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = BLACK;
                          }}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Price - separate row on mobile */}
                      <div className="mb-4">
                        <p
                          className="text-base sm:text-lg font-medium"
                          style={{ color: ORANGE }}
                        >
                          ${unit.toFixed(2)} each
                        </p>
                      </div>

                      {/* Quantity Controls and Total - separate rows on mobile */}
                      <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 sm:gap-4">
                        {/* Quantity Controls */}
                        <div
                          className="flex items-center rounded-xl p-1 w-fit"
                          style={{ background: "#F8F8F8" }}
                        >
                          <button
                            type="button"
                            className="p-2 rounded-lg transition-all duration-200"
                            style={{
                              color: BLACK,
                              background: "transparent",
                            }}
                            onClick={() =>
                              handleQuantity(
                                item.id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            aria-label="Decrease quantity"
                            onMouseOver={(e) =>
                              (e.currentTarget.style.color = ORANGE)
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.color = BLACK)
                            }
                          >
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 12H4"
                              />
                            </svg>
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity || 1}
                            onChange={(e) =>
                              handleQuantity(
                                item.id,
                                Number(e.target.value) || 1
                              )
                            }
                            className="w-14 sm:w-16 text-center font-medium text-sm sm:text-base"
                            style={{
                              color: BLACK,
                              background: "transparent",
                              outline: "none",
                            }}
                          />
                          <button
                            type="button"
                            className="p-2 rounded-lg transition-all duration-200"
                            style={{
                              color: BLACK,
                              background: "transparent",
                            }}
                            onClick={() =>
                              handleQuantity(item.id, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                            onMouseOver={(e) =>
                              (e.currentTarget.style.color = ORANGE)
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.color = BLACK)
                            }
                          >
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Total - separate row on mobile, inline on desktop */}
                        <div className="sm:ml-auto">
                          <span
                            className="text-xl sm:text-2xl font-bold"
                            style={{ color: BLACK }}
                          >
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Checkout Section */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              <div
                className="rounded-2xl shadow-lg border p-4 sm:p-6"
                style={{
                  background: WHITE,
                  borderColor: "#F3F3F3",
                }}
              >
                <h2
                  className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center"
                  style={{ color: BLACK }}
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={ORANGE}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Order Details
                </h2>

                <div className="space-y-6">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: BLACK, opacity: 0.8 }}
                    >
                      Order Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
                      style={{
                        border: `1px solid #E5E5E5`,
                        color: BLACK,
                        background: WHITE,
                        transition: "border 0.2s, box-shadow 0.2s",
                        outline: "none",
                      }}
                      rows={3}
                      placeholder="Any special instructions for your order..."
                      onFocus={(e) =>
                        (e.currentTarget.style.border = `1.5px solid ${ORANGE}`)
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.border = `1px solid #E5E5E5`)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className="rounded-2xl shadow-lg border p-4 sm:p-6 sticky top-4 sm:top-6"
                style={{
                  background: WHITE,
                  borderColor: "#F3F3F3",
                }}
              >
                <h2
                  className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center"
                  style={{ color: BLACK }}
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={YELLOW}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 00-2 2z"
                    />
                  </svg>
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div
                    className="flex justify-between items-center py-2.5 sm:py-3"
                    style={{ borderBottom: "1px solid #F3F3F3" }}
                  >
                    <span style={{ color: BLACK, opacity: 0.7 }}>Subtotal</span>
                    <span
                      className="text-lg sm:text-xl font-bold"
                      style={{ color: BLACK }}
                    >
                      ${getTotal().toFixed(2)}
                    </span>
                  </div>
                  <div
                    className="flex justify-between items-center py-2.5 sm:py-3"
                    style={{ borderBottom: "1px solid #F3F3F3" }}
                  >
                    <span style={{ color: BLACK, opacity: 0.7 }}>Shipping</span>
                    <span style={{ color: BLACK }}>Free</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 sm:py-3">
                    <span
                      className="text-base sm:text-lg font-semibold"
                      style={{ color: BLACK }}
                    >
                      Total
                    </span>
                    <span
                      className="text-xl sm:text-2xl font-bold"
                      style={{ color: ORANGE }}
                    >
                      ${getTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {orderError && (
                  <div
                    className="mb-4 p-3 rounded-lg"
                    style={{
                      background: `${ORANGE}10`,
                      border: `1px solid ${ORANGE}40`,
                    }}
                  >
                    <p className="text-sm" style={{ color: ORANGE }}>
                      {orderError}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={checkout}
                    disabled={orderLoading}
                    className="w-full font-semibold py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
                    style={{
                      background: `linear-gradient(90deg, ${ORANGE}, ${YELLOW})`,
                      color: WHITE,
                      border: "none",
                    }}
                  >
                    {orderLoading ? (
                      <div className="flex items-center justify-center">
                        <div
                          className="animate-spin rounded-full h-5 w-5 border-b-2 mr-2"
                          style={{ borderColor: WHITE }}
                        ></div>
                        Placing Order...
                      </div>
                    ) : (
                      "Complete Purchase"
                    )}
                  </button>

                  <button
                    onClick={handleClearCart}
                    disabled={clearCartLoading}
                    className="w-full font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      border: `2px solid ${ORANGE}`,
                      color: ORANGE,
                      background: WHITE,
                    }}
                    onMouseOver={(e) => {
                      if (!clearCartLoading) {
                        e.currentTarget.style.background = `${ORANGE}10`;
                        e.currentTarget.style.borderColor = YELLOW;
                        e.currentTarget.style.color = YELLOW;
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = WHITE;
                      e.currentTarget.style.borderColor = ORANGE;
                      e.currentTarget.style.color = ORANGE;
                    }}
                  >
                    {clearCartLoading ? (
                      <div className="flex items-center justify-center">
                        <div
                          className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2"
                          style={{ borderColor: ORANGE }}
                        ></div>
                        Clearing...
                      </div>
                    ) : (
                      "Clear Cart"
                    )}
                  </button>
                </div>

                <div
                  className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg"
                  style={{
                    background: `${YELLOW}10`,
                  }}
                >
                  <div className="flex items-start">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke={YELLOW}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p
                      className="text-xs sm:text-sm"
                      style={{ color: BLACK, opacity: 0.8 }}
                    >
                      Secure checkout powered by industry-standard encryption.
                      Your payment information is protected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
