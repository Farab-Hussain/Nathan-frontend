'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useOrdersStore } from '@/store/ordersStore';
import Image from 'next/image';

const ORANGE = '#FF5D39';
const YELLOW = '#F1A900';
const WHITE = '#FFFFFF';
const BLACK = '#000000';

const CartPage = () => {
  const { items, loading, error, fetchCart, updateItem, removeItem, clearCart } = useCartStore();
  const { createOrder, loading: orderLoading, error: orderError } = useOrdersStore();
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetchCart().catch(() => {});
  }, [fetchCart]);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + (i.total || 0), 0), [items]);

  const handleQuantity = async (id: string, quantity: number, pricePerItem?: number) => {
    const qty = Math.max(1, quantity);
    const item = items.find((i) => i.id === id);
    const unit = pricePerItem || (item && item.total && item.quantity ? item.total / item.quantity : 0);
    const total = Math.max(0, unit * qty);
    await updateItem(id, { quantity: qty, total });
  };

  const checkout = async () => {
    try {
      const orderItems = items.map((i) => {
        const unit = i.quantity ? i.total / i.quantity : i.total;
        return {
          productId: i.productId || i.id,
          quantity: i.quantity,
          price: Number(unit || 0),
          total: Number(i.total || 0),
        };
      });
      const total = items.reduce((sum, i) => sum + (i.total || 0), 0);
      await createOrder({
        shippingAddress: address ? { address } : undefined,
        orderNotes: notes || undefined,
        orderItems,
        total: Number(total.toFixed(2)),
      });
      await clearCart();
      setNotes('');
      setAddress('');
      alert('Order placed successfully.');
    } catch {
      // handled in stores
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#FF5D39] to-[#F1A900] bg-clip-text text-transparent">
            Your Shopping Cart
          </h1>
          <p className="text-lg" style={{ color: BLACK, opacity: 0.7 }}>
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
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm" style={{ color: ORANGE }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: ORANGE }}
            ></div>
            <span className="ml-3 text-lg" style={{ color: BLACK, opacity: 0.7 }}>
              Loading your cart...
            </span>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-20">
            <div className="mx-auto h-24 w-24 mb-4" style={{ color: '#E5E5E5' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke={BLACK}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: BLACK }}>
              Your cart is empty
            </h3>
            <p className="mb-6" style={{ color: BLACK, opacity: 0.7 }}>
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <button
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg"
              style={{
                background: ORANGE,
                color: WHITE,
                transition: 'background 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = YELLOW)}
              onMouseOut={e => (e.currentTarget.style.background = ORANGE)}
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* Cart Items */}
        {items.length > 0 && (
          <div className="space-y-6 mb-8">
            {items.map((item) => {
              const unit = item.quantity ? item.total / item.quantity : item.total;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300"
                  style={{
                    background: WHITE,
                    borderColor: '#F3F3F3',
                  }}
                >
                  <div className="flex gap-6 p-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.imageUrl ? (
                        <div className="relative">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            width={120}
                            height={120}
                            className="w-30 h-30 object-cover rounded-xl shadow-md"
                          />
                          <div
                            className="absolute inset-0 rounded-xl"
                            style={{
                              background: 'linear-gradient(to top, rgba(0,0,0,0.08), transparent)',
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
                          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke={BLACK} style={{ opacity: 0.3 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2" style={{ color: BLACK }}>
                            {item.title}
                          </h3>
                          <p
                            className="text-lg font-medium mb-4"
                            style={{ color: ORANGE }}
                          >
                            ${unit.toFixed(2)} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex-shrink-0 p-2 rounded-full transition-colors duration-200"
                          style={{
                            color: BLACK,
                            background: 'transparent',
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.background = `${ORANGE}10`;
                            e.currentTarget.style.color = ORANGE;
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = BLACK;
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <div
                          className="flex items-center rounded-xl p-1"
                          style={{ background: '#F8F8F8' }}
                        >
                          <button
                            type="button"
                            className="p-2 rounded-lg transition-all duration-200"
                            style={{
                              color: BLACK,
                              background: 'transparent',
                            }}
                            onClick={() => handleQuantity(item.id, Math.max(1, (item.quantity || 1) - 1), unit)}
                            aria-label="Decrease quantity"
                            onMouseOver={e => (e.currentTarget.style.color = ORANGE)}
                            onMouseOut={e => (e.currentTarget.style.color = BLACK)}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => handleQuantity(item.id, Number(e.target.value) || 1, unit)}
                            className="w-16 text-center font-medium"
                            style={{
                              color: BLACK,
                              background: 'transparent',
                              outline: 'none',
                            }}
                          />
                          <button
                            type="button"
                            className="p-2 rounded-lg transition-all duration-200"
                            style={{
                              color: BLACK,
                              background: 'transparent',
                            }}
                            onClick={() => handleQuantity(item.id, (item.quantity || 1) + 1, unit)}
                            aria-label="Increase quantity"
                            onMouseOver={e => (e.currentTarget.style.color = ORANGE)}
                            onMouseOut={e => (e.currentTarget.style.color = BLACK)}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold" style={{ color: BLACK }}>
                            ${item.total.toFixed(2)}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              <div
                className="rounded-2xl shadow-lg border p-6"
                style={{
                  background: WHITE,
                  borderColor: '#F3F3F3',
                }}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: BLACK }}>
                  <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke={ORANGE}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Order Details
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: BLACK, opacity: 0.8 }}>
                      Order Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl px-4 py-3"
                      style={{
                        border: `1px solid #E5E5E5`,
                        color: BLACK,
                        background: WHITE,
                        transition: 'border 0.2s, box-shadow 0.2s',
                        outline: 'none',
                      }}
                      rows={3}
                      placeholder="Any special instructions for your order..."
                      onFocus={e => (e.currentTarget.style.border = `1.5px solid ${ORANGE}`)}
                      onBlur={e => (e.currentTarget.style.border = `1px solid #E5E5E5`)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: BLACK, opacity: 0.8 }}>
                      Shipping Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-xl px-4 py-3"
                      style={{
                        border: `1px solid #E5E5E5`,
                        color: BLACK,
                        background: WHITE,
                        transition: 'border 0.2s, box-shadow 0.2s',
                        outline: 'none',
                      }}
                      rows={3}
                      placeholder="Enter your shipping address..."
                      onFocus={e => (e.currentTarget.style.border = `1.5px solid ${ORANGE}`)}
                      onBlur={e => (e.currentTarget.style.border = `1px solid #E5E5E5`)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className="rounded-2xl shadow-lg border p-6 sticky top-6"
                style={{
                  background: WHITE,
                  borderColor: '#F3F3F3',
                }}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: BLACK }}>
                  <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke={YELLOW}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid #F3F3F3' }}>
                    <span style={{ color: BLACK, opacity: 0.7 }}>Subtotal</span>
                    <span className="text-xl font-bold" style={{ color: BLACK }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid #F3F3F3' }}>
                    <span style={{ color: BLACK, opacity: 0.7 }}>Shipping</span>
                    <span style={{ color: BLACK }}>Free</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-lg font-semibold" style={{ color: BLACK }}>
                      Total
                    </span>
                    <span className="text-2xl font-bold" style={{ color: ORANGE }}>
                      ${subtotal.toFixed(2)}
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
                    <p className="text-sm" style={{ color: ORANGE }}>{orderError}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={checkout}
                    disabled={orderLoading}
                    className="w-full font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(90deg, ${ORANGE}, ${YELLOW})`,
                      color: WHITE,
                      border: 'none',
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
                      'Complete Purchase'
                    )}
                  </button>
                  
                  <button
                    onClick={() => clearCart()}
                    className="w-full font-semibold py-3 rounded-xl transition-all duration-200"
                    style={{
                      border: `2px solid ${ORANGE}`,
                      color: ORANGE,
                      background: WHITE,
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = `${ORANGE}10`;
                      e.currentTarget.style.borderColor = YELLOW;
                      e.currentTarget.style.color = YELLOW;
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = WHITE;
                      e.currentTarget.style.borderColor = ORANGE;
                      e.currentTarget.style.color = ORANGE;
                    }}
                  >
                    Clear Cart
                  </button>
                </div>

                <div
                  className="mt-6 p-4 rounded-lg"
                  style={{
                    background: `${YELLOW}10`,
                  }}
                >
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={YELLOW}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm" style={{ color: BLACK, opacity: 0.8 }}>
                      Secure checkout powered by industry-standard encryption. Your payment information is protected.
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
