import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./trackPackage.css";
import { useAuth } from "../user-authentication/context/AuthContext";
import { toast } from "react-hot-toast";

const STATUS_STAGES = ["Ordered", "Shipped", "Out for Delivery", "Delivered"];
const API_BASE = "http://localhost:3001";

export default function TrackPackage() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId || !user?.id) {
      toast.error("You must be logged in to track your package.");
      navigate("/");
      return;
    }

    fetch(`${API_BASE}/users/${user.id}`)
      .then(res => res.json())
      .then(data => {
        const matchedOrder = data.orders?.find(o => o.id === Number(orderId));
        if (!matchedOrder) throw new Error("Order not found");
        setOrder(matchedOrder);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch order:", err);
        toast.error("Unable to load tracking info.");
        setLoading(false);
      });
  }, [orderId, user?.id, navigate]);

  function getDeliveryCountdown(deliveryDate, status) {
    if (status === "Cancelled") return "Tracking unavailable — order was cancelled.";
    if (status === "Delivered") return "Delivered";
    const now = new Date();
    const delivery = new Date(deliveryDate);
    const diffMs = delivery - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return `Arriving in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
    return "Arriving today";
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

  const currentStageIndex = order ? STATUS_STAGES.indexOf(order.status) : 0;
  const stageTimes = order ? getStageTimestamps(order.orderedTime, order.deliveryDate) : {};

  return (
  <div className="o-track-wrapper" aria-label="Track Package Page">
    <div className="o-track-page">
      <div className="o-track-header">
        <h2 tabIndex="0">📦 Track Package</h2>
        <button className="o-back-btn" onClick={() => navigate("/orders")} aria-label="Back to Orders">
          ← Back to Orders
        </button>
      </div>

      {loading ? (
        <p className="o-loading-text">Loading tracking info...</p>
      ) : !order ? (
        <p className="o-loading-text">Order not found.</p>
      ) : (
        <div className={`o-track-card ${order.status === "Cancelled" ? "o-cancelled" : ""}`}>
          <div className="o-track-summary">
            <div>
              <span className="o-meta-label">ORDER PLACED</span>
              <p>{order.orderedDay}, {order.orderedDate}</p>
            </div>
            <div>
              <span className="o-meta-label">TOTAL</span>
              <p>₹{order.total.toFixed(2)}</p>
            </div>
            <div>
              <span className="o-meta-label">SHIP TO</span>
              <p>
                {order.address.name}<br />
                {order.address.line}, {order.address.city} - {order.address.pincode}<br />
                Phone: {order.address.phone}
              </p>
            </div>
          </div>

          {order.status !== "Cancelled" ? (
            <div className="o-track-timeline">
              <p className="o-delivery-countdown" aria-live="polite">
  {getDeliveryCountdown(order.deliveryDate, order.status)}
</p>

              <div className="o-progress-bar">
                <div className="o-progress-fill" style={{ width: `${(currentStageIndex / 3) * 100}%` }} />
              </div>

              <div className="o-timeline-bar">
                {STATUS_STAGES.map((stage, i) => (
                  <div key={stage} className={`o-timeline-step ${i <= currentStageIndex ? "o-active" : ""}`}>
                    <div className="o-step-dot" />
                    <span>{stage}</span>
                    <p className="o-stage-time">
                      {stageTimes[stage]?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="o-cancelled-message">
              <p>❌ This order was cancelled. Tracking is disabled.</p>
            </div>
          )}

          {order.status !== "Cancelled" && (
            <div className="o-agent-info">
              <img src="/images/delivery-agent.png" alt="Agent" />
              <div>
                <p className="o-agent-name">Delivery by: Rajesh Kumar</p>
                <p className="o-agent-contact">Phone: 9876543210</p>
              </div>
            </div>
          )}

          <div className="o-track-products">
            {order.items.map(item => (
              <div key={item.id} className="o-track-item">
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/default-product.jpg";
                  }}
                />
                <p>{item.name} × {item.qty}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);
}
