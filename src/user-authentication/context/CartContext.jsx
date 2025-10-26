import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const { user, login } = useAuth();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (user && user.cart) {
      setCart(user.cart);
    } else {
      setCart([]);
    }
  }, [user]);

  function persistCart(newCart) {
    if (user && user.id) {
      fetch(`http://localhost:3001/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: newCart })
      }).then(() => {
        login({ ...user, cart: newCart });
      });
    }
  }

  function addToCart(product) {
    setCart(prev => {
      const found = prev.find(item => item.id === product.id);
      let updated;
      if (found) {
        updated = prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        updated = [...prev, { ...product, quantity: 1 }];
      }
      persistCart(updated);
      return updated;
    });
  }

  function removeFromCart(id) {
    setCart(prev => {
      const updated = prev.filter(item => item.id !== id);
      persistCart(updated);
      return updated;
    });
  }

  function updateQuantity(id, quantity) {
    setCart(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, quantity } : item);
      persistCart(updated);
      return updated;
    });
  }

  function clearCart() {
    setCart([]);
    persistCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
