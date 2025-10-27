import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

// This component doesn't need to know the page size
// const PRODUCTS_PER_PAGE = 9;

const ShopAllPage = () => {
  // --- STATE ---
  // No longer need allProducts or displayedProducts
  const [products, setProducts] = useState([]); // Just the products for the current page

  // State for filter options (still need to be fetched or derived)
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0); // Pageable is 0-indexed
  const [totalPages, setTotalPages] = useState(0);

  // All your filter states are still perfect
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("featured"); // This will be 'sort' in the API call

  // --- DATA FETCHING ---

  // Effect to load filter options (categories/brands) on mount
  useEffect(() => {
    // You should create separate endpoints for these
    const loadFilterOptions = async () => {
        // Fetching all categories
        const catResponse = await axios.get("http://localhost:8080/categories"); // Use your category endpoint
        setAvailableCategories(catResponse.data.map(c => c.categoryName));

        // Fetching all brands (you'll need to create this endpoint)
        // For now, we'll just hardcode them, but you should fetch
        // setAvailableBrands(brandResponse.data);
    };
    loadFilterOptions();
  }, []);

  // This is now your MAIN data-fetching effect
  useEffect(() => {
    const loadProducts = async () => {
      // 1. Build the query parameters
      const params = new URLSearchParams();

      // Filters
      if (searchTerm) params.append("searchTerm", searchTerm);
      if (minRating > 0) params.append("minRating", minRating);
      if (priceRange.min) params.append("minPrice", priceRange.min);
      if (priceRange.max) params.append("maxPrice", priceRange.max);

      // 'in' query params
      selectedBrands.forEach(brand => params.append("brands", brand));
      selectedCategories.forEach(cat => params.append("categories", cat));

      // Pagination
      params.append("page", currentPage);
      params.append("size", 9); // Your page size

      // Sorting
      if (sortBy === "price-asc") params.append("sort", "price,asc");
      else if (sortBy === "price-desc") params.append("sort", "price,desc");
      else if (sortBy === "rating") params.append("sort", "rating,desc");
      // "featured" can just be the default sort (by ID, which Spring is doing)

      // 2. Call the API with all parameters
      try {
        const response = await axios.get("http://localhost:8080/products", { params });
        // 3. Set state from the Page object
        setProducts(response.data.content); // 'content' holds the list of products
        setTotalPages(response.data.totalPages); // Get total pages from Spring
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    loadProducts();
  }, [
    // This effect now re-runs whenever a filter or page changes
    searchTerm,
    selectedBrands,
    selectedCategories,
    priceRange,
    minRating,
    sortBy,
    currentPage,
  ]);

  // Reset filters also resets the page
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedBrands([]);
    setSelectedCategories([]);
    setPriceRange({ min: "", max: "" });
    setMinRating(0);
    setSortBy("featured");
    setCurrentPage(0); // Reset to first page
  };

  // --- RENDER ---
  // Your JSX is almost perfect, just update the pagination
  return (
    <div className="p-shop-wrapper">
      <div className="p-shop-container">
        <div className="p-shop-grid">
          <aside className="p-shop-filters">
             {/* Your filter JSX is all correct */}
          </aside>

          <main className="p-shop-main">
            {/* Your controls (search/sort) JSX is all correct */}

            {products.length > 0 ? ( // Use 'products'
              <div className="p-product-grid">
                {products.map((product) => ( // Use 'products'
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            ) : (
              <div className="p-no-results">
                 {/* No results message */}
              </div>
            )}

            {totalPages > 1 && (
              <div className="p-pagination">
                <button
                  disabled={currentPage === 0} // Check for 0
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Prev
                </button>
                <span>
                  Page {currentPage + 1} of {totalPages} {/* Add 1 for display */}
                </span>
                <button
                  disabled={currentPage + 1 === totalPages} // Check against total
                  onClick={() => setCurrentPage((p) => p + 1)}
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
