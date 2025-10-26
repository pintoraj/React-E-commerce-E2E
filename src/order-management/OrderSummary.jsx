import React from "react";
import "./orderSummary.css";

export default function OrderSummary({
  addresses,
  selectedAddressId,
  availableDates,
  selectedDate,
  setSelectedDate,
  showDateDropdown,
  setShowDateDropdown,
  cartItems,
  calcTotal,
  onProceed
}) {
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const selectedLabel =
    availableDates.find((d) => d.value === selectedDate)?.label || "";
  const isDefaultDate = selectedDate === availableDates[0]?.value;

  // Calculate delay in days compared to default
  const delayIndex = availableDates.findIndex(d => d.value === selectedDate);
  const delayDays = delayIndex > 0 ? delayIndex : 0;

  // Decide which dates to show in dropdown
  const hasChangedDate = !isDefaultDate;
  const dropdownDates = hasChangedDate ? availableDates : availableDates.slice(1);

  return (
  <>
    {selectedAddress && (
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
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    )}

    <div className="o-checkout-card">
      <h3>Order Summary</h3>
      <div className="o-items-list">
        {cartItems.map((it) => (
          <div
            className="o-item-row"
            key={it.id}
            aria-label={`${it.name}, quantity ${it.qty}, price ₹${(it.price * it.qty).toFixed(2)}`}
          >
            <div>{it.name} x{it.qty}</div>
            <div>₹{(it.price * it.qty).toFixed(2)}</div>
          </div>
        ))}
      </div>
      <div className="o-total o-pulse-on-hover">
        Total: ₹{calcTotal().toFixed(2)}
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
      Proceed to Payment
    </button>
  </>
);
}
