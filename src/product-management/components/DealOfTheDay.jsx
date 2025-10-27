import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal"; // 1. Import the modal
import axios from "axios";

// This helper function can stay outside the component
const calculateTimeLeft = (targetDate) => {
  const difference = +new Date(targetDate) - +new Date();
  if (difference <= 0) return {};

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

const DealOfTheDay = () => {
  // --- STATE ---
  const [dealProducts, setDealProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [targetDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  });
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  // --- MODAL HANDLERS ---
  const handleCardClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  // --- EFFECTS ---

  // Effect for Fetching Data
  useEffect(() => {
    const getDealProducts = async () => {
      try {
        console.log("Trying to fetch deal products...");
        // Ensure this URL is correct (http://localhost:8081/products/deals)
        const dealProductsData = await axios.get("http://localhost:8081/products/deals");
        console.log("Deal Products Data:", dealProductsData.data);
        setDealProducts(dealProductsData.data);
      } catch (error) {
        console.log('Error fetching deal of the day products', error);
      }
    };
    getDealProducts();
  }, []); // Empty dependency array, runs once on mount

  // Effect for Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  // --- RENDER ---
  return (
    // Use a Fragment to render the modal alongside the page content
    <>
      <div className="w-full max-w-6xl mx-auto py-12 px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          {/* Title */}
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800">
              Deal Of The
              <span className="text-blue-600"> Day</span>
            </h2>
            <p className="text-gray-500 mt-1">
              Don't wait. The time will never be just right.
            </p>
          </div>

          {/* Countdown Timer */}
          {Object.keys(timeLeft).length > 0 ? (
            <div className="flex space-x-2 sm:space-x-4 mt-4 md:mt-0">
              <div className="text-center bg-gray-100 p-3 rounded-lg w-16 sm:w-20">
                <span className="text-2xl font-bold text-blue-600">{timeLeft.days}</span>
                <p className="text-xs text-gray-500">Days</p>
              </div>
              <div className="text-center bg-gray-100 p-3 rounded-lg w-16 sm:w-20">
                <span className="text-2xl font-bold text-blue-600">{timeLeft.hours}</span>
                <p className="text-xs text-gray-500">Hours</p>
              </div>
              <div className="text-center bg-gray-100 p-3 rounded-lg w-16 sm:w-20">
                <span className="text-2xl font-bold text-blue-600">{timeLeft.minutes}</span>
                <p className="text-xs text-gray-500">Mins</p>
              </div>
              <div className="text-center bg-gray-100 p-3 rounded-lg w-16 sm:w-20">
                <span className="text-2xl font-bold text-blue-600">{timeLeft.seconds}</span>
                <p className="text-xs text-gray-500">Secs</p>
              </div>
            </div>
          ) : (
            <div className="text-lg font-bold text-red-500">Deal has ended!</div>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dealProducts.map((product) => (
            <ProductCard
              key={product.productId} // Use the correct key from your backend
              product={product}
              // 2. Pass the click handler to the card
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </div>

      {/* 3. Render the modal (it will only appear if 'selectedProduct' is not null) */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default DealOfTheDay;
