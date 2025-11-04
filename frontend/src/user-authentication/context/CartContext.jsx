import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  addToUserCart,
  updateCartItem,
  removeFromUserCart,
  clearUserCart,
  getUserCart
} from '../../product-management/api/productApi';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const { user, login, token } = useAuth();
  const [cart, setCart] = useState([]);

  // ✅ Sync cart on login or token change
  useEffect(() => {
    if (user?.id && token) {
      fetchUserCart();
    } else {
      setCart([]);
    }
  }, [user?.id, token]);

  // ✅ Fetch cart from backend
  async function fetchUserCart() {
    if (!user?.id || !token) return;
    try {
      const latest = await getUserCart(user.id, token);
      const transformed = latest.map(item => ({
        id: item.id,
        title: item.title,
        thumbnail: item.thumbnail,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
        brand: item.brand,
        unit: item.unit
      }));
      setCart(transformed);
      login({ user: { ...user, cart: transformed }, token });
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  }

  // ✅ Add product to cart (supports normal and reorder flows)
  async function addToCart(product) {
    if (!user?.id || !token) return;
    try {
      if (product.productId) {
        // ✅ Reorder flow: use productId from previous order
        await addToUserCart(user.id, product.productId, token);
      } else if (product.id && typeof product.id === "string") {
        // ✅ Normal flow: use product.id
        await addToUserCart(user.id, product.id, token);
      } else {
        // Fallback: send full product object
        await addToUserCart(user.id, product, token);
      }
      await fetchUserCart();
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  }

  // ✅ Update quantity
  async function updateQuantity(id, quantity) {
    if (!user?.id || !token) return;
    try {
      await updateCartItem(user.id, id, quantity, token);
      await fetchUserCart();
    } catch (error) {
      console.error("Update quantity failed:", error);
    }
  }

  // ✅ Remove item from cart
  async function removeFromCart(id) {
    if (!user?.id || !token) return;
    try {
      await removeFromUserCart(user.id, id, token);
      await fetchUserCart();
    } catch (error) {
      console.error("Remove from cart failed:", error);
    }
  }

  // ✅ Clear entire cart
  async function clearCart() {
    if (!user?.id || !token) return;
    try {
      await clearUserCart(user.id, token);
      await fetchUserCart();
    } catch (error) {
      console.error("Clear cart failed:", error);
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchUserCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
