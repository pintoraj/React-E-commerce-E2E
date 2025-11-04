import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  addToWishlist as addToWishlistAPI,
  removeFromUserWishlist,
  getUserWishlist
} from '../../product-management/api/productApi';

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const { user, token } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // ✅ Sync wishlist from backend when user changes
  useEffect(() => {
    if (user?.id && token) {
      fetchUserWishlist();
    } else {
      setWishlist([]);
    }
  }, [user, token]);

  // ✅ Add product to wishlist and backend
  function addToWishlist(product) {
    if (!user?.id || !token) return;

    const alreadyExists = wishlist.some(item => item.id === product.id);
    if (alreadyExists) return;

    const updated = [...wishlist, product];
    setWishlist(updated);

    addToWishlistAPI(user.id, product.id, token)
      .catch(err => {
        console.error("Add to wishlist failed:", err);
        setWishlist(prev => prev.filter(item => item.id !== product.id)); // rollback
      });
  }

  // ✅ Remove product locally
  function removeFromWishlist(id) {
    setWishlist(prev => prev.filter(item => item.id !== id));
  }

  // ✅ Remove product and sync with backend
  function removeFromWishlistAndSync(id) {
    if (!user?.id || !token) return;

    const updated = wishlist.filter(item => item.id !== id);
    setWishlist(updated);

    removeFromUserWishlist(user.id, id, token)
      .then(() => fetchUserWishlist())
      .catch(err => {
        console.error("Remove from wishlist failed:", err);
        setWishlist(prev => [...prev]); // fallback to previous state
      });
  }

  // ✅ Fetch wishlist from backend
  async function fetchUserWishlist() {
    if (!user?.id || !token) return;
    try {
      const latest = await getUserWishlist(user.id, token);
      setWishlist(latest);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  }

  // ✅ Clear wishlist locally
  function clearWishlist() {
    setWishlist([]);
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        removeFromWishlistAndSync,
        clearWishlist,
        fetchUserWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
