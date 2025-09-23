import { useEffect, useState } from "react";
import { fetchProducts } from "../api/productApi";
import ProductCard from "./ProductCard";


export default function DealOfTheDay() {
  const [dealProducts, setDealProducts] = useState([]);
  useEffect(() => {
    const getDealProducts = async () => {
      const allProducts = await fetchProducts();
      const deals = allProducts.filter((p) => p.discountPercentage >= 10); // Deals with >= 10 % discount
      setDealProducts(deals);
    };
    getDealProducts();
  }, []);

  const calculateTimeLeft = (targetDate) => {
    const difference = +new Date(targetDate) - +new Date(); // + converts them to timestamps (milliseconds since Jan 1, 1970), subtracting gives the difference in milliseconds. - kindly remind me to teach you guys how this works. @Gothula nd @Dhanush (should know)
    let timeLeft = {}; //empty object init
    if (difference > 0) {
      timeLeft = { //key:value pair
        days: Math.floor(difference / (1000 * 60 * 60 * 24)), //(difference  / 60 secs * 60 mins * 24 hours) = we can easily find the days left for the day to reach
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24), // 1000 milliseconds * 60 secs * 60 mins % 24 hours
        minutes: Math.floor((difference / 1000 / 60) % 60), // 1000 milliseconds / 60 secs %  60 secs
        seconds: Math.floor((difference / 1000) % 60), // 1000 milliseconds  % 60 secs
      };
    }
    return timeLeft;
  }; // planning to use useMemo() , so that it'd rememeber the last timee

  const [targetDate] = useState(() => { //dynamic target date setup
    const date = new Date();
    date.setDate(date.getDate() + 7); // Set target 7 days from now - interface Date
    return date;
  });
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Deal Of The <span className="text-amber-500">Dayyyyyyyyy</span>
          </h2>
          <p className="mt-2 text-gray-600">
            Don't wait. The time will never be just right.
          </p>
        </div>
        {Object.keys(timeLeft).length > 0 ? ( //Object.keys(objName) - gets all the keys - sourashish idea !! useful enough like hashmap.getKeys()
          <div className="flex space-x-2 md:space-x-4 text-center"> {/* if true render this */}
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
        ) : ( <div className="text-xl font-bold text-red-500">Deal has ended!</div> /* if false render this */ )}
      </div>
      <div className="grid grid-cols-6 xl:grid-cols-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 align-items-center">
        {dealProducts.slice(0, 4).map(
          (
            product //slices to only 0,1,2,3- total 4 products , 16.1 inch looks fine (should check w company laptop)
          ) => (
            <ProductCard key={product.id} product={product} />
          )
        )}
      </div>
    </>
  );
};

