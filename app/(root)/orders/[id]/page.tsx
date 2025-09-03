'use client'
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useOrdersStore } from '@/store/ordersStore';
import Image from 'next/image';

// Reusable Badge component
const Badge = ({ children, color = "#FF5D39", className = "" }: { children: React.ReactNode, color?: string, className?: string }) => (
  <span
    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${className}`}
    style={{ background: color, color: color === "#FF5D39" ? "white" : "black" }}
  >
    {children}
  </span>
);

// Reusable Card component
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`rounded-xl shadow-lg bg-white border-2 border-[#F1A900] p-6 ${className}`}>
    {children}
  </div>
);

// Define a type for the order item
type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  total: number;
};

// Reusable OrderItemCard
const OrderItemCard = ({ item }: { item: OrderItem }) => (
  <div className="flex items-center gap-4 bg-[#FFF7F4] rounded-lg p-3 border border-[#FF5D39]">
    {item.imageUrl ? (
      <Image
        src={item.imageUrl}
        alt={item.productName}
        width={64}
        height={64}
        className="w-16 h-16 object-cover rounded-lg border-2 border-[#F1A900]"
      />
    ) : (
      <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-[#F1A900]" />
    )}
    <div className="flex-1">
      <div className="font-bold text-black">{item.productName}</div>
      <div className="text-sm text-[#FF5D39] font-semibold">{item.quantity} × ${item.price.toFixed(2)}</div>
    </div>
    <div className="text-lg font-bold text-[#F1A900]">${item.total.toFixed(2)}</div>
  </div>
);

const OrderDetailPage = () => {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params?.id[0] : '';
  const { order, loading, error, fetchOrderById, clearOrder } = useOrdersStore();

  useEffect(() => {
    if (id) fetchOrderById(id).catch(() => {});
    return () => clearOrder();
  }, [id, fetchOrderById, clearOrder]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#FF5D39] border-b-4 " />
        <span className="ml-4 text-black font-semibold text-lg">Loading...</span>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Badge color="#FF5D39" className="text-base">{error}</Badge>
      </div>
    );
  if (!order)
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Badge color="#F1A900" className="text-base">Order not found.</Badge>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Card className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <h1 className="text-3xl font-extrabold text-[#FF5D39] tracking-tight">
            Order <span className="text-black">#{order.id.slice(0, 8)}</span>
          </h1>
          <div className="flex gap-2">
            <Badge color="#FF5D39">{order.status}</Badge>
            <Badge color="#F1A900">{order.paymentStatus}</Badge>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-black">Total</span>
          <span className="text-2xl font-bold text-[#F1A900]">${order.total.toFixed(2)}</span>
        </div>
        {order.orderNotes && (
          <div className="mb-4">
            <span className="font-semibold text-black">Notes: </span>
            <span className="text-[#FF5D39]">{order.orderNotes}</span>
          </div>
        )}
        <div>
          <div className="text-lg font-bold text-black mb-2">Items</div>
          <div className="space-y-3">
            {order.orderItems.map((it) => (
              <OrderItemCard
                key={it.id}
                item={{
                  ...it,
                  total: it.quantity * it.price,
                }}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderDetailPage;