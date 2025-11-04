import React from "react";
import "./orderSummary.css";

/**
 * Displays selected address, delivery date, and full order summary.
 */
export default function OrderSummary({
  addresses,
  selectedAddressId,
  availableDates,
  selectedDate,
  setSelectedDate,
  showDateDropdown,
  setShowDateDropdown,
  cartItems,
  calcSubtotal,
  onProceed
}) {
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const selectedLabel =
    availableDates.find((d) => d.value === selectedDate)?.label || "";
  const isDefaultDate = selectedDate === availableDates[0]?.value;

  const delayIndex = availableDates.findIndex(d => d.value === selectedDate);
  const delayDays = delayIndex > 0 ? delayIndex : 0;

  const hasChangedDate = !isDefaultDate;
  const dropdownDates = hasChangedDate ? availableDates : availableDates.slice(1);

  const subtotal = calcSubtotal();
  const shipping = cartItems.length > 0 ? 3.99 : 0;
  const tax = cartItems.length > 0 ? 2.0 : 0;
  const total = subtotal + shipping + tax;

  return (
    <>
      {selectedAddress ? (
        <div className="o-checkout-card">
          <h3>Selected Delivery Address</h3>
          <div className="o-selected-addr">
            <p>
              <strong>{selectedAddress.name}</strong> • {selectedAddress.phone}
            </p>
            <p>
              {selectedAddress.line}, {selectedAddress.city} - {selectedAddress.pincode}
            </p>
          </div>

          <div className="o-estimated-date">
            <span>
              <strong>Estimated Delivery Date:</strong>{" "}
              <span className="o-default-date">
                {selectedLabel}
                <span className="o-date-status" aria-live="polite">
                  {isDefaultDate
                    ? " (Default)"
                    : ` (delayed by ${delayDays} day${delayDays > 1 ? "s" : ""})`}
                </span>
              </span>
            </span>
            <button
              className="o-change-date-btn"
              aria-label="Change estimated delivery date"
              onClick={() => setShowDateDropdown(!showDateDropdown)}
            >
              {showDateDropdown ? "Close" : "Change"}
            </button>
          </div>

          <div className={`o-delay-section ${showDateDropdown ? "o-open" : ""}`}>
            {showDateDropdown && (
              <select
                id="delayDate"
                aria-label="Select a different delivery date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                {dropdownDates.map((d) => (
                  <option key={`${d.value}-${d.label}`} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      ) : (
        <div className="o-checkout-card o-warning-card">
          <h3>No Address Selected</h3>
          <p>Please select a delivery address to continue.</p>
        </div>
      )}

      <div className="o-checkout-card">
        <h3>Order Summary</h3>
        <div className="o-items-list">
          {cartItems.map((it) => (
            <div
              className="o-item-row"
              key={it.productId || it.id}
              aria-label={`${it.name}, quantity ${it.qty}, price ₹${(it.price * it.qty).toFixed(2)}`}
            >
              <div>{it.name} x{it.qty}</div>
              <div>₹{(it.price * it.qty).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="o-summary-breakdown">
          <div className="o-summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="o-summary-row">
            <span>Shipping</span>
            <span>₹{shipping.toFixed(2)}</span>
          </div>
          <div className="o-summary-row">
            <span>Tax</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="o-summary-row o-total">
            <strong>Total</strong>
            <strong>₹{total.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <button
        className="o-proceed-btn"
        onClick={onProceed}
        disabled={!selectedAddressId || !selectedDate}
        aria-disabled={!selectedAddressId || !selectedDate}
        title={
          !selectedAddressId
            ? "Please select a delivery address"
            : !selectedDate
            ? "Please select a delivery date"
            : "Proceed to payment"
        }
      >
        Proceed to Payment →
      </button>
    </>
  );
}
