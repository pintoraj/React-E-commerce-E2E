import React, { useState, useEffect } from 'react';
import './Cart.css';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL.replace(/\/api$/, '');

const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);

  // ✅ Sync selection when cart updates
  useEffect(() => {
    setSelectedIds(cart.map(item => item.id));
  }, [cart]);

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // ✅ Ensure productId is passed for backend order placement
  const selectedItems = cart
    .filter(item => selectedIds.includes(item.id))
    .map(item => ({
      productId: item.id, // ✅ Explicitly pass productId
      name: item.title,
      price: Number(item.price || 0),
      qty: item.quantity || 1,
      image: `${API_BASE}/uploads/${item.thumbnail}`,
      unit: item.unit || "pcs",
      brand: item.brand || "",
      category: item.category || "",
      sku: item.sku || "",
      description: item.description || ""
    }));

  const calculateSubtotal = () =>
    selectedItems.reduce((total, item) => total + item.price * item.qty, 0);

  const shipping = selectedItems.length > 0 ? 3.99 : 0;
  const tax = selectedItems.length > 0 ? 2.0 : 0;
  const total = calculateSubtotal() + shipping + tax;

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to proceed.");
      return;
    }

    navigate("/checkout", {
      state: {
        userId: user?.id || 0,
        cartItems: selectedItems,
        subtotal: calculateSubtotal(),
        shipping,
        tax,
        total
      },
    });
  };

  if (cart.length === 0) {
    return (
      <div className="u-cart-container">
        <div className="u-empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add items to your cart to purchase them</p>
        </div>
      </div>
    );
  }

  return (
    <div className="u-cart-container">
      <h1 className="u-cart-title">
        Cart <span className="u-cart-count">{cart.length} items</span>
      </h1>
      <div className="u-cart-layout">
        <div className="u-cart-items">
          {cart.map((item) => (
            <div key={item.id} className="u-cart-item">
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => toggleSelection(item.id)}
                className="u-item-select-checkbox"
              />
              <div className="u-item-image">
                <img
                  src={`${API_BASE}/uploads/${item.thumbnail}`}
                  alt={item.title}
                  onError={(e) => { e.target.src = '/images/default.jpg'; }}
                />
              </div>
              <div className="u-item-details">
                <h3>{item.title}</h3>
                <p className="u-price">
                  ₹{Number(item.price || 0).toFixed(2)} {item.unit}
                </p>
                <div className="u-quantity-controls">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity} {item.unit}</span>
                  <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}>+</button>
                </div>
              </div>
              <button className="u-remove-item" onClick={() => removeFromCart(item.id)}>
                <span role="img" aria-label="Remove">🗑️</span>
              </button>
            </div>
          ))}
        </div>

        <div className="u-cart-summary">
          <h3>Order summary</h3>
          <div className="u-summary-row">
            <span>Subtotal</span>
            <span>₹{calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="u-summary-row">
            <span>Shipping</span>
            <span>₹{shipping.toFixed(2)}</span>
          </div>
          <div className="u-summary-row">
            <span>Tax</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="u-summary-row u-total">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <button className="u-checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
