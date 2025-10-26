import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../api/productApi";
import DealOfTheDayPage from "./DealOfTheDay";
import ProductListPage from "./ProductListPage";

import heroImage1 from "../assets/landing_page1.png";
import heroImage2 from "../assets/landing_page2.png";
import "./HomePage.css";

const landingPagesData = [
  {
    bgImage: heroImage1,
    subtitle: "FLAT 30% Off",
    title: (
      <>
        Explore <span className="p-hero-highlight">Healthy</span>
        <br />& Fresh Fruits
      </>
    ),
    theme: "light",
  },
  {
    bgImage: heroImage2,
    subtitle: "Deals and Promotions",
    title: "Sneakers & Athletic Shoes",
    theme: "dark",
  },
];

const HeroSection = ({ data, onScroll, isVisible }) => (
  <section
    className={`p-hero-section ${isVisible ? "visible" : "hidden"}`}
    style={{ backgroundImage: `url(${data.bgImage})` }}
  >
    {data.theme === "dark" && <div className="p-hero-overlay" />}

    <div className={`p-hero-content ${data.theme}`}>
      <p className="p-hero-subtitle">{data.subtitle}</p>
      <h1 className={`p-hero-title ${data.theme}`}>{data.title}</h1>
      <Link to="/shop">
        <button className={`p-hero-button ${data.theme}`}>SHOP NOW</button>
      </Link>
    </div>

    <button onClick={onScroll} className="p-scroll-button">
      <ChevronDown
        size={28}
        className={`p-chevron ${data.theme === "light" ? "light" : "dark"}`}
      />
    </button>
  </section>
);

const HomePage = () => {
  const [activeHero, setActiveHero] = useState(0);
  const [products, setProducts] = useState([]);

  const dealSectionRef = useRef(null);
  const productsSectionRef = useRef(null);

  useEffect(() => {
    const loadProducts = async () => {
      setProducts(await fetchProducts());
    };
    loadProducts();

    const interval = setInterval(() => {
      setActiveHero((current) => (current + 1) % landingPagesData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const scrollToDeals = () =>
    dealSectionRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="p-home-wrapper">
      <div className="p-hero-wrapper">
        {landingPagesData.map((landingPages, index) => (
          <HeroSection
            key={index}
            data={landingPages}
            onScroll={scrollToDeals}
            isVisible={activeHero === index}
          />
        ))}
      </div>

      <section id="deals" ref={dealSectionRef} className="p-deals-section">
        <div className="p-deals-container">
          <DealOfTheDayPage />
          <div className="p-view-all">
            <button
              onClick={() =>
                productsSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="p-view-all-button"
            >
              View All Products <ChevronDown size={20} />
            </button>
          </div>
        </div>
      </section>

      <section
        id="new-arrivals"
        ref={productsSectionRef}
        className="p-arrivals-section"
      >
        <div className="p-arrivals-container">
          <ProductListPage />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
