import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../api/productApi";
import DealOfTheDayPage from "./DealOfTheDay";
import ProductListPage from "./ProductListPage";

import heroImage1 from "../assets/landing_page1.png";
import heroImage2 from "../assets/landing_page2.png";

const landingPagesData = [
  // Array for our landing pages - landingPagesData array
  {
    bgImage: heroImage1, // imported
    subtitle: "FLAT 30% Off",
    title: (
      <>
        Explore <span className="text-brown-600">Healthy</span>
        <br />& Fresh Fruits
      </>
    ),
    theme: "light", // theme can be changed
  },
  {
    bgImage: heroImage2,
    subtitle: "Deals and Promotions", //imported
    title: "Sneakers & Athletic Shoes",
    theme: "dark",
  },
];

const HeroSection = (
  { data, onScroll, isVisible } // can be reused for more landing pages, planning to add 2 more landing pages...Ashwanth suggestions.
) => (
  <section
    className={`absolute inset-0 h-screen w-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
      isVisible ? "opacity-100" : "opacity-0"
    }`}
    style={{ backgroundImage: `url(${data.bgImage})` }} // Issues faced : don't put `data.bgImage` it confuses it as a string - it should be considered as a prop
  >
    {data.theme === "dark" && (
      <div className="absolute inset-0 bg-black/40"></div>
    )}

    <div
      className={`relative z-10 container mx-auto h-full flex flex-col justify-center
                   ${
                     data.theme === "light"
                       ? "items-center text-center text-slate-800"
                       : "items-start px-8 md:px-24 text-white"
                   }`}
    >
      <p className="text-base mb-2 font-light tracking-wider">
        {data.subtitle}
      </p>
      <h1
        className={`text-5xl md:text-7xl font-bold leading-tight mb-4 ${
          data.theme === "dark" && "font-serif"
        }`}
      >
        {data.title}
      </h1>
      <Link to="/shop">
        <button
          className={`mt-6 px-8 py-3 font-semibold transition-colors duration-300
                         ${
                           data.theme === "light"
                             ? "bg-white border border-gray-300 hover:bg-gray-600 hover:text-white rounded-lg"
                             : "bg-white text-gray-800 hover:bg-gray-200"
                         }`}
        >
          SHOP NOW
        </button>
      </Link>
    </div>

    <button
      onClick={onScroll}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce z-10" //icon bounces and -1/2
    >
      <ChevronDown
        size={28}
        className={data.theme === "light" ? "text-gray-500" : "text-white"}
      />
    </button>
  </section>
);

const HomePage = () => {
  const [activeHero, setActiveHero] = useState(0);
  const [products, setProducts] = useState([]);

  const dealSectionRef = useRef(null); // section ref should be declared prior as null, such that they can be assigned later for ref-references
  const productsSectionRef = useRef(null);

  useEffect(() => {
    // useEffect expects a clear function / undefined
    const loadProducts = async () => {
      // `loadProducts` clear function
      setProducts(await fetchProducts());
    };
    loadProducts();
    // calling the loadProducts function right away

    const interval = setInterval(() => {
      setActiveHero((current) => (current + 1) % landingPagesData.length); // 5 seconds hero section changes
    }, 5000);

    return () => clearInterval(interval); // back to 0
  }, []);

  const scrollToDeals = () =>
    dealSectionRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div>
      <div className="relative h-screen w-full">
        {landingPagesData.map(
          (
            landingPages,
            index // (arrayValuesPointer,index)
          ) => (
            <HeroSection
              key={index} //key : value
              data={landingPages}
              onScroll={scrollToDeals}
              isVisible={activeHero === index}
            />
          )
        )}
      </div>

      <section ref={dealSectionRef} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>{<DealOfTheDayPage />}</div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() =>
                productsSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="font-semibold text-gray-600 hover:text-blue-600 flex items-center mx-auto"
            >
              View All Products <ChevronDown className="ml-1" size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* --- Product Listings Section --- */}
      <section ref={productsSectionRef} className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">{<ProductListPage />}</div>
      </section>
    </div>
  );
};

export default HomePage;
