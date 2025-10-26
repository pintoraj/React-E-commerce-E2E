import React from "react";
import "./OrderRecap.css";

export default function OrderRecap({
  orderData,
  canPay,
  isProcessing,
  payNowLabel,
  handlePayNow,
  paymentMethod,
  navigate,
  upiVerified,
  upiId,
  selectedCardIndex,
  paymentDetails
}) {
    if (!orderData || !orderData.address || !orderData.items?.length) {
    return (
      <div className="o-payment-right">
        <div className="o-payment-card">
          <h3>Order Recap</h3>
          <p className="o-validation-error" aria-live="polite">Missing order data. Please return to checkout.</p>
          <button
            onClick={() => navigate("/checkout")}
            className="o-back-checkout-btn"
          >
            ← Return to Checkout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="o-payment-right">
      <div className="o-payment-card">
        <h3>Order Recap</h3>

        <div className="o-delivery-info">
          <p>
            <strong>Address:</strong> {orderData.address.line},{" "}
            {orderData.address.city} - {orderData.address.pincode}
          </p>
          <p>
            <strong>Delivery Date:</strong> {orderData.deliveryDate}
          </p>
          <button
            onClick={() =>
              navigate("/checkout", {
                state: { cartItems: orderData.items, userId: orderData.userId }
              })
            }
          >
            Change
          </button>
        </div>

        <div className="o-items-list">
          {orderData.items.map((item) => (
            <div key={item.id} className="o-item-row">
              <span>
                {item.name} × {item.qty}
              </span>
              <span>₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>

        <div className="o-pricing-breakdown">
          <div className="o-price-row">
            <span>Subtotal</span>
            <span>₹{orderData.subtotal?.toFixed(2)}</span>
          </div>
          <div className="o-price-row">
            <span>Shipping</span>
            <span>₹{orderData.shipping?.toFixed(2)}</span>
          </div>
          <div className="o-price-row">
            <span>Tax</span>
            <span>₹{orderData.tax?.toFixed(2)}</span>
          </div>
          <div className="o-price-row o-total">
            <strong>Total</strong>
            <strong>₹{orderData.total?.toFixed(2)}</strong>
          </div>
        </div>

        {paymentMethod === "upi" && upiVerified && (
          <p className="o-verified-upi">
            <strong>UPI ID:</strong> {upiId}
          </p>
        )}

        {paymentMethod === "card" && selectedCardIndex !== null && (
          <p className="o-card-preview">
            <strong>Card:</strong>{" "}
            {paymentDetails[selectedCardIndex].cardType} -{" "}
            {paymentDetails[selectedCardIndex].cardMasked} (Exp:{" "}
            {paymentDetails[selectedCardIndex].expiry})
          </p>
        )}

            {!canPay() && (
      <p className="o-validation-error" aria-live="polite">
        {paymentMethod === ""
          ? "Select a payment method to continue."
          : paymentMethod === "card"
          ? "Select or add a card to continue."
          : paymentMethod === "upi"
          ? "Verify your UPI ID to continue."
          : ""}
      </p>
    )}


        <div className="o-payment-actions">
                  <button
          onClick={handlePayNow}
          disabled={!canPay() || isProcessing}
          className={isProcessing ? "o-processing" : ""}
          aria-busy={isProcessing}
        >
          {isProcessing ? "Processing..." : payNowLabel()}
        </button>

        </div>
      </div>
    </div>
  );
}
