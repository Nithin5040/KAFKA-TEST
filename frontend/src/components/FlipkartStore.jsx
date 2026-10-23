import React, { useState } from 'react';
import { ShoppingCart, Search, Star, ShieldCheck, Zap, Heart, CheckCircle2, ChevronRight, AlertTriangle, ArrowRight } from 'lucide-react';

const PRODUCTS = [
  {
    id: 'FK-PROD-01',
    name: 'Apple iPhone 15 (Blue, 128 GB)',
    category: 'Mobiles',
    price: 64999,
    mrp: 69900,
    discount: '7% off',
    rating: 4.6,
    reviews: 14200,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80',
    assured: true,
    specs: ['128 GB ROM', '15.49 cm (6.1 inch) Super Retina XDR', '48MP + 12MP Camera', 'A16 Bionic Chip']
  },
  {
    id: 'FK-PROD-02',
    name: 'Sony WH-1000XM5 Noise Cancelling Headphone',
    category: 'Electronics',
    price: 26990,
    mrp: 34990,
    discount: '22% off',
    rating: 4.7,
    reviews: 5820,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
    assured: true,
    specs: ['30 Hours Battery', 'Auto NC Optimizer', 'Multipoint Connection', 'High-Res Audio']
  },
  {
    id: 'FK-PROD-03',
    name: 'Apple MacBook Air M2 (8GB / 256GB SSD)',
    category: 'Laptops',
    price: 89990,
    mrp: 99900,
    discount: '9% off',
    rating: 4.8,
    reviews: 9340,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
    assured: true,
    specs: ['Apple M2 Chip', '8 GB Unified Memory', '256 GB SSD Storage', 'Liquid Retina Display']
  },
  {
    id: 'FK-PROD-04',
    name: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray)',
    category: 'Mobiles',
    price: 129999,
    mrp: 134999,
    discount: '3% off',
    rating: 4.7,
    reviews: 3120,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&auto=format&fit=crop&q=80',
    assured: true,
    specs: ['12 GB RAM | 256 GB ROM', '200MP Quad Camera', 'Snapdragon 8 Gen 3', 'Built-in S-Pen']
  },
  {
    id: 'FK-PROD-05',
    name: 'Keychron Q1 Pro Wireless Mechanical Keyboard',
    category: 'Electronics',
    price: 17999,
    mrp: 21999,
    discount: '18% off',
    rating: 4.9,
    reviews: 840,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80',
    assured: true,
    specs: ['CNC Aluminum Body', 'Hot-Swappable Switches', 'RGB Backlight', 'Bluetooth 5.1 & Type-C']
  },
  {
    id: 'FK-PROD-06',
    name: 'Luxury Royal Chronograph (Exclusive Edition)',
    category: 'Watches',
    price: 499999,
    mrp: 550000,
    discount: '9% off',
    rating: 4.2,
    reviews: 140,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80',
    assured: false,
    specs: ['Swiss Automatic Movement', 'Sapphire Crystal', '18K Gold Plated', 'High-Risk Value Limit']
  }
];

export default function FlipkartStore({ onOrderPlaced, activeOrderId }) {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentOption, setPaymentOption] = useState('UPI'); // 'UPI' | 'CARD_DECLINED'
  const [customerName, setCustomerName] = useState('Nithin Kumar');
  const [loading, setLoading] = useState(false);
  const [lastSuccessOrder, setLastSuccessOrder] = useState(null);

  const filteredProducts = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBuyNow = (product) => {
    setSelectedProduct(product);
    // If it's the luxury watch, suggest card decline simulation to test DLQ
    if (product.price > 200000) {
      setPaymentOption('CARD_DECLINED');
    } else {
      setPaymentOption('UPI');
    }
    setCheckoutModalOpen(true);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    const forceFail = (paymentOption === 'CARD_DECLINED');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName || 'Nithin Customer',
          item: selectedProduct.name,
          amount: selectedProduct.price,
          quantity: 1,
          forceFail
        })
      });

      const data = await res.json();
      setLastSuccessOrder(data);
      if (onOrderPlaced) onOrderPlaced(data);
    } catch (err) {
      console.error('Error placing order:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#f1f3f6',
      color: '#212121',
      overflowY: 'auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      
      {/* 1. Flipkart Iconic Blue Header */}
      <div style={{
        background: '#2874f0',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, fontStyle: 'italic', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Flipkart
          </span>
          <span style={{ fontSize: '0.68rem', fontStyle: 'italic', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '2px' }}>
            Explore <strong style={{ color: '#ffe500' }}>Plus</strong> <Star size={9} fill="#ffe500" color="#ffe500" />
          </span>
        </div>

        {/* Search Bar */}
        <div style={{ flex: 1, maxWidth: '440px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search for products, brands and more"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 36px 8px 14px',
              borderRadius: '2px',
              border: 'none',
              outline: 'none',
              fontSize: '0.82rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          />
          <Search size={16} color="#2874f0" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* User Pill & Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: '#ffffff',
            color: '#2874f0',
            fontWeight: 700,
            fontSize: '0.8rem',
            padding: '5px 14px',
            borderRadius: '2px',
            cursor: 'pointer'
          }}>
            Nithin's Account
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
            <ShoppingCart size={18} />
            <span>Cart</span>
          </div>
        </div>
      </div>

      {/* 2. Flipkart Sub-Navbar Categories */}
      <div style={{
        background: '#ffffff',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 10px',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: '#333333',
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <span style={{ color: '#2874f0', cursor: 'pointer' }}>Top Deals</span>
        <span style={{ cursor: 'pointer' }}>Mobiles</span>
        <span style={{ cursor: 'pointer' }}>Electronics</span>
        <span style={{ cursor: 'pointer' }}>Laptops</span>
        <span style={{ cursor: 'pointer' }}>Appliances</span>
        <span style={{ cursor: 'pointer' }}>Fashion</span>
      </div>

      {/* 3. Promotional Banner */}
      <div style={{
        background: 'linear-gradient(90deg, #1e3c72, #2a5298)',
        color: '#ffffff',
        padding: '10px 18px',
        margin: '10px 14px',
        borderRadius: '6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>⚡ Big Billion Days Special</div>
          <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Every click below triggers real-time Kafka event streaming & RabbitMQ task queues!</div>
        </div>
        <span style={{ background: '#ffe500', color: '#000', fontSize: '0.72rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px' }}>
          Live Demo
        </span>
      </div>

      {/* 4. Product Catalog Grid */}
      <div style={{ padding: '0 14px 20px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            style={{
              background: '#ffffff',
              borderRadius: '6px',
              padding: '14px',
              display: 'flex',
              gap: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.2s'
            }}
          >
            {/* Product Image */}
            <div style={{ width: '130px', height: '130px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={prod.image}
                alt={prod.name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }}
              />
            </div>

            {/* Product Info */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                  {prod.name}
                </h4>

                {/* Rating & Assured Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    background: '#388e3c',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '3px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    {prod.rating} <Star size={10} fill="#ffffff" />
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#878787' }}>({prod.reviews.toLocaleString()} Ratings)</span>
                  {prod.assured && (
                    <span style={{
                      fontStyle: 'italic',
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      color: '#2874f0',
                      border: '1px solid #2874f0',
                      borderRadius: '2px',
                      padding: '1px 4px'
                    }}>
                      ⚡Assured
                    </span>
                  )}
                </div>

                {/* Specs bullet points */}
                <div style={{ fontSize: '0.72rem', color: '#4b5563', lineHeight: '1.4' }}>
                  {prod.specs.map((s, idx) => (
                    <span key={idx} style={{ marginRight: '8px' }}>• {s}</span>
                  ))}
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
                      ₹{prod.price.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#878787', textDecoration: 'line-through' }}>
                      ₹{prod.mrp.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#388e3c' }}>
                      {prod.discount}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#388e3c', fontWeight: 600 }}>Free delivery</div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleBuyNow(prod)}
                    style={{
                      background: '#fb641b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '2px',
                      padding: '8px 18px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Zap size={14} fill="#ffffff" /> BUY NOW
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* 5. Flipkart Checkout / Place Order Modal */}
      {checkoutModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '6px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            overflow: 'hidden'
          }}>
            
            {/* Flipkart Modal Header */}
            <div style={{
              background: '#2874f0',
              color: '#ffffff',
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>ORDER SUMMARY & PAYMENT</span>
              <button
                onClick={() => {
                  setCheckoutModalOpen(false);
                  setLastSuccessOrder(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '1rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '18px' }}>
              
              {!lastSuccessOrder ? (
                <>
                  {/* Delivery Address */}
                  <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#878787', fontWeight: 600 }}>DELIVERY ADDRESS</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
                      Nithin Kumar - 560001
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#4b5563' }}>
                      #42 Tech Park Avenue, Indiranagar, Bengaluru, Karnataka
                    </div>
                  </div>

                  {/* Selected Item Recap */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f9fafb', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
                    <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827' }}>{selectedProduct.name}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2874f0' }}>₹{selectedProduct.price.toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  {/* Payment Simulator Selection */}
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                      SELECT PAYMENT METHOD:
                    </div>

                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      border: `1px solid ${paymentOption === 'UPI' ? '#2874f0' : '#e5e7eb'}`,
                      background: paymentOption === 'UPI' ? '#f0f5ff' : '#ffffff',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentOption === 'UPI'}
                        onChange={() => setPaymentOption('UPI')}
                      />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827' }}>
                          UPI / Credit Card (Payment Approved)
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#10b981' }}>
                          ✓ Triggers Kafka Event → RabbitMQ ACKs → Saved as COMPLETED in Supabase
                        </div>
                      </div>
                    </label>

                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      border: `1px solid ${paymentOption === 'CARD_DECLINED' ? '#ef4444' : '#e5e7eb'}`,
                      background: paymentOption === 'CARD_DECLINED' ? '#fef2f2' : '#ffffff',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentOption === 'CARD_DECLINED'}
                        onChange={() => setPaymentOption('CARD_DECLINED')}
                      />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b91c1c' }}>
                          Simulate Bank Decline / Limit Exceeded
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#ef4444' }}>
                          ✗ Triggers RabbitMQ Payment NACK → Routes to Dead Letter Queue (DLQ)!
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Big Yellow Place Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    style={{
                      width: '100%',
                      background: '#fb641b',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      borderRadius: '2px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {loading ? 'Transmitting to Kafka...' : 'PLACE ORDER (Watch Right Panel ➔)'}
                  </button>
                </>
              ) : (
                /* Order Placed Confirmation Screen */
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                    <CheckCircle2 size={32} color="#2e7d32" />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
                    Flipkart Order Placed!
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '14px' }}>
                    Order ID: <strong style={{ color: '#111827' }}>{lastSuccessOrder.orderId}</strong>
                  </div>

                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    marginBottom: '16px'
                  }}>
                    <div style={{ color: '#64748b' }}>Item: <strong>{selectedProduct.name}</strong></div>
                    <div style={{ color: '#64748b' }}>Total Paid: <strong>₹{selectedProduct.price.toLocaleString('en-IN')}</strong></div>
                    <div style={{ color: '#2563eb', marginTop: '6px', fontWeight: 600 }}>
                      ➔ Now watch the right half of your screen to see the live Kafka broker, RabbitMQ queues, and Supabase database processing it in real time!
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCheckoutModalOpen(false);
                      setLastSuccessOrder(null);
                    }}
                    style={{
                      background: '#2874f0',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 20px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      borderRadius: '2px',
                      cursor: 'pointer'
                    }}
                  >
                    Continue Shopping
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
