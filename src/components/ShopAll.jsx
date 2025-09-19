import React, { useState, useEffect, useMemo } from "react";
import { fetchProducts } from "../api/productApi";
import ProductCard from "../components/ProductCard";
import { Search, ChevronDown, Star, X } from "lucide-react";
import "../index.css";

const PRODUCTS_PER_PAGE = 9;

const ShopAllPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [minRating, setMinRating] = useState(0);

  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadProducts = async () => {
      const products = await fetchProducts();
      setAllProducts(products);
    };
    loadProducts();
  }, []);

  const availableBrands = useMemo(() => {
    const brands = allProducts.map((p) => p.brand);
    return [...new Set(brands)].sort();
  }, [allProducts]);

  const availableCategories = useMemo(() => {
    const categories = allProducts.map((p) => p.category);
    return [...new Set(categories)].sort();
  }, [allProducts]);

  useEffect(() => {
    let filtered = [...allProducts];

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => selectedBrands.includes(p.brand));
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) =>
        selectedCategories.includes(p.category)
      );
    }

    if (priceRange.min !== "") {
      filtered = filtered.filter((p) => p.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max !== "") {
      filtered = filtered.filter((p) => p.price <= parseFloat(priceRange.max));
    }

    if (minRating > 0) {
      filtered = filtered.filter((p) => p.rating >= minRating);
    }

    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default: // 'featured'
        break;
    }

    setDisplayedProducts(filtered);
    setCurrentPage(1); // Reset page on any filter change
  }, [
    searchTerm,
    selectedBrands,
    selectedCategories,
    priceRange,
    minRating,
    sortBy,
    allProducts,
  ]);

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedBrands([]);
    setSelectedCategories([]);
    setPriceRange({ min: "", max: "" });
    setMinRating(0);
    setSortBy("featured");
  };

  const totalPages = Math.ceil(displayedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = displayedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm h-fit">
            <div className="flex justify-between items-center ">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:underline flex items-center gap-1"
              >
                <X size={14} /> Clear All
              </button>
            </div>

            {/* Category Filter */}
            <FilterSection title="Category">
              {availableCategories.map((category) => (
                <Checkbox
                  key={category}
                  label={category}
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
              ))}
            </FilterSection>

            {/* Brand Filter */}
            <FilterSection title="Brand">
              {availableBrands.map((brand) => (
                <Checkbox
                  key={brand}
                  label={brand}
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                />
              ))}
            </FilterSection>

            {/* Price Filter */}
            <FilterSection title="Price">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange((p) => ({ ...p, min: e.target.value }))
                  }
                  className="w-full border p-2 rounded-md text-sm"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange((p) => ({ ...p, max: e.target.value }))
                  }
                  className="w-full border p-2 rounded-md text-sm"
                />
              </div>
            </FilterSection>

            {/* Rating Filter */}
            <FilterSection title="Rating">
              <div className="flex space-x-1">
                {[4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`p-2 rounded-md border ${
                      minRating === rating
                        ? "bg-gray-600 text-white border-gray-600"
                        : "bg-white"
                    }`}
                  >
                    {rating}{" "}
                    <Star
                      size={14}
                      className="inline-block fill-current -mt-1"
                    />{" "}
                    & Up
                  </button>
                ))}
              </div>
            </FilterSection>
          </aside>

          {/* ===== MAIN CONTENT (PRODUCTS) ===== */}
          <main className="lg:col-span-3">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="relative w-full md:w-2/3 lg:w-1/2 duration-300 ease-in-out hover:shadow-xl hover:-translate-y-0.5  ">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded rounded-lg outline-none border border-gray-100"
                />
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
              <div className="relative w-full md:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-white  rounded-lg py-2 pl-4 pr-10  outline-none"
                >
                  <option value="featured">Featured items</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">By Rating</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>

            {/* --- Product Grid --- */}
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-2xl font-semibold">No Products Found</h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your filters to find what you're looking for.
                </p>
              </div>
            )}

            {/* --- Pagination Controls --- */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-4 py-2 border rounded-md bg-white disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-4 py-2 border rounded-md bg-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components for Minimalist UI ---
const FilterSection = ({ title, children }) => (
  <div className="py-6 border-b last:border-b-0">
    <h3 className="font-semibold mb-3 text-gray-800">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center space-x-3 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
    />
    <span className="text-gray-700 capitalize text-sm">{label}</span>
  </label>
);

export default ShopAllPage;
