import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Star, Heart } from "lucide-react";
// 🛑 FIX: Adjust this path to match your project structure!
import { useAuth } from "../../user-authentication/context/AuthContext";
// 🛑 FIX: Adjust this path to match your project structure!
import { useCart } from "../../user-authentication/context/CartContext";
// 🛑 FIX: Adjust this path to match your project structure!
import { useWishlist } from "../../user-authentication/context/WishlistContext";
// 🛑 FIX: Adjust this path to match your project structure!
import { fetchProductById } from "../api/productApi";
// 🛑 FIX: Adjust this path to match your project structure!
import ProductReviews from "./ProductReviews";
// 🛑 FIX: Adjust this path to match your project structure!
import ProductSpecs from "./ProductSpecs"; // 🆕 Import Specs
// 🛑 FIX: Adjust this path to match your project structure!
import "./css/ProductDetailPage.css";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { addToCart } = useCart();

  // 🆕 Get wishlist function
  const { addToWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    if (!productId) {
      setError("No product ID provided.");
      setLoading(false);
      return;
    }

    const getProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProductById(productId);

        if (data) {
          setProduct(data);
        } else {
          setError("Product not found.");
          toast.error("Product not found.");
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Failed to fetch product. Please try again.");
        toast.error("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [productId]);

  // ❇️ --- FIX IS HERE --- ❇️
  // Manually build the object instead of spreading ...product
  const handleAddToCart = () => {
    if (!user || !token) {
      toast.error("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    try {
      // ❇️ Manually map 'name' to 'title' to match context
      const itemToAdd = {
        id: product.id,
        productId: product.id,
        title: product.name, // ⬅️ THE FIX
        price: product.price,
        thumbnail: product.thumbnail,
        quantity: quantity,
        unit: product.unit,
        brand: product.brand,
        category: product.category,
        sku: product.sku,
        description: product.description,
        stock: product.stock
      };

      addToCart(itemToAdd);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error(err.message || "Failed to add item to cart.");
    }
  };

  // 🆕 --- ADD TO WISHLIST FUNCTION --- 🆕
  // Apply the same fix: map 'name' to 'title'
  const handleAddToWishlist = () => {
    if (!user || !token) {
      toast.error("Please log in to update your wishlist.");
      navigate("/login");
      return;
    }

    try {
      // ❇️ Manually map 'name' to 'title' to match context
      const itemToWishlist = {
        id: product.id,
        productId: product.id,
        title: product.name, // ⬅️ THE FIX
        price: product.price,
        thumbnail: product.thumbnail,
        unit: product.unit,
        brand: product.brand,
        category: product.category,
        sku: product.sku,
        description: product.description,
        stock: product.stock
      };

      // Call the function from your WishlistContext
      addToWishlist(itemToWishlist);
      toast.success(`${product.name} added to wishlist!`);
    } catch (err) {
      console.error("Add to wishlist error:", err);
      toast.error(err.message || "Failed to add item to wishlist.");
    }
  };


  const renderStars = (rating) => {
    if (!rating) return <span className="p-no-rating">No ratings yet</span>;
    return (
      <div className="p-star-rating">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={18}
            className={i < rating ? "filled" : ""}
          />
        ))}
        <span className="p-rating-text">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return <p className="p-detail-message">Loading product details...</p>;
  }

  if (error) {
    return <p className="p-detail-message">{error}</p>;
  }

  if (!product) {
    return <p className="p-detail-message">Product not found.</p>;
  }

  return (
    <div className="p-detail-wrapper">
      <Toaster position="bottom-right" />
      <div className="p-detail-page">
        <div className="p-detail-main-content">
          <div className="p-detail-image-gallery">
            <img
              src={product.thumbnail}
              alt={product.name}
              className="p-detail-main-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/default-product.jpg";
              }}
            />
          </div>

          <div className="p-detail-info">
            <h2 className="p-detail-title">{product.name}</h2>
            {product.brand && <p className="p-detail-brand">Brand: {product.brand}</p>}

            {renderStars(product.averageRating)}

            <p className="p-detail-price">₹{product.price?.toFixed(2)}</p>
            {product.stock > 0 ? (
              <p className="p-detail-stock-in">In Stock (Only {product.stock} left!)</p>
            ) : (
              <p className="p-detail-stock-out">Out of Stock</p>
            )}

            <div className="p-detail-actions">
              <div className="p-quantity-selector">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={product.stock === 0}
                />
              </div>
              <button
                className="p-add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              {/* 🆕 Add to Wishlist Button */}
              <button
                className="p-add-to-wishlist-btn"
                onClick={handleAddToWishlist}
                title="Add to Wishlist"
              >
                <Heart size={20} />
              </button>

            </div>
          </div>
        </div>

        {/* Tabbed Section */}
        <div className="p-detail-tabs-section">
          <div className="p-detail-tabs">
            <button
              className={`p-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`p-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Specifications
            </button>
            <button
              className={`p-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.reviews?.length || 0})
            </button>
          </div>

          <div className="p-detail-tab-content">
            {activeTab === 'description' && (
              <p className="p-detail-description">
                {product.description || "No description available."}
              </p>
            )}

            {activeTab === 'specs' && (
              // 🆕 Use the ProductSpecs component
              <ProductSpecs product={product} />
            )}

            {activeTab === 'reviews' && (
              <ProductReviews
                reviews={product.reviews || []}
                productId={product.id}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

