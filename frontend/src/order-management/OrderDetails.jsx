import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Confetti from "react-confetti";
import "./orderDetails.css";
import { generateInvoice } from "./invoiceGenerator";
import { useAuth } from "../user-authentication/context/AuthContext";
import { useCart } from "../user-authentication/context/CartContext"; // ✅ Adjust path if needed

export default function OrderDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { addToCart } = useCart(); // ✅ Added
  const orderId = location.state?.orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!orderId || !user?.id || !token) {
      toast.error("You must be logged in to view order details.");
      navigate("/");
      return;
    }

    fetch(`${API_BASE}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject("Unauthorized"))
      .then(data => {
        setOrder(data);
        if (data.status === "Delivered") setShowConfetti(true);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch order:", err);
        toast.error("Order not found.");
        setLoading(false);
      });
  }, [orderId, user?.id, token, navigate]);

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
    if (typeof pm === "string") return pm;
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
      const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Cancel failed");
      const updatedOrder = await res.json();
      setOrder(updatedOrder);
      toast("Order cancelled.");
    } catch (err) {
      console.error("Cancel error:", err);
      toast.error("Failed to cancel order.");
    }
  }

  async function handleReorder() {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/reorder`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Reorder failed");
    const items = await res.json(); // ✅ Get reordered items

    items.forEach(item => {
      console.log("Reordering productId:", item.productId);
      addToCart({
        productId: item.productId, // ✅ Pass actual productId for backend lookup
        title: item.name,
        price: item.price,
        quantity: item.qty,
        thumbnail: item.image?.split("/").pop(),
        unit: item.unit,
        brand: item.brand,
        category: item.category,
        sku: item.sku,
        description: item.description
      });
    });

    toast.success("Items added to cart!");
    navigate("/cart");
  } catch (err) {
    console.error("Reorder error:", err);
    toast.error("Failed to reorder items.");
  }
}


  const stageTimes = order ? getStageTimestamps(order.orderedTime, order.deliveryDate) : {};
  const currentStageIndex = order
    ? ["Ordered", "Shipped", "Out for Delivery", "Delivered"].indexOf(order.status)
    : 0;


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
          <button className="o-back-btn" onClick={() => navigate("/orders")} aria-label="Back to Orders">
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
              </div>
              <div className="o-info-card">
                <h5>🚚 Shipping Address</h5>
                {typeof order.address === "string" ? (
                  <p>{order.address}</p>
                ) : (
                  <>
                    <p>{order.address?.name || "—"}</p>
                    <p>{order.address?.line || "—"}, {order.address?.city || "—"} - {order.address?.pincode || "—"}</p>
                    <p>Phone: {order.address?.phone || "—"}</p>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="o-section-block">
            <h4>🛍️ Items Ordered</h4>
            <div className="o-product-list">
              {order.items.map((item, i) => (
                <div key={item.id || `${item.name}-${i}`} className="o-product-row">
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
                    <p>Qty: {item.qty} {item.unit || ""}</p>
                    <p>Price: ₹{item.price?.toFixed(2)}</p>
                    <p>Subtotal: ₹{(item.qty * item.price)?.toFixed(2)}</p>
                    {item.brand && <p>Brand: {item.brand}</p>}
                    {item.category && <p>Category: {item.category}</p>}
                    {item.sku && <p>SKU: {item.sku}</p>}
                    {item.description && <p className="o-item-description">{item.description}</p>}
                  </div>
                </div>
              ))}
              <div className="o-total-row">
                <strong>Total Paid:</strong> ₹{order.total?.toFixed(2)}
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
                    key={`${stage}-${i}`}
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
  <img src="/images/agent.jpg" alt="Agent" />
  <div>
    <p><strong>{order.agentName || "Not assigned"}</strong></p>
    <p>Phone: {order.agentPhone || "N/A"}</p>
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