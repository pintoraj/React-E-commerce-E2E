import React, { useState, useEffect } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Notification from "../../user-authentication/components/Notification/Notification";
import { addToWishlist } from "../api/productApi";
import { useAuth } from "../../user-authentication/context/AuthContext";
import { useWishlist } from "../../user-authentication/context/WishlistContext";
import { useCart } from "../../user-authentication/context/CartContext";
import "./css/ProductCard.css";


const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [notif, setNotif] = useState({ message: "", type: "info", visible: false });
  const [wishlisted, setWishlisted] = useState(false);

  const { user, token, isAuthenticated } = useAuth();
  const { wishlist, addToWishlist: addToWishlistContext } = useWishlist();
  const { addToCart } = useCart(); // ✅ NEW

  useEffect(() => {
    const alreadyWishlisted = wishlist.some(item => item.id === product.id);
    setWishlisted(alreadyWishlisted);
  }, [wishlist, product.id]);

  const showNotif = (message, type = "success") => {
    setNotif({ message, type, visible: true });
    setTimeout(() => setNotif((v) => ({ ...v, visible: false })), 1500);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated || !user?.id || !token) {
      showNotif("Please log in to add to cart", "error");
      return;
    }

    try {
      addToCart(product); 
      showNotif("Added to cart!", "success");
    } catch (error) {
      showNotif("Failed to add to cart", "error");
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    if (wishlisted) {
      showNotif("Already in wishlist", "info");
      return;
    }

    if (!isAuthenticated || !user?.id || !token) {
      showNotif("Please log in to use wishlist", "error");
      return;
    }

    try {
      await addToWishlist(user.id, product.id, token);
      addToWishlistContext(product);
      setWishlisted(true);
      showNotif("Added to wishlist!", "success");
    } catch (error) {
      showNotif("Failed to add to wishlist", "error");
    }
  };


  return (
    <>
      <div
        className={`p-product-card ${isHovered ? "hovered" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      <Link to={`/product/${product.id}`} className="p-image-link">
        <div className="p-image-container">
          <img
            src={
              isHovered && product.images?.[0]
                ? product.images[0]
                : product.thumbnail
            }
            alt={product.title} // ❇️ FIX: Use product.name
            className="p-product-image"
          />
          <div className="p-image-overlay" />
          <div className="p-action-buttons">
            <button
              onClick={handleAddToCart}
              className="p-icon-button"
              title="Add to Cart"
            >
              <ShoppingCart size={18} />
            </button>
            <button
              onClick={handleAddToWishlist}
              className={`p-icon-button ${wishlisted ? "wishlisted" : ""}`}
              title={wishlisted ? "Already in wishlist" : "Add to Wishlist"}
              disabled={wishlisted}
            >
              <Heart size={18} fill={wishlisted ? "#333" : "none"} />
            </button>
          </div>
        </div>
         </Link>

        <div className="p-product-info">
          <div className="p-product-meta">
            <p className="p-category">{product.category}</p>
            <div className="p-rating">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`p-star ${i < Math.round(product.averageRating) ? "filled" : ""}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.445a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.366-2.445a1 1 0 00-1.175 0l-3.366 2.445c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.051 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                </svg>
              ))}
            </div>
          </div>
        <Link to={`/product/${product.id}`} className="p-title-link">
          <h3 className="p-title">{product.title}</h3> {/* ❇️ FIX: Use product.name */}
        </Link>
          <div className="p-price-stock">
            <span className="p-price">₹{product.price}</span>
            {product.stock > 0 ? (
              product.stock <= 10 ? (
                <span className="p-stock-warning">only {product.stock} left</span>
              ) : (
                <span className="p-stock">{product.stock} {product.unit || "in stock"}</span>
              )
            ) : (
              <span className="p-out-of-stock">Out Of Stock</span>
            )}
          </div>
        </div>
      </div>

      <Notification message={notif.message} type={notif.type} visible={notif.visible} />
    </>
  );
};

export default ProductCard;