import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Confetti from "react-confetti";
import "./orderDetails.css";
import { generateInvoice } from "./invoiceGenerator";
import { useAuth } from "../user-authentication/context/AuthContext";

export default function OrderDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orderId = location.state?.orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const API_BASE = "http://localhost:3001";

  useEffect(() => {
    if (!orderId || !user?.id) {
      toast.error("You must be logged in to view order details.");
      navigate("/");
      return;
    }

    fetch(`${API_BASE}/users/${user.id}`)
      .then(res => res.json())
      .then(data => {
        const matchedOrder = data.orders?.find(o => o.id === Number(orderId));
        if (!matchedOrder) throw new Error("Order not found");
        setOrder(matchedOrder);
        if (matchedOrder.status === "Delivered") setShowConfetti(true);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch order:", err);
        toast.error("Order not found.");
        setLoading(false);
      });
  }, [orderId, user?.id, navigate]);

  function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  function getStageTimestamps(orderedTime, deliveryDate) {
    const placed = new Date(orderedTime);
    return {
      Ordered: placed,
      Shipped: new Date(placed.getTime() + 30 * 60000),
      "Out for Delivery": new Date(placed.getTime() + 60 * 60000),
      Delivered: new Date(deliveryDate)
    };
  }

  function getPaymentMethodLabel(pm) {
    if (!pm) return "N/A";
    if (pm.method) return pm.method;
    if (pm.cardType || pm.cardMasked || pm.cardLast4) return "Card";
    if (pm.upiId) return "UPI";
    return "N/A";
  }

  function handleDownloadInvoice() {
    if (!order) return;
    generateInvoice(order);
    toast.success("Invoice downloaded successfully!");
  }

  async function handleCancelOrder() {
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`);
      const userData = await res.json();
      const updatedOrders = userData.orders.map(o =>
        o.id === order.id ? { ...o, status: "Cancelled" } : o
      );

      await fetch(`${API_BASE}/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: updatedOrders })
      });

      setOrder(updatedOrders.find(o => o.id === order.id));
      toast("Order cancelled.");
    } catch (err) {
      console.error("Cancel error:", err);
      toast.error("Failed to cancel order.");
    }
  }

  function handleReorder() {
    order.items.forEach(item => {
      fetch(`${API_BASE}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, userId: order.userId })
      });
    });
    toast.success("Items added to cart!");
    navigate("/cart");
  }

  const stageTimes = order ? getStageTimestamps(order.orderedTime, order.deliveryDate) : {};
  const currentStageIndex = order ? ["Ordered", "Shipped", "Out for Delivery", "Delivered"].indexOf(order.status) : 0;

  return (
    <div className="o-details-wrapper" aria-label="Order Details Page">
      <Toaster position="bottom-right" />
      {showConfetti && (
        <div aria-hidden="true">
          <Confetti numberOfPieces={200} recycle={false} />
        </div>
      )}
      <div className="o-details-page">
        <div className="o-details-header">
          <h2 tabIndex="0">🧾 Order Details</h2>
          <div className="o-details-actions">
            <button className="o-download-btn" onClick={handleDownloadInvoice} aria-label="Download Invoice">
              Download Invoice
            </button>
            <button className="o-back-btn" onClick={() => navigate("/orders", { state: { userId: order?.userId } })} aria-label="Back to Orders">
              ← Back to Orders
            </button>
          </div>
        </div>

        {loading ? (
          <p className="o-loading-text">Loading order details...</p>
        ) : !order ? (
          <p className="o-loading-text">Order not found.</p>
        ) : (
          <div className="o-details-card">
            <section className="o-section-block">
              <div className="o-info-grid">
                <div className="o-info-card">
                  <h5>📦 Order Summary</h5>
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Placed On:</strong> {formatDateTime(order.orderedTime)}</p>
                  <p><strong>Status:</strong> {order.status}</p>
                </div>
                <div className="o-info-card">
                  <h5>💳 Payment Details</h5>
                  <p><strong>Method:</strong> {getPaymentMethodLabel(order.paymentMethod)}</p>
                  {order.paymentMethod?.upiId && (
                    <p><strong>UPI ID:</strong> {order.paymentMethod.upiId}</p>
                  )}
                  {order.paymentMethod?.cardMasked && (
                    <p><strong>Card:</strong> {order.paymentMethod.cardMasked}</p>
                  )}
                  {order.paymentMethod?.cardType && (
                    <p><strong>Card Type:</strong> {order.paymentMethod.cardType}</p>
                  )}
                  {order.paymentMethod?.expiry && (
                    <p><strong>Expiry:</strong> {order.paymentMethod.expiry}</p>
                  )}
                </div>
                <div className="o-info-card">
                  <h5>🚚 Shipping Address</h5>
                  <p>{order.address.name}</p>
                  <p>{order.address.line}, {order.address.city} - {order.address.pincode}</p>
                  <p>Phone: {order.address.phone}</p>
                </div>
              </div>
            </section>

            <section className="o-section-block">
              <h4>🛍️ Items Ordered</h4>
              <div className="o-product-list">
                {order.items.map(item => (
                  <div key={item.id} className="o-product-row">
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/default-product.jpg";
                      }}
                    />
                    <div className="o-product-info">
                      <p><strong>{item.name}</strong></p>
                      <p>Qty: {item.qty} {item.unit}</p>
                      <p>Price: ₹{item.price.toFixed(2)}</p>
                      <p>Subtotal: ₹{(item.qty * item.price).toFixed(2)}</p>
                      <p>Brand: {item.brand}</p>
                      <p>Category: {item.category}</p>
                      <p>SKU: {item.sku}</p>
                      <p className="o-item-description">{item.description}</p>
                    </div>
                  </div>
                ))}
                <div className="o-total-row">
                  <strong>Total Paid:</strong> ₹{order.total.toFixed(2)}
                </div>
              </div>
            </section>

            {order.status !== "Cancelled" && (
              <section className="o-section-block">
                <h4>📍 Delivery Timeline</h4>
                <div className="o-progress-bar">
                  <div
                    className="o-progress-fill"
                    style={{ width: `${(currentStageIndex / 3) * 100}%` }}
                  />
                </div>
                <div className="o-timeline-bar">
                  {Object.entries(stageTimes).map(([stage, time], i) => (
                    <div
                      key={stage}
                      className={`o-timeline-step ${i <= currentStageIndex ? "o-active" : ""}`}
                    >
                      <div className="o-step-dot" />
                                            <span>{stage}</span>
                      <p>
                        {time.toLocaleDateString()}
                        <br />
                        {time.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {order.status !== "Cancelled" && (
              <section className="o-section-block">
                <h4>👤 Delivery Agent</h4>
                <div className="o-agent-card">
                  <img src="/images/delivery-agent.png" alt="Agent" />
                  <div>
                    <p><strong>Rajesh Kumar</strong></p>
                    <p>Phone: 9876543210</p>
                    <p>
                      {order.status === "Delivered"
                        ? "Delivered on: " + new Date(order.deliveryDate).toLocaleDateString()
                        : "Expected Delivery: " + new Date(order.deliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {order.status === "Cancelled" && (
              <section className="o-section-block">
                <div className="o-cancelled-message">
                  <p>❌ This order was cancelled. No further updates will be shown.</p>
                </div>
              </section>
            )}

            <section className="o-section-block">
              {order.status === "Ordered" && (
                <button
                  className="o-cancel-btn"
                  onClick={handleCancelOrder}
                  aria-label="Cancel Order"
                >
                  ❌ Cancel Order
                </button>
              )}
              <button
                className="o-reorder-btn"
                onClick={handleReorder}
                aria-label="Reorder Items"
              >
                🔁 Reorder
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
