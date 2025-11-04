import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PaymentOptions from "./PaymentOptions";
import OrderRecap from "./OrderRecap";
import ConfirmModal from "./ConfirmModal";
import "./payment.css";
import "./ConfirmModal.css";
import { toast } from "react-hot-toast";
import { useAuth } from "../user-authentication/context/AuthContext";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const orderData = location.state?.orderData;

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

  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const alreadyPlaced = sessionStorage.getItem("orderPlaced") === "true";
    if (alreadyPlaced) {
      toast.error("Order already placed. Redirecting...");
      navigate("/orders", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!orderData || !orderData.userId || !orderData.items?.length) {
      toast.error("Invalid access. Redirecting to checkout.");
      navigate("/checkout");
    }
  }, [orderData, navigate]);

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
    if (orderData?.userId && token) {
      fetch(`${API_BASE}/users/${orderData.userId}/cards`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject("Unauthorized"))
        .then(data => {
          setPaymentDetails(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error("Failed to fetch cards:", err);
          toast.error("Unable to load saved cards.");
        });
    }
  }, [orderData?.userId, token]);

  async function handleSaveCard(e) {
    e.preventDefault();
    const { cardType, cardName, cardNumber, expiry, cvv } = newCard;

    if (!cardType || !/^[A-Za-z\s]+$/.test(cardName) || !/^\d{16}$/.test(cardNumber) ||
        !/^\d{2}\/\d{2}$/.test(expiry) || !/^\d{3}$/.test(cvv)) {
      toast.error("Please fill all fields correctly.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users/${orderData.userId}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cardType, cardName, cardNumber, expiry, cvv })
      });

      if (!res.ok) throw new Error("Failed to save card");
      const updatedCards = await res.json();

      setPaymentDetails(updatedCards);
      setSelectedCardIndex(updatedCards.length - 1);
      setPaymentMethod("card");
      setShowCardModal(false);
      setNewCard({ cardType: "", cardName: "", cardNumber: "", expiry: "", cvv: "" });
      toast.success("Card saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save card.");
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

  const now = new Date();

  const masked = paymentDetails[selectedCardIndex]?.cardMasked || "**** **** **** XXXX";
  const paymentMethodString =
    paymentMethod === "card"
      ? `${paymentDetails[selectedCardIndex].cardType} - ${masked} (Exp: ${paymentDetails[selectedCardIndex].expiry})`
      : paymentMethod === "upi"
      ? `UPI ID: ${upiId}`
      : "Cash on Delivery";

  const formattedAddress = formatAddress(orderData.address);

  // ✅ Transform items to ensure productId is present
  const transformedItems = orderData.items.map(item => ({
    productId: item.productId || item.id,
    name: item.name || item.title,
    price: item.price,
    qty: item.qty || item.quantity,
    unit: item.unit,
    brand: item.brand,
    category: item.category,
    sku: item.sku,
    description: item.description,
    image: item.image
  }));

  const payload = {
    ...orderData,
    items: transformedItems, // ✅ Use transformed items
    address: formattedAddress,
    paymentMethod: paymentMethodString,
    orderedDate: now.toISOString().split("T")[0],
    orderedDay: now.toLocaleDateString("en-US", { weekday: "long" }),
    orderedTime: now.toISOString(),
    status: "Ordered"
  };

  console.log("Payload being sent:", payload);

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Order failed");
    const orderId = await res.json();

    toast.success("Order placed successfully!");
    sessionStorage.setItem("lastOrderId", orderId);
    sessionStorage.setItem("orderPlaced", "true");
    navigate("/order-confirmation", { state: { orderId } });
  } catch (err) {
    console.error(err);
    toast.error("Failed to place order.");
  } finally {
    setIsProcessing(false);
    setShowConfirmModal(false);
  }
}


  function formatAddress(addr) {
    if (!addr || typeof addr === "string") return addr;
    return `${addr.name}, ${addr.line}, ${addr.city} - ${addr.pincode}, Ph: ${addr.phone}`;
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
