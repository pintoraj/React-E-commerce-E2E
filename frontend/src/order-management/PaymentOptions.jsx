import React from "react";
import "./PaymentOptions.css";

export default function PaymentOptions({
  paymentMethod,
  setPaymentMethod,
  paymentDetails,
  selectedCardIndex,
  setSelectedCardIndex,
  showCardModal,
  setShowCardModal,
  showUpiModal,
  setShowUpiModal,
  newCard,
  setNewCard,
  handleSaveCard,
  handleExpiryChange,
  upiId,
  setUpiId,
  handleVerifyUpi
}) {
  return (
    <div className="o-payment-left">
      <div className="o-payment-card">
        <h3>Select Payment Method</h3>

        {/* Card Option */}
        <div className={`o-method-block ${paymentMethod === "card" ? "o-selected" : ""}`}>
          <label>
            <input
              type="radio"
              name="method"
              value="card"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
            />
            <span>💳 Card</span>
          </label>

          {paymentMethod === "card" && (
            <div className="o-saved-cards">
              {paymentDetails.length > 0 ? (
                paymentDetails.map((card, idx) => (
                  <label key={idx}>
                    <input
                      type="radio"
                      name="paymentCard"
                      checked={selectedCardIndex === idx}
                      onChange={() => setSelectedCardIndex(idx)}
                    />
                    {card.cardType} - {card.cardMasked} (Exp: {card.expiry})
                  </label>
                ))
              ) : (
                <p className="o-no-cards">No saved cards yet.</p>
              )}

              <button onClick={() => setShowCardModal(true)}>Add New Card</button>
            </div>
          )}
        </div>

        {/* UPI Option */}
        <div className={`o-method-block ${paymentMethod === "upi" ? "o-selected" : ""}`}>
          <label>
            <input
              type="radio"
              name="method"
              value="upi"
              checked={paymentMethod === "upi"}
              onChange={() => {
                setPaymentMethod("upi");
                setShowUpiModal(true);
              }}
            />
            <span>🏦 UPI</span>
          </label>
        </div>

        {/* COD Option */}
        <div className={`o-method-block ${paymentMethod === "cod" ? "o-selected" : ""}`}>
          <label>
            <input
              type="radio"
              name="method"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
            />
            <span>💵 Cash on Delivery</span>
          </label>

          {paymentMethod === "cod" && (
            <p className="o-cod-note">You will pay in cash upon delivery.</p>
          )}
        </div>
      </div>

      {/* Card Modal */}
      {showCardModal && (
        <div className="o-modal">
          <div className="o-modal-card">
            <h4>Add New Card</h4>
            <form onSubmit={handleSaveCard} className="o-new-card-form">
              <select
                value={newCard.cardType}
                onChange={(e) => setNewCard({ ...newCard, cardType: e.target.value })}
                required
              >
                <option value="">Select Card Type</option>
                <option value="Visa">Visa</option>
                <option value="MasterCard">MasterCard</option>
              </select>
              <input
                placeholder="Cardholder Name"
                value={newCard.cardName}
                onChange={(e) => setNewCard({ ...newCard, cardName: e.target.value })}
                required
              />
              <input
                placeholder="Card Number"
                value={newCard.cardNumber}
                onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                maxLength="16"
                required
              />
              <input
                placeholder="MM/YY"
                value={newCard.expiry}
                onChange={handleExpiryChange}
                maxLength="5"
                required
              />
              <input
                placeholder="CVV"
                value={newCard.cvv}
                onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                maxLength="3"
                required
              />
              <div className="o-modal-actions">
                <button type="button" onClick={() => setShowCardModal(false)}>Cancel</button>
                <button type="submit">Save Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPI Modal */}
      {showUpiModal && (
        <div className="o-modal">
          <div className="o-modal-card">
            <h4>Enter UPI ID</h4>
            <input
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="o-upi-input"
            />
            {!/^[\w.-]+@[\w.-]+$/.test(upiId) && upiId.length > 0 && (
              <p className="o-upi-error" aria-live="polite">Enter a valid UPI ID</p>
            )}
            <div className="o-modal-actions">
              <button type="button" onClick={() => setShowUpiModal(false)}>Cancel</button>
              <button
                type="button"
                onClick={handleVerifyUpi}
                disabled={!/^[\w.-]+@[\w.-]+$/.test(upiId)}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
