import React, { useState } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "../../user-authentication/context/CartContext";
import { useWishlist } from "../../user-authentication/context/WishlistContext";
import { useAuth } from "../../user-authentication/context/AuthContext";
import Notification from "../../user-authentication/components/Notification/Notification";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [notif, setNotif] = useState({ message: "", type: "info", visible: false });

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { user, login } = useAuth();

  const inCart = user?.cart?.some((item) => item.id === product.id);
  const inWishlist = user?.wishlist?.some((item) => item.id === product.id);

  const showNotif = (message, type = "success") => {
    setNotif({ message, type, visible: true });
    setTimeout(() => setNotif((v) => ({ ...v, visible: false })), 1500);
  };

  const handleAddToCart = async () => {
    if (!user) {
      showNotif("Please login to add items", "error");
      return;
    }
    if (inCart) {
      showNotif("Already in cart", "info");
      return;
    }

    const updatedCart = [...(user.cart || []), { ...product, quantity: 1 }];
    addToCart(product);

    await fetch(`/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: updatedCart }),
    });

    login({ ...user, cart: updatedCart });
    showNotif("Added to cart ✅", "success");
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      showNotif("Please login to add items", "error");
      return;
    }
    if (inWishlist) {
      showNotif("Already in wishlist", "info");
      return;
    }

    const updatedWishlist = [...(user.wishlist || []), product];
    addToWishlist(product);

    await fetch(`//${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wishlist: updatedWishlist }),
    });

    login({ ...user, wishlist: updatedWishlist });
    showNotif("Added to wishlist ❤️", "success");
  };

  return (
    <>
      <div
        className={`p-product-card ${isHovered ? "hovered" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-image-container">
          <img
            src={
              isHovered && product.productThumbnail?.[0]
                ? `/${product.productThumbnail}`
                : product.productThumbnail
            }
            alt={product.productName}
            className="p-product-image"
          />
          <div className="p-image-overlay" />
          <div className="p-action-buttons">
            <button
              onClick={handleAddToCart}
              disabled={inCart}
              className={`p-icon-button ${inCart ? "disabled" : ""}`}
              title={inCart ? "Already in Cart" : "Add to Cart"}
            >
              <ShoppingCart size={18} />
            </button>
            <button
              onClick={handleAddToWishlist}
              disabled={inWishlist}
              className={`p-icon-button ${inWishlist ? "disabled" : ""}`}
              title={inWishlist ? "Already in Wishlist" : "Add to Wishlist"}
            >
              <Heart size={18} />
            </button>
          </div>
        </div>

        <div className="p-product-info">
          <div className="p-product-meta">
            <p className="p-category">{product.categoryName}</p>
            <div className="p-rating">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`p-star ${i < Math.round(product.productRating) ? "filled" : ""}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.445a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.366-2.445a1 1 0 00-1.175 0l-3.366 2.445c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.051 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                </svg>
              ))}
            </div>
          </div>

          <h3 className="p-title">{product.productName}</h3>

          <div className="p-price-stock">
            <span className="p-price">₹{product.productPrice}</span>
            {product.productStock > 0 ? (
              product.productStock <= 10 ? (
                <span className="p-stock-warning">only {product.productStock} left</span>
              ) : (
                <span className="p-stock">{product.productStock} in stock</span>
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
