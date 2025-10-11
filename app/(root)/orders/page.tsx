"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useOrdersStore } from "@/store/ordersStore";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import Link from "next/link";

const OrdersPage = () => {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { orders, pagination, loading, error, fetchOrders } = useOrdersStore();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  // Removed authentication redirect - show message instead

  useEffect(() => {
    if (user) {
      fetchOrders({ status: status || undefined, page, limit: 10 }).catch(
        () => {}
      );
    }
  }, [fetchOrders, status, page, user]);

  const totalPages = useMemo(() => pagination?.pages ?? 1, [pagination]);
  const safeOrders = Array.isArray(orders) ? orders : [];

  // Show message if not authenticated (no redirect)
  if (!userLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order History</h2>
          <p className="text-gray-600 mb-6">
            Login to view your order history and track your purchases.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
            >
              Login to View Orders
            </button>
            <button
              onClick={() => router.push("/shop")}
              className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-black mb-6">My Orders</h1>

      <div className="flex items-center gap-3 mb-6">
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="border border-gray-300 rounded px-3 py-2 text-black bg-white"
        >
          <option value="">All statuses</option>
          <option value="pending">pending</option>
          <option value="confirmed">confirmed</option>
          <option value="shipped">shipped</option>
          <option value="delivered">delivered</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div className="text-black">Loading...</div>}
      {!loading && safeOrders.length === 0 && (
        <div className="text-black">No orders found.</div>
      )}

      <div className="space-y-4">
        {safeOrders.map((o) => {
          const itemsCount = Array.isArray(o.orderItems)
            ? o.orderItems.length
            : 0;
          const totalVal = Number(o.total || 0);
          const idShort = typeof o.id === "string" ? o.id.slice(0, 8) : "";
          return (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="block border border-gray-200 rounded p-4 hover:shadow"
            >
              <div className="flex justify-between">
                <div className="text-black font-semibold">Order #{idShort}</div>
                <div className="text-gray-700">
                  {o.status} / {o.paymentStatus}
                </div>
              </div>
              <div className="text-black mt-2">
                Total: ${totalVal.toFixed(2)}
              </div>
              <div className="text-gray-600 mt-2">Items: {itemsCount}</div>
              
              {/* Shipping Information */}
              {o.trackingNumber && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Tracking Information</p>
                      <p className="text-sm text-blue-700">
                        {o.shippingCarrier} - {o.shippingService}
                      </p>
                      <p className="text-xs text-blue-600">
                        Status: {o.shippingStatus || 'Unknown'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-600">Tracking #</p>
                      <p className="text-sm font-mono text-blue-800">{o.trackingNumber}</p>
                      {o.trackingUrl && (
                        <a 
                          href={o.trackingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Track Package
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Shipping Cost */}
              {o.shippingCost && o.shippingCost > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  Shipping: ${o.shippingCost.toFixed(2)}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Showing {orders.length} orders
            {pagination && (
              <span> (Page {pagination.page} of {pagination.pages})</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="px-3 py-2 rounded border border-gray-300 text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              First
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-2 rounded border border-gray-300 text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              if (pageNum <= totalPages) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 rounded border cursor-pointer ${
                      pageNum === page
                        ? "bg-[#FF5D39] text-white border-[#FF5D39]"
                        : "border-gray-300 text-black hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 rounded border border-gray-300 text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="px-3 py-2 rounded border border-gray-300 text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
