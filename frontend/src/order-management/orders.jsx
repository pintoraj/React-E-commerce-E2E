import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./orders.css";
import { useAuth } from "../user-authentication/context/AuthContext";
import { toast } from "react-hot-toast";

const STATUS_STAGES = ["Ordered", "Shipped", "Out for Delivery", "Delivered"];
const PAGE_SIZE = 5;
const API_BASE = import.meta.env.VITE_API_URL;

export default function Orders() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user?.id || !token) return;

    fetch(`${API_BASE}/orders/user/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject("Unauthorized"))
      .then(data => {
        const userOrders = (data || []).map(order => ({
          ...order,
          countdown: getDeliveryCountdown(order.deliveryDate, order.status)
        }));
        setOrders(userOrders);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch orders:", err);
        toast.error("Unable to load orders.");
        setLoading(false);
      });
  }, [user?.id, token]);

  useEffect(() => {
    let filtered = [...orders];

    if (activeStatus !== "All") {
      filtered = filtered.filter(order => order.status === activeStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.items.some(item => item.name.toLowerCase().includes(q)) ||
        order.id.toString().includes(q)
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, activeStatus, searchQuery]);

  function getDeliveryCountdown(deliveryDate, status) {
    if (status === "Cancelled") return "Order Cancelled";
    const now = new Date();
    const delivery = new Date(deliveryDate);
    const diffMs = delivery - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (status === "Delivered") return "Delivered";
    if (diffDays > 0) return `Arriving in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
    return "Arriving today";
  }

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="o-orders-wrapper">
      <div className="o-orders-page">
        <div className="o-orders-header">
          <h2>Your Orders</h2>
          <button className="o-back-home-btn" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </div>

        <div className="o-orders-filters">
          {["All", ...STATUS_STAGES, "Cancelled"].map(status => (
            <button
              key={status}
              className={`o-filter-tab ${activeStatus === status ? "o-active" : ""}`}
              onClick={() => setActiveStatus(status)}
            >
              {status}
            </button>
          ))}
          <input
            type="text"
            className="o-search-bar"
            placeholder="Search by product or order ID"
            aria-label="Search orders by product name or order ID"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="o-loading-text">Loading your orders...</p>
        ) : filteredOrders.length === 0 ? (
          <div className="o-empty-orders">
            <img src="/images/empty-box.png" alt="No orders" />
            <p>You haven’t placed any orders yet.</p>
            <button onClick={() => navigate("/")}>Start Shopping</button>
          </div>
        ) : (
          <>
            <div className="o-orders-list">
              {paginatedOrders.map(order => (
                <div
                  key={order.id}
                  className={`o-order-card ${order.status === "Cancelled" ? "o-cancelled" : ""}`}
                >
                  <div className="o-order-summary">
                    <div className="o-order-meta">
                      <div>
                        <span className="o-meta-label">ORDER PLACED</span>
                        <p>{order.orderedDay}, {order.orderedDate}</p>
                      </div>
                      <div>
                        <span className="o-meta-label">TOTAL</span>
                        <p>₹{order.total}</p>
                      </div>
                      <div>
  <span className="o-meta-label">SHIP TO</span>
  {typeof order.address === "string" ? (
    <p>{order.address}</p>
  ) : (
    <p>
      {order.address.name}<br />
      {order.address.line}, {order.address.city} - {order.address.pincode}<br />
      Phone: {order.address.phone}
    </p>
  )}
</div>

                    </div>

                    <div className="o-delivery-status">
                      <p
                        className={`o-delivery-date ${order.status === "Cancelled" ? "o-cancelled-text" : ""}`}
                        aria-live="polite"
                      >
                        {order.countdown}
                      </p>
                      <div className="o-status-timeline">
                        {STATUS_STAGES.map(stage => (
                          <span
                            key={stage}
                            className={`o-status-step ${
                              order.status === "Cancelled"
                                ? "o-inactive"
                                : order.status === stage || STATUS_STAGES.indexOf(order.status) > STATUS_STAGES.indexOf(stage)
                                ? "o-active"
                                : ""
                            }`}
                          >
                            {stage}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="o-order-body">
                    <div className="o-product-thumbnails">
                      {order.items.map((item, i) => (
                        <div key={i} className="o-product-item">
                          <img
                            src={item.image}
                            alt={item.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/default-product.png";
                            }}
                          />
                          <p>{item.name} × {item.qty}</p>
                        </div>
                      ))}
                    </div>

                    <div className="o-order-actions">
                      <button
                        onClick={() => navigate("/order-details", {
                          state: { orderId: order.id }
                        })}
                      >
                        View Details
                      </button>

                      {order.status !== "Cancelled" && (
                        <button
                          className="o-track-btn"
                          onClick={() => navigate(`/track-package/${order.id}`)}
                        >
                          Track Package
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredOrders.length > PAGE_SIZE && (
              <div className="o-pagination">
                {Array.from({ length: Math.ceil(filteredOrders.length / PAGE_SIZE) }, (_, i) => (
                  <button
                    key={i}
                    className={`o-page-btn ${currentPage === i + 1 ? "o-active" : ""}`}
                    onClick={() => setCurrentPage(i + 1)}
                    aria-label={`Go to page ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
