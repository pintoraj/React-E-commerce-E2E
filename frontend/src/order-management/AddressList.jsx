import React, { useState, useEffect } from "react";
import "./addressList.css";

/**
 * Renders a list of delivery addresses with selection and expansion.
 * @param {Object[]} addresses - First two addresses to show by default.
 * @param {Object[]} extraAddresses - Additional addresses shown on toggle.
 * @param {string|number} selectedAddressId - Currently selected address ID.
 * @param {Function} setSelectedAddressId - Setter for selected address.
 * @param {Function} onAdd - Callback to trigger address addition modal.
 */
export default function AddressList({
  addresses,
  extraAddresses = [],
  selectedAddressId,
  setSelectedAddressId,
  onAdd
}) {
  const [showAll, setShowAll] = useState(false);

  // ✅ Auto-toggle if selected address is in extra list
  useEffect(() => {
    const isSelectedInExtra = extraAddresses.some(a => a.id === selectedAddressId);
    if (isSelectedInExtra) {
      setShowAll(true);
    }
  }, [selectedAddressId, extraAddresses]);

  const renderAddress = (addr) => (
    <label
      key={addr.id}
      className={`o-addr-card ${selectedAddressId === addr.id ? "o-selected" : ""}`}
    >
      <input
        type="radio"
        name="deliveryAddress"
        aria-label={`Select address for ${addr.name}`}
        checked={selectedAddressId === addr.id}
        onChange={() => setSelectedAddressId(addr.id)}
      />
      <div>
        <span className="o-addr-name">
          {addr.name} • {addr.phone}
        </span>
        <span className="o-addr-line">
          {addr.line}, {addr.city} - {addr.pincode}
        </span>
      </div>
    </label>
  );

  return (
    <div className="o-checkout-card">
      <h3>Delivery Address</h3>

      <div className="o-addresses">
        {addresses.length === 0 && (
          <div className="o-no-addr">
            No address found.{" "}
            <button type="button" onClick={onAdd} className="o-inline-add-btn">
              Add one now
            </button>
          </div>
        )}

        {addresses.map(renderAddress)}

        <div className={`o-extra-addresses ${showAll ? "o-open" : ""}`}>
          {showAll && extraAddresses.map(renderAddress)}
        </div>

        {extraAddresses.length > 0 && (
          <button
            type="button"
            className="o-toggle-extra-btn"
            onClick={() => setShowAll((prev) => !prev)}
            aria-label={showAll ? "Hide extra addresses" : "Show all addresses"}
          >
            {showAll ? "Hide Extra Addresses ▲" : "Show All Addresses ▼"}
          </button>
        )}
      </div>

      <button className="o-add-btn" onClick={onAdd} aria-label="Add new address">
        Add New Address
      </button>
    </div>
  );
}
