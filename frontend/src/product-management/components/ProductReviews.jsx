import React, { useState } from "react";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
// 🛑 FIX: Please adjust this path to point to your actual AuthContext.js file
import { useAuth } from "../../user-authentication/context/AuthContext";
// 🛑 FIX: Please adjust this path to point to your actual productApi.js file
import { addProductReview } from "../api/productApi";
// 🛑 FIX: This path assumes ProductReviews.css is in a 'css' folder *inside* 'products'
import "./css/ProductReviews.css";

// Helper to get initials from a name
const getInitials = (name) => {
  if (!name) return "?";
  const names = name.split(" ");
  return names
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const ProductReviews = ({ reviews: initialReviews, productId }) => {
  const [reviews, setReviews] = useState(initialReviews || []);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // States for loading and errors
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user and token from auth
  const { user, token } = useAuth();

  // Updated to be an async API call
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0 || comment.trim() === "") {
      // Replaced alert with toast
      toast.error("Please provide a rating and a comment.");
      return;
    }

    // No need to check for auth here, form is hidden if not logged in

    setIsSubmitting(true);

    try {
      const reviewData = { rating, comment };

      // Call the API endpoint
      // The backend should associate the user via the token
      const savedReview = await addProductReview(productId, reviewData, token);

      // Add the *saved review* to the state.
      // We manually add user.name because the backend response might just be the review object.
      // Adjust this based on your API's response!
      const displayReview = {
        ...savedReview,
        user: { name: user.name }, // Or however your user object/API response is structured
        createdAt: new Date().toISOString(), // Add a date for display
      };

      setReviews([displayReview, ...reviews]);

      // Reset form on success
      setRating(0);
      setComment("");
      toast.success("Review submitted successfully!");

    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error(error.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-reviews-wrapper">
      <div className="p-review-form-container">
        {/* Conditionally render the form based on auth state */}
        {user ? (
          <div className="p-review-form">
            <h3>Write a Review</h3>
            <p>Share your thoughts with other customers</p>
            <form onSubmit={handleSubmitReview}>
              <div className="p-form-group">
                <label>Your Rating:</label>
                <div className="p-star-rating-input">
                  {[...Array(5)].map((_, i) => {
                    const starValue = i + 1;
                    return (
                      <Star
                        key={starValue}
                        size={24}
                        className={starValue <= rating ? "filled interactive" : "interactive"}
                        onClick={() => !isSubmitting && setRating(starValue)}
                        onMouseEnter={() => !isSubmitting && setRating(starValue)}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="p-form-group">
                <label htmlFor="comment">Your Review:</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike?"
                  rows={5}
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                className="p-btn-submit-review"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-review-login-prompt">
            <h3>Write a Review</h3>
            <p>You must be <a href="/login">logged in</a> to post a review.</p>
          </div>
        )}
      </div>

      <div className="p-review-list-container">
        <h3>Customer Reviews</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="p-review-list">
            {reviews.map((review) => (
              <div key={review.id} className="p-review-item">
                <div className="p-review-header">
                  <div className="p-review-avatar">
                    {/* Display user initials */}
                    {getInitials(review.user?.firstName || "User")}
                  </div>
                  <div className="p-review-user-info">
                    <strong>{review.user?.firstName || "Anonymous"}</strong>
                    <span className="p-review-date">
                      {/* Format the date */}
                      {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="p-review-rating-display">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? "filled" : ""}
                      />
                    ))}
                  </div>
                </div>
                <p className="p-review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;

