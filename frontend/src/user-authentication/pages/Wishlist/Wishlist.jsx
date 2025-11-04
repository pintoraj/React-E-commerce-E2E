import React, { useEffect } from 'react';
import './Wishlist.css';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL.replace(/\/api$/, ''); // strips `/api` to get base URL

const Wishlist = () => {
  const {
    wishlist,
    removeFromWishlistAndSync,
    fetchUserWishlist
  } = useWishlist();

  const { addToCart } = useCart();

  useEffect(() => {
    fetchUserWishlist();
  }, []);

  function handleAddToCart(product) {
    addToCart(product);
    removeFromWishlistAndSync(product.id);
    toast.success(`${product.title || product.name} moved to cart`);
  }

  function handleRemoveFromWishlist(id) {
    removeFromWishlistAndSync(id);
    toast.success("Item removed from wishlist");
  }

  if (wishlist.length === 0) {
    return (
      <div className="u-wishlist-container">
        <div className="u-empty-wishlist">
          <h2>Your wishlist is empty</h2>
          <p>Add items you love to your wishlist to save them for later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="u-wishlist-container">
      <h1 className="u-wishlist-title">
        Your Wishlist <span className="u-wishlist-count">{wishlist.length} items</span>
      </h1>
      <div className="u-wishlist-items">
        {wishlist.map((product) => (
          <div key={product.id} className="u-wishlist-item">
            <div className="u-wishlist-item-image">
              <img
                src={`${API_BASE}/uploads/${product.thumbnail}`}
                alt={product.title}
                onError={(e) => { e.target.src = '/images/default.jpg'; }}
              />
            </div>
            <div className="u-wishlist-item-details">
              <h3 className="u-wishlist-item-title">{product.title}</h3>
              <p className="u-wishlist-item-price">
                ₹{Number(product.price || 0).toFixed(2)}
              </p>
              {product.description && (
                <p className="u-wishlist-item-desc">{product.description}</p>
              )}
              <div className="u-wishlist-item-actions">
                <button className="u-btn u-btn-primary" onClick={() => handleAddToCart(product)}>
                  Add to Cart
                </button>
                <button className="u-btn u-btn-outline" onClick={() => handleRemoveFromWishlist(product.id)}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
