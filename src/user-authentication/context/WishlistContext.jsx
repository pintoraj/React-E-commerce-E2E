import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const { user, login } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (user && user.wishlist) {
      setWishlist(user.wishlist);
    } else {
      setWishlist([]);
    }
  }, [user]);

  function persistWishlist(newWishlist) {
    if (user && user.id) {
      fetch(`http://localhost:3001/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishlist: newWishlist })
      }).then(() => {
        login({ ...user, wishlist: newWishlist });
      });
    }
  }

  function addToWishlist(product) {
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) return prev;
      const updated = [...prev, product];
      persistWishlist(updated);
      return updated;
    });
  }

  function removeFromWishlist(id) {
    setWishlist(prev => {
      const updated = prev.filter(item => item.id !== id);
      persistWishlist(updated);
      return updated;
    });
  }

  function clearWishlist() {
    setWishlist([]);
    persistWishlist([]);
  }

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
