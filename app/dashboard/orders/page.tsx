"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useUser } from "@/hooks/useUser";

type Order = {
  id: string;
  userId: string;
  status: string;
  paymentStatus: string;
  total: number;
};

type Pagination = { pages: number };

const AdminOrdersPage = () => {
  const { user, loading: userLoading } = useUser();
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminPagination, setAdminPagination] = useState<Pagination | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!userLoading && user?.role !== "admin") {
      if (typeof window !== "undefined") window.location.href = "/";
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get<{
          orders: Order[];
          pagination?: Pagination;
        }>(`${API_URL}/orders/admin/all`, {
          withCredentials: true,
          signal: controller.signal,
          params: {
            status: status || undefined,
            paymentStatus: paymentStatus || undefined,
            page,
            limit: 10,
          },
        });
        setAdminOrders(Array.isArray(data.orders) ? data.orders : []);
        setAdminPagination(data.pagination ?? { pages: 1 });
      } catch (e) {
        if (axios.isCancel(e)) return;
        const message =
          (e as { message?: string })?.message || "Failed to load orders";
        setError(message);
        setAdminOrders([]);
        setAdminPagination({ pages: 1 });
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [user, status, paymentStatus, page]);

  const adminUpdateStatus = async (
    id: string,
    payload: { status?: string; paymentStatus?: string }
  ) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      await axios.put(`${API_URL}/orders/${id}/status`, payload, {
        withCredentials: true,
      });
      setAdminOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...payload } : o))
      );
    } catch (e) {
      const message =
        (e as { message?: string })?.message || "Failed to update order";
      setError(message);
    }
  };

  const totalPages = useMemo(
    () => adminPagination?.pages ?? 1,
    [adminPagination]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-black mb-6">Admin Orders</h1>

      <div className="flex flex-wrap items-center gap-3 mb-6">
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
        <select
          value={paymentStatus}
          onChange={(e) => {
            setPage(1);
            setPaymentStatus(e.target.value);
          }}
          className="border border-gray-300 rounded px-3 py-2 text-black bg-white"
        >
          <option value="">All payments</option>
          <option value="pending">pending</option>
          <option value="paid">paid</option>
          <option value="failed">failed</option>
        </select>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div className="text-black">Loading...</div>}

      <div className="overflow-x-auto border border-gray-200 rounded">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-black">Order</th>
              <th className="px-4 py-2 text-black">User</th>
              <th className="px-4 py-2 text-black">Status</th>
              <th className="px-4 py-2 text-black">Payment</th>
              <th className="px-4 py-2 text-black">Total</th>
              <th className="px-4 py-2 text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminOrders.map((o) => (
              <tr key={o.id} className="border-t border-gray-200">
                <td className="px-4 py-2 text-black">{o.id.slice(0, 8)}</td>
                <td className="px-4 py-2 text-black">{o.userId}</td>
                <td className="px-4 py-2 text-black">{o.status}</td>
                <td className="px-4 py-2 text-black">{o.paymentStatus}</td>
                <td className="px-4 py-2 text-black">${o.total.toFixed(2)}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue={o.status}
                      onChange={(e) =>
                        adminUpdateStatus(o.id, { status: e.target.value })
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-black bg-white"
                    >
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                    <select
                      defaultValue={o.paymentStatus}
                      onChange={(e) =>
                        adminUpdateStatus(o.id, {
                          paymentStatus: e.target.value,
                        })
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-black bg-white"
                    >
                      <option value="pending">pending</option>
                      <option value="paid">paid</option>
                      <option value="failed">failed</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded border border-gray-300 text-black disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span className="text-black">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded border border-gray-300 text-black disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
