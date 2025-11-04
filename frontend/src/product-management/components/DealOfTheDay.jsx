import { useEffect, useState } from "react";
import { fetchDealProducts } from "../api/productApi"; // ✅ new API function
import ProductCard from "./ProductCard";

import "./css/DealOfTheDay.css"
import axios from "axios";

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
  const [dealProducts, setDealProducts] = useState([]);
  const [targetDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  });

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const getDeals = async () => {
      const deals = await fetchDealProducts()
      console.log("Deals data:",deals);
      setDealProducts(deals);
    };
    getDeals();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="p-deal-wrapper">
      <div className="p-deal-header">
        <div className="p-deal-title">
          <h2>
            Deal Of The <span className="p-highlight">Dayyyyyyyyy</span>
          </h2>
          <p>Don't wait. The time will never be just right.</p>
        </div>

        {Object.keys(timeLeft).length > 0 ? (
          <div className="p-countdown">
            <div><span>{timeLeft.days}</span><p>Days</p></div>
            <div><span>{timeLeft.hours}</span><p>Hours</p></div>
            <div><span>{timeLeft.minutes}</span><p>Mins</p></div>
            <div><span>{timeLeft.seconds}</span><p>Secs</p></div>
          </div>
        ) : (
          <div className="p-deal-ended">Deal has ended!</div>
        )}
      </div>

      <div className="p-deal-grid">
        {dealProducts.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default DealOfTheDay;
