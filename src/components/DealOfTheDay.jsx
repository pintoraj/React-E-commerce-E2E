import { useEffect, useState } from "react";
import { fetchProducts } from "../api/productApi"; // Corrected Path
import ProductCard from "./ProductCard"; // Corrected Path

const calculateTimeLeft = (targetDate) => {
  const difference = +new Date(targetDate) - +new Date();
  //The + converts them to timestamps (milliseconds since Jan 1, 1970), Subtracting gives the difference in milliseconds.

  let timeLeft = {};
  {
    /*  1000 ms = 1 second
60 seconds = 1 minute
60 minutes = 1 hour
24 hours = 1 day

So this converts the milliseconds into:

Days
Hours (remaining after full days)
Minutes (remaining after full hours)
Seconds (remaining after full minutes)*/
  }

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)), //60 secs * 60 mins * 24 hours
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24), // 1000 milliseconds * 60 secs * 60 mins % 24 hours
      minutes: Math.floor((difference / 1000 / 60) % 60), // 1000 milliseconds / 60 secs %  60 secs
      seconds: Math.floor((difference / 1000) % 60), // 1000 milliseconds  % 60 secs
    };
  }
  return timeLeft;
};

const DealOfTheDay = () => {
  const [dealProducts, setDealProducts] = useState([]);
  const [targetDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Set target 7 days from now
    return date;
  });

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const getDealProducts = async () => {
      const allProducts = await fetchProducts();
      const deals = allProducts.filter((p) => p.discountPercentage >= 15); // Deals with >= 15% discount
      setDealProducts(deals); //update the arrray
    };
    getDealProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <>
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Deal Of The <span className="text-amber-500">Dayyyyyyyyy</span>
          </h2>
          <p className="mt-2 text-gray-600">
            Don't wait. The time will never be just right.
          </p>
        </div>

        {/* Countdown Timer */}
        {Object.keys(timeLeft).length > 0 ? (
          <div className="flex space-x-2 md:space-x-4 text-center">
            <div>
              <span className="text-2xl md:text-3xl font-bold bg-gray-100 p-3 rounded-lg">
                {timeLeft.days}
              </span>
              <p className="text-sm mt-1">Days</p>
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-bold bg-gray-100 p-3 rounded-lg">
                {timeLeft.hours}
              </span>
              <p className="text-sm mt-1">Hours</p>
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-bold bg-gray-100 p-3 rounded-lg">
                {timeLeft.minutes}
              </span>
              <p className="text-sm mt-1">Mins</p>
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-bold bg-gray-100 p-3 rounded-lg">
                {timeLeft.seconds}
              </span>
              <p className="text-sm mt-1">Secs</p>
            </div>
          </div>
        ) : (
          <div className="text-xl font-bold text-red-500">Deal has ended!</div>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {dealProducts.slice(0, 4).map(
          (
            product //slices to only 0,1,2,3
          ) => (
            <ProductCard key={product.id} product={product} />
          )
        )}
      </div>
    </>
  );
};

export default DealOfTheDay;
