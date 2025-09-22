"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useUser } from "@/hooks/useUser";
import { useOrdersStore } from "@/store/ordersStore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import VerificationGuard from "@/components/auth/VerificationGuard";
import { useCartStore } from "@/store/cartStore";

const BLACK = "#000000";

const ProfileContent = () => {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orders, loading: ordersLoading, fetchOrders } = useOrdersStore();
  const { clearCart } = useCartStore();
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [updatingProfile] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [retryingPayment, setRetryingPayment] = useState<{
    [key: string]: boolean;
  }>({});

  // Check for payment success and clear cart
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const orderParam = searchParams.get("order");

    if (sessionId && orderParam && user) {
      // Payment was successful
      setPaymentSuccess(true);
      setOrderId(orderParam);
      setActiveTab("orders"); // Switch to orders tab to show the new order

      // Clear the cart after successful payment
      clearCart()
        .then(() => {
          console.log("Cart cleared after successful payment");
        })
        .catch((error) => {
          console.error("Failed to clear cart after payment:", error);
        });

      // Clean up URL parameters after handling
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setPaymentSuccess(false);
      }, 5000);
    }
  }, [searchParams, user, clearCart]);

  // Authentication check
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/auth/login");
      return;
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: (user as { phone?: string }).phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && !userLoading) {
      fetchOrders({ page: 1, limit: 50 }); // Increased limit to get more orders
    }
  }, [user, userLoading, fetchOrders]);

  // Refresh orders when switching to orders tab
  useEffect(() => {
    if (activeTab === "orders" && user && !userLoading) {
      fetchOrders({ page: 1, limit: 50 });
    }
  }, [activeTab, user, userLoading, fetchOrders]);

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5D39] mx-auto mb-4"></div>
          <p className="text-black text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch("/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
        }),
      });

      if (response.ok) {
        // Update the user data in the store or refetch
        setEditMode(false);
        // Optionally refresh the page or update local state
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error(
          "Profile update error:",
          errorData.message || "Failed to update profile"
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "confirmed":
        return "bg-yellow-100 text-yellow-700";
      case "pending":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStatusColor = (paymentStatus: string): string => {
    switch (paymentStatus) {
      case "completed":
      case "paid":
      case "successful":
        return "bg-green-100 text-green-700";
      case "failed":
      case "declined":
      case "error":
        return "bg-red-100 text-red-700";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-700";
      case "refunded":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleRetryPayment = async (orderIdToRetry: string) => {
    setRetryingPayment((prev) => ({ ...prev, [orderIdToRetry]: true }));

    try {
      // Create a new Stripe Checkout Session for the failed order
      const response = await fetch("/payments/retry-payment", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderIdToRetry,
          successUrl: `${window.location.origin}/profile?order=${orderIdToRetry}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/profile`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create retry payment session");
      }

      const data = await response.json();

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("Invalid checkout session");
      }
    } catch (error) {
      console.error("Payment retry failed:", error);
      alert(
        "Unable to retry payment. Please contact support or try again later."
      );
    } finally {
      setRetryingPayment((prev) => ({ ...prev, [orderIdToRetry]: false }));
    }
  };

  return (
    <VerificationGuard>
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Payment Success Notification */}
          {paymentSuccess && (
            <div className="mb-6 p-4 rounded-xl shadow-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-bold text-green-800">
                    Payment Successful! 🎉
                  </h3>
                  <p className="text-sm text-green-700">
                    Your order has been confirmed and your cart has been
                    cleared.
                    {orderId && (
                      <span className="block mt-1">
                        Order ID:{" "}
                        <span className="font-mono font-semibold">
                          {orderId.slice(0, 8).toUpperCase()}
                        </span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Issues Alert */}
          {orders.some((order) => order.paymentStatus === "failed") && (
            <div className="mb-6 p-4 rounded-xl shadow-lg border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-bold text-red-800">
                    Payment Issue Detected ⚠️
                  </h3>
                  <p className="text-sm text-red-700">
                    One or more of your orders has a payment issue. You can
                    retry the payment using the &quot;Retry Payment&quot; button
                    next to the failed order, or contact support if you need
                    assistance.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      View Failed Orders
                    </button>
                    <a
                      href="mailto:support@licorice4good.com"
                      className="px-4 py-2 bg-white text-red-600 border border-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Contact Support
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pending Payments Alert */}
          {orders.some((order) => order.paymentStatus === "pending") && (
            <div className="mb-6 p-4 rounded-xl shadow-lg border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-yellow-600 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-bold text-yellow-800">
                    Payment Processing 🔄
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Some of your payments are still being processed. This may
                    take a few minutes to complete.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#FF5D39] to-[#F1A900] bg-clip-text text-transparent">
              My Account
            </h1>
            <p className="text-lg" style={{ color: BLACK, opacity: 0.7 }}>
              Manage your profile and view your order history
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            {[
              { id: "profile", label: "Profile", icon: "👤" },
              { id: "orders", label: "Order History", icon: "📦" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "profile" | "orders")}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-[#FF5D39] text-[#FF5D39]"
                    : "text-gray-500 hover:text-[#FF5D39]"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl shadow-lg border p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">
                  Profile Information
                </h2>
                {/* <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 rounded-lg border border-[#FF5D39] text-[#FF5D39] hover:bg-[#FF5D39] hover:text-white transition-colors cursor-pointer"
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button> */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-black">
                    Name
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5D39] text-black"
                    />
                  ) : (
                    <p className="text-black">{user.name || "Not provided"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-black">
                    Email
                  </label>
                  <p className="text-black">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-black">
                    Phone
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5D39] text-black"
                    />
                  ) : (
                    <p className="text-black">
                      {(user as { phone?: string }).phone || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-black">
                    Member Since
                  </label>
                  <p className="text-black">Unknown</p>
                </div>
              </div>

              {editMode && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={updatingProfile}
                    className="px-6 py-2 bg-[#FF5D39] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {updatingProfile ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-6 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-2xl shadow-lg border p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black">
                    Order History
                  </h2>
                  <span className="block sm:inline text-sm text-gray-600 mt-1 sm:mt-0 sm:ml-2">
                    {orders.length} order{orders.length !== 1 ? "s" : ""} found
                  </span>
                </div>
                <button
                  onClick={() => fetchOrders({ page: 1, limit: 50 })}
                  disabled={ordersLoading}
                  className="w-full sm:w-auto px-4 py-2 bg-[#FF5D39] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {ordersLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {ordersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5D39] mx-auto mb-4"></div>
                  <p className="text-black">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold mb-2 text-black">
                    No orders yet
                  </h3>
                  <p className="text-black opacity-70 mb-6">
                    Start shopping to see your order history here.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-block bg-[#FF5D39] text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:opacity-90 transition-all"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-black">
                            Order #{order.id?.slice(0, 8) || "Unknown"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : "Date not available"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex flex-col gap-1 items-end">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(
                                order.status || "pending"
                              )}`}
                            >
                              {order.status || "pending"}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded ${getPaymentStatusColor(
                                order.paymentStatus || "pending"
                              )}`}
                            >
                              Payment: {order.paymentStatus || "pending"}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-[#FF5D39] mt-1">
                            ${order.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {order.orderItems?.length || 0} item
                          {order.orderItems?.length !== 1 ? "s" : ""}
                        </p>
                        {/* Payment Status Alerts */}
                        {order.paymentStatus === "failed" && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                            <span>Payment failed</span>
                            <button
                              onClick={() =>
                                order.id && handleRetryPayment(order.id)
                              }
                              disabled={!order.id || retryingPayment[order.id]}
                              className="ml-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {order.id && retryingPayment[order.id] ? (
                                <div className="flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Retrying...
                                </div>
                              ) : (
                                "Retry Payment"
                              )}
                            </button>
                          </div>
                        )}
                        {order.paymentStatus === "pending" && (
                          <div className="flex items-center text-yellow-600 text-sm">
                            <svg
                              className="w-4 h-4 mr-1 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Payment processing...
                          </div>
                        )}
                        {(order.paymentStatus === "completed" ||
                          order.paymentStatus === "paid") && (
                          <div className="flex items-center text-green-600 text-sm">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Payment confirmed
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </VerificationGuard>
  );
};

const ProfilePage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5D39] mx-auto mb-4"></div>
            <p className="text-black text-lg">Loading profile...</p>
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
};

export default ProfilePage;
