import React from "react";
import "./ConfirmModal.css";

export default function ConfirmModal({
  orderData,
  paymentMethod,
  upiId,
  selectedCardIndex,
  paymentDetails,
  onConfirm,
  onCancel
}) {
  const paymentSummary = () => {
    if (paymentMethod === "card" && selectedCardIndex !== null) {
      const card = paymentDetails[selectedCardIndex];
      return `${card.cardType} - ${card.cardMasked} (Exp: ${card.expiry})`;
    }
    if (paymentMethod === "upi") return `UPI ID: ${upiId}`;
    if (paymentMethod === "cod") return "Cash on Delivery";
    return "Not selected";
  };

    return (
    <div className="o-confirm-modal">
      <div className="o-confirm-card">
        <h3>Confirm Your Order</h3>

        <div className="o-confirm-section">
          <strong>Delivery Address:</strong>
          <p>
            {orderData.address.line}, {orderData.address.city} -{" "}
            {orderData.address.pincode}
          </p>
        </div>

        <div className="o-confirm-section">
          <strong>Delivery Date:</strong>
          <p>{orderData.deliveryDate}</p>
        </div>

        <div className="o-confirm-section">
          <strong>Items:</strong>
          <ul>
            {orderData.items.map((item) => (
              <li key={item.id}>
                {item.name} × {item.qty} — ₹{item.price * item.qty}
              </li>
            ))}
          </ul>
        </div>

        <div className="o-confirm-section">
          <strong>Total:</strong> ₹{orderData.total}
        </div>

        <div className="o-confirm-section">
          <strong>Payment Method:</strong>
          <p>{paymentSummary()}</p>
        </div>

        <div className="o-confirm-actions">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm}>Confirm & Pay</button>
        </div>
      </div>
    </div>
  );
}
