import fetch from "node-fetch";

await new Promise(resolve => setTimeout(resolve, 3000));

const BASE_URL = "http://localhost:3001/users";

async function updateStatuses() {
  try {
    const res = await fetch(BASE_URL);
    const users = await res.json();
    const now = new Date();

    for (const user of users) {
      const updatedOrders = [];

      for (const order of user.orders || []) {
        if (order.status === "Cancelled") {
          updatedOrders.push(order);
          continue;
        }

        const placed = new Date(order.orderedTime);
        const delivery = new Date(order.deliveryDate);
        const diffSeconds = (now - placed) / 1000;

        let newStatus = order.status;

        if (now.toDateString() === delivery.toDateString()) {
          newStatus = "Delivered";
        } else if (diffSeconds >= 3600) {
          newStatus = "Out for Delivery";
        } else if (diffSeconds >= 1800) {
          newStatus = "Shipped";
        } else {
          newStatus = "Ordered";
        }

        updatedOrders.push({ ...order, status: newStatus });
      }

      await fetch(`${BASE_URL}/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: updatedOrders })
      });
    }
  } catch (err) {
    // silently fail
  }
}

setInterval(updateStatuses, 5 * 60 * 1000);
updateStatuses();
