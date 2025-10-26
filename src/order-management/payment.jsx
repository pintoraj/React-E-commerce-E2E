import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PaymentOptions from "./PaymentOptions";
import OrderRecap from "./OrderRecap";
import ConfirmModal from "./ConfirmModal";
import "./payment.css";
import "./ConfirmModal.css";
import { toast } from "react-hot-toast";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData;

  useEffect(() => {
    if (!orderData || !orderData.userId || !orderData.items?.length) {
      toast.error("Invalid access. Redirecting to checkout.");
      navigate("/checkout");
    }
  }, [orderData, navigate]);

  const [paymentDetails, setPaymentDetails] = useState([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [newCard, setNewCard] = useState({
    cardType: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiVerified, setUpiVerified] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showCardModal, setShowCardModal] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const API_BASE = "http://localhost:3001";

  useEffect(() => {
    const handlePopState = () => navigate("/checkout");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Reloading will cancel your payment and return you to Checkout.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (orderData?.userId) {
      fetch(`${API_BASE}/users/${orderData.userId}`)
        .then(res => res.json())
        .then(data => {
          setPaymentDetails(Array.isArray(data.paymentDetails) ? data.paymentDetails : []);
        })
        .catch(err => console.error(err));
    }
  }, [orderData?.userId]);

  async function handleSaveCard(e) {
    e.preventDefault();
    const { cardType, cardName, cardNumber, expiry, cvv } = newCard;

    if (!cardType || !/^[A-Za-z\s]+$/.test(cardName) || !/^\d{16}$/.test(cardNumber) ||
        !/^\d{2}\/\d{2}$/.test(expiry) || !/^\d{3}$/.test(cvv)) {
      toast.error("Please fill all fields correctly.");
      return;
    }

    const masked = "**** **** **** " + cardNumber.slice(-4);
    const newCardObj = {
      cardType,
      cardName,
      cardMasked: masked,
      cardLast4: cardNumber.slice(-4),
      expiry
    };

    const updatedCards = [...paymentDetails, newCardObj];

    try {
      await fetch(`${API_BASE}/users/${orderData.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentDetails: updatedCards })
      });
      setPaymentDetails(updatedCards);
      setSelectedCardIndex(updatedCards.length - 1);
      setPaymentMethod("card");
      setShowCardModal(false);
      setNewCard({ cardType: "", cardName: "", cardNumber: "", expiry: "", cvv: "" });
      toast.success("Card saved successfully");
    } catch (err) {
      console.error(err);
    }
  }

  function handleExpiryChange(e) {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
    setNewCard({ ...newCard, expiry: val });
  }

  function handleVerifyUpi() {
    if (/^[\w.-]+@[\w.-]+$/.test(upiId)) {
      setUpiVerified(true);
      setShowUpiModal(false);
      toast.success("UPI verified!");
    } else {
      toast.error("Invalid UPI ID");
    }
  }

  async function handlePayNow() {
    if (!canPay()) return;
    setIsProcessing(true);

    let paymentInfo = {};
    if (paymentMethod === "card") {
      paymentInfo = paymentDetails[selectedCardIndex];
    } else if (paymentMethod === "upi") {
      paymentInfo = { method: "UPI", upiId };
    } else if (paymentMethod === "cod") {
      paymentInfo = { method: "Cash on Delivery" };
    }

    const now = new Date();
    const orderedDate = now.toISOString().split("T")[0];
    const orderedDay = now.toLocaleDateString("en-US", { weekday: "long" });

    const newOrder = {
      id: Date.now(),
      userId: orderData.userId,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      tax: orderData.tax,
      total: orderData.total,
      address: orderData.address,
      deliveryDate: orderData.deliveryDate,
      paymentMethod: paymentInfo,
      orderedDate,
      orderedDay,
      orderedTime: now.toISOString(),
      status: "Ordered"
    };

    try {
      const res = await fetch(`${API_BASE}/users/${orderData.userId}`);
      const user = await res.json();
      const updatedOrders = [...(user.orders || []), newOrder];

      await fetch(`${API_BASE}/users/${orderData.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: updatedOrders })
      });

      toast.success("Order placed successfully!");
      sessionStorage.setItem("lastOrderId", newOrder.id);
      navigate("/order-confirmation", { state: { orderId: newOrder.id } });
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order.");
    } finally {
      setIsProcessing(false);
      setShowConfirmModal(false);
    }
  }

  function canPay() {
    if (paymentMethod === "card") return selectedCardIndex !== null;
    if (paymentMethod === "upi") return upiVerified;
    if (paymentMethod === "cod") return true;
    return false;
  }

  function payNowLabel() {
    if (paymentMethod === "card") return `Pay ₹${orderData.total} with Card`;
    if (paymentMethod === "upi") return `Pay ₹${orderData.total} via UPI`;
    if (paymentMethod === "cod") return `Confirm Cash on Delivery`;
    return "Pay Now";
  }

  return (
  <div className="o-payment-container">
    <div className="o-payment-top-row">
      <div className="o-top-right"></div>
    </div>

    <div className="o-payment-main">
      <PaymentOptions
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        paymentDetails={paymentDetails}
        selectedCardIndex={selectedCardIndex}
        setSelectedCardIndex={setSelectedCardIndex}
        showCardModal={showCardModal}
        setShowCardModal={setShowCardModal}
        showUpiModal={showUpiModal}
        setShowUpiModal={setShowUpiModal}
        newCard={newCard}
        setNewCard={setNewCard}
        handleSaveCard={handleSaveCard}
        handleExpiryChange={handleExpiryChange}
        upiId={upiId}
        setUpiId={setUpiId}
        handleVerifyUpi={handleVerifyUpi}
      />

      <OrderRecap
        orderData={orderData}
        canPay={canPay}
        isProcessing={isProcessing}
        payNowLabel={payNowLabel}
        handlePayNow={() => setShowConfirmModal(true)}
        paymentMethod={paymentMethod}
        navigate={navigate}
        upiVerified={upiVerified}
        upiId={upiId}
        selectedCardIndex={selectedCardIndex}
        paymentDetails={paymentDetails}
      />
    </div>

    {showConfirmModal && (
      <ConfirmModal
        orderData={orderData}
        paymentMethod={paymentMethod}
        upiId={upiId}
        selectedCardIndex={selectedCardIndex}
        paymentDetails={paymentDetails}
        onConfirm={handlePayNow}
        onCancel={() => setShowConfirmModal(false)}
      />
    )}
  </div>
);
}
