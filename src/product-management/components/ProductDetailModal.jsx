import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Star } from 'lucide-react';

// A simple helper component for star ratings
const StarRating = ({ rating }) => {
  const totalStars = 5;
  const filledStars = Math.round(rating);

  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, i) => (
        <Star
          key={i}
          size={20}
          className={i < filledStars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      ))}
      <span className="ml-2 text-sm text-gray-600">({rating.toFixed(2)})</span>
    </div>
  );
};

const ProductDetailModal = ({ product, onClose }) => {
  if (!product) return null;

  // State for the image gallery
  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0] || product.thumbnail
  );
  // State for the info tabs
  const [activeTab, setActiveTab] = useState('description');

  // Helper to safely format dimensions
  const dimensions = product.dimensions;

  // Helper to format review dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    // Modal Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="relative mx-4 flex h-[90vh] w-full max-w-5xl rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 z-10 text-white md:-right-10"
        >
          <X size={30} />
        </button>

        {/* --- Left Column: Image Gallery --- */}
        <div className="w-full md:w-1/2 p-6 flex-shrink-0">
          <div className="relative">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-96 rounded-lg object-contain"
            />
          </div>
          <div className="mt-4 flex space-x-2 overflow-x-auto p-2">
            {product.images?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${product.title} thumbnail ${index + 1}`}
                onClick={() => setSelectedImage(img)}
                className={`h-20 w-20 flex-shrink-0 rounded-md object-cover cursor-pointer ${
                  selectedImage === img
                    ? 'border-2 border-blue-500'
                    : 'border border-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* --- Right Column: Product Details (Scrollable) --- */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto">
          {/* Brand & Title */}
          <span className="text-sm font-semibold uppercase text-gray-500">
            {product.brand || 'Brand'}
          </span>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            {product.title}
          </h1>

          {/* Price & Rating */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-800">
                ₹{product.price.toFixed(2)}
              </span>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-sm font-semibold text-green-700">
                {product.discountPercentage}% OFF
              </span>
            </div>
            <StarRating rating={product.rating} />
          </div>

          {/* Stock & Status */}
          <div className="mt-4">
            <span
              className={`font-semibold ${
                product.availabilityStatus === 'In Stock'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {product.availabilityStatus}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              ({product.stock} left in stock)
            </span>
          </div>

          {/* Add to Cart Button */}
          <button className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-blue-700 transition">
            Add to Cart
          </button>

          {/* --- Tabs for more info --- */}
          <div className="mt-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-6">
                <button
                  className={`py-4 px-1 text-sm font-medium ${
                    activeTab === 'description'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button
                  className={`py-4 px-1 text-sm font-medium ${
                    activeTab === 'specs'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('specs')}
                >
                  Specifications
                </button>
                <button
                  className={`py-4 px-1 text-sm font-medium ${
                    activeTab === 'reviews'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews ({product.reviews.length})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="py-6 text-sm text-gray-600">
              {/* Description Tab */}
              {activeTab === 'description' && <p>{product.description}</p>}

              {/* Specifications Tab */}
              {activeTab === 'specs' && (
                <ul className="space-y-2">
                  <li><strong>Warranty:</strong> {product.warrantyInformation}</li>
                  <li><strong>Shipping:</strong> {product.shippingInformation}</li>
                  <li><strong>Return Policy:</strong> {product.returnPolicy}</li>
                  <li><strong>Weight:</strong> {product.weight}g</li>
                  <li>
                    <strong>Dimensions:</strong> {dimensions.width} x {dimensions.height} x {dimensions.depth} cm
                  </li>
                </ul>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {product.reviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">
                          {review.reviewerName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(review.date)}
                        </span>
                      </div>
                      <div className="mt-1 flex">
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="mt-3">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
