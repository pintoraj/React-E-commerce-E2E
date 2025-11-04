import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./checkout.css";
import AddressList from "./AddressList";
import OrderSummary from "./OrderSummary";
import { toast } from "react-hot-toast";
import { useAuth } from "../user-authentication/context/AuthContext";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const rightColRef = useRef(null);

  const { token } = useAuth();
  const cartItems = location.state?.cartItems || [];
  const userId = location.state?.userId;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: "",
    phone: "",
    line: "",
    city: "",
    pincode: "",
  });

  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL.replace(/\/api$/, "");

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses(autoSelectLast = false) {
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/addresses`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch addresses");
      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);

      // ✅ Auto-select the last address if requested
      if (autoSelectLast && Array.isArray(data) && data.length > 0) {
        const last = data[data.length - 1];
        setSelectedAddressId(last.id);
      }
    } catch (e) {
      console.error("Address fetch error:", e);
      toast.error("Failed to load addresses. Please try again.");
    }
  }

  useEffect(() => {
    if (selectedAddressId) {
      const today = new Date();
      const dates = [];
      for (let i = 2; i <= 4; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push({
          value: d.toISOString().split("T")[0],
          label: d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric"
          })
        });
      }
      setAvailableDates(dates);
      setSelectedDate(dates[0]?.value || "");
      rightColRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedAddressId]);

  function calcSubtotal() {
    return cartItems.reduce(
      (s, it) => s + (it.price || 0) * (it.qty || 1),
      0
    );
  }

  async function handleAddAddress(e) {
    e.preventDefault();

    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const pincodeRegex = /^[0-9]{6}$/;

    if (!nameRegex.test(newAddr.name)) {
      alert("Name should contain only alphabets and spaces.");
      return;
    }
    if (!phoneRegex.test(newAddr.phone)) {
      alert("Phone number should be exactly 10 digits.");
      return;
    }
    if (!pincodeRegex.test(newAddr.pincode)) {
      alert("Pincode should be exactly 6 digits.");
      return;
    }

    const addr = {
      name: newAddr.name,
      phone: newAddr.phone,
      line: newAddr.line,
      city: newAddr.city,
      pincode: newAddr.pincode
    };

    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(addr)
      });

      if (!res.ok) throw new Error("Failed to save address");

      setNewAddr({ name: "", phone: "", line: "", city: "", pincode: "" });
      setShowAdd(false);
      await fetchAddresses(true); // ✅ Refresh and auto-select latest
    } catch (err) {
      console.error("Address save error:", err);
      toast.error("Failed to save address. Please try again.");
    }
  }

  function handleProceed() {
  const selected = addresses.find((a) => a.id === selectedAddressId) || null;

  const subtotal = calcSubtotal();
  const shipping = cartItems.length > 0 ? 3.99 : 0;
  const tax = cartItems.length > 0 ? 2.0 : 0;
  const total = subtotal + shipping + tax;

  // ✅ Transform cartItems to include productId and snapshot fields
  const items = cartItems.map(item => ({
    productId: item.productId || item.id, // ✅ Ensure productId is present
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
    userId,
    items,
    subtotal,
    shipping,
    tax,
    total,
    address: selected,
    deliveryDate: selectedDate
  };

  // ✅ Pass transformed items to payment
  navigate("/payment", {
    state: {
      orderData: payload,
      cartItems: items
    }
  });
}



  useEffect(() => {
    if (showAdd) {
      const firstInput = document.querySelector(".o-modal-card input");
      firstInput?.focus();
      const handleEsc = (e) => e.key === "Escape" && setShowAdd(false);
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [showAdd]);

  const visibleAddresses = addresses.slice(0, 2);
  const extraAddresses = addresses.slice(2);

  return (
    <div className="o-checkout-container">
      <div className="o-checkout-top-row">
        <div className="o-top-right"></div>
      </div>

      <div className="o-checkout-main">
        <div className="o-checkout-left">
          <AddressList
            addresses={visibleAddresses}
            extraAddresses={extraAddresses}
            selectedAddressId={selectedAddressId}
            setSelectedAddressId={setSelectedAddressId}
            onAdd={() => setShowAdd(true)}
          />
        </div>

        <div className="o-checkout-right" ref={rightColRef}>
          <OrderSummary
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            availableDates={availableDates}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            showDateDropdown={showDateDropdown}
            setShowDateDropdown={setShowDateDropdown}
            cartItems={cartItems}
            calcSubtotal={calcSubtotal}
            onProceed={handleProceed}
          />
        </div>
      </div>

      {showAdd && (
        <div className="o-modal">
          <form className="o-modal-card" onSubmit={handleAddAddress}>
            <h4>Add Address</h4>

            <input
              required
              placeholder="Name"
              value={newAddr.name}
              onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
              pattern="^[A-Za-z\s]+$"
              title="Name should contain only alphabets and spaces"
            />

            <input
              required
              placeholder="Phone"
              value={newAddr.phone}
              onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
              pattern="^[0-9]{10}$"
              title="Phone number should be exactly 10 digits"
            />

            <input
              required
              placeholder="Address line"
              value={newAddr.line}
              onChange={(e) => setNewAddr({ ...newAddr, line: e.target.value })}
            />

            <input
              required
              placeholder="City"
              value={newAddr.city}
              onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
              pattern="^[A-Za-z\s]+$"
              title="City should contain only alphabets and spaces"
            />

            <input
              required
              placeholder="Pincode"
              value={newAddr.pincode}
              onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
              pattern="^[0-9]{6}$"
              title="Pincode should be exactly 6 digits"
            />

            <div className="o-modal-actions">
              <button type="button" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
