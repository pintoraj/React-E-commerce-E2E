import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateInvoice(order) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // 🔍 Parse flat address string
  function parseAddressString(addrStr) {
    if (!addrStr || typeof addrStr !== "string") return { name: "N/A", line: "", city: "", pincode: "", phone: "N/A" };

    const nameMatch = addrStr.match(/^([^,]+)/);
    const phoneMatch = addrStr.match(/Ph:\s*(\d+)/);
    const pincodeMatch = addrStr.match(/-\s*(\d{6})/);
    const lineCityMatch = addrStr.match(/,\s*(.+?)\s*-/);

    return {
      name: nameMatch?.[1]?.trim() || "N/A",
      line: lineCityMatch?.[1]?.split(",")[0]?.trim() || "",
      city: lineCityMatch?.[1]?.split(",")[1]?.trim() || "",
      pincode: pincodeMatch?.[1] || "",
      phone: phoneMatch?.[1] || "N/A"
    };
  }

  // 🔍 Parse flat payment method string
  function parsePaymentString(pmStr) {
    if (!pmStr || typeof pmStr !== "string") return { method: "N/A" };

    if (pmStr.toLowerCase().includes("upi")) {
      return { method: "UPI", upiId: pmStr.split(":")[1]?.trim() || "N/A" };
    }

    if (pmStr.toLowerCase().includes("cash")) {
      return { method: "Cash on Delivery" };
    }

    const cardMatch = pmStr.match(/(Visa|MasterCard|RuPay|Amex|Card)\s*-\s*(\*{4}.*\d{4})/);
    const expiryMatch = pmStr.match(/Exp:\s*(\d{2}\/\d{2})/);

    return {
      method: "Card",
      cardType: cardMatch?.[1] || "Card",
      cardMasked: cardMatch?.[2] || "**** **** **** XXXX",
      expiry: expiryMatch?.[1] || "N/A"
    };
  }

  const address = parseAddressString(order.address);
  const payment = parsePaymentString(order.paymentMethod);
  const placedDate = new Date(order.orderedTime);
  const deliveryFee = order.shipping || 0;
  const tax = order.tax || 0;
  const discount = order.discount || 0;
  const subtotal = order.subtotal || (order.items || []).reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0);
  const total = order.total || subtotal + deliveryFee + tax - discount;

  // ====== HEADER ======
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("E4Everything", 14, 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("www.e4everything.com", 14, 21);
  doc.text("support@cognizant.com", 14, 26);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - 14, 15, { align: "right" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - 14, 22, { align: "right" });
  doc.text(`Invoice ID: ${order.id}`, pageWidth - 14, 27, { align: "right" });

  doc.setDrawColor(180);
  doc.line(14, 30, pageWidth - 14, 30);

  // ====== CUSTOMER & ORDER DETAILS ======
  let yPos = 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Customer Details", 14, yPos);
  doc.text("Order Details", pageWidth / 2, yPos);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  yPos += 6;
  doc.text([
    `Name: ${address.name}`,
    `Address: ${address.line}, ${address.city} - ${address.pincode}`,
    `Phone: ${address.phone}`
  ].join('\n'), 14, yPos);

  const orderDetails = [
    `Order ID: ${order.id}`,
    `Placed On: ${placedDate.toLocaleDateString()} ${placedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    `Status: ${order.status}`,
    `Payment Method: ${payment.method}`
  ];

  if (payment.cardMasked) orderDetails.push(`Card: ${payment.cardMasked}`);
  if (payment.cardType) orderDetails.push(`Card Type: ${payment.cardType}`);
  if (payment.expiry) orderDetails.push(`Expiry: ${payment.expiry}`);
  if (payment.upiId) orderDetails.push(`UPI ID: ${payment.upiId}`);

  doc.text(orderDetails.join('\n'), pageWidth / 2, yPos);

  // ====== ITEMIZED TABLE ======
  const tableRows = (order.items || []).map(item => [
    item.name || "Unnamed Item",
    item.qty?.toString() || "0",
    `Rs. ${item.price?.toFixed(2) || "0.00"}`,
    `Rs. ${((item.qty || 0) * (item.price || 0)).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: yPos + 30,
    head: [["Item", "Qty", "Price", "Subtotal"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [95, 106, 242],
      textColor: 255,
      halign: "center",
      fontStyle: "bold"
    },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" }
    },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  // ====== SUMMARY SECTION ======
  let finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Summary", pageWidth - 14, finalY, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  finalY += 6;
  doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, pageWidth - 14, finalY, { align: "right" });
  finalY += 6;
  doc.text(`Shipping: Rs. ${deliveryFee.toFixed(2)}`, pageWidth - 14, finalY, { align: "right" });
  finalY += 6;
  doc.text(`Tax: Rs. ${tax.toFixed(2)}`, pageWidth - 14, finalY, { align: "right" });
  finalY += 6;
  doc.text(`Discount: Rs. ${discount.toFixed(2)}`, pageWidth - 14, finalY, { align: "right" });

  finalY += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Total Paid: Rs. ${total.toFixed(2)}`, pageWidth - 14, finalY, { align: "right" });

  // ====== FOOTER ======
  finalY += 20;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Thank you for shopping with E4Everything!", pageWidth / 2, finalY, { align: "center" });
  doc.text("Need help? Reach us at support@cognizant.com", pageWidth / 2, finalY + 6, { align: "center" });
  doc.text("This invoice is system-generated and does not require a signature.", pageWidth / 2, finalY + 12, { align: "center" });

  doc.setDrawColor(200);
  doc.line(14, finalY + 18, pageWidth - 14, finalY + 18);

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Terms: All sales are final. For returns or disputes, contact support within 7 days.", pageWidth / 2, finalY + 24, { align: "center" });

  doc.save(`Invoice_${order.id}.pdf`);
}
