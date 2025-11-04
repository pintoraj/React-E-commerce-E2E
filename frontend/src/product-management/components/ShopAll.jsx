import React, { useState, useEffect } from 'react';
// ❇️ We only need this one API function
import { fetchFilteredProducts } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import { Search, ChevronDown, Star, X } from 'lucide-react';
import './css/ShopAllPage.css';

const PRODUCTS_PER_PAGE = 9;

const ShopAllPage = () => {
  const [allProducts, setAllProducts] = useState([]); // Products for the *current page*
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('id');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    const loadFilterOptions = async () => {
      setIsLoadingFilters(true);
      try {
        const response = await fetchFilteredProducts({
          page: 1,
          limit: 1000,
        });

        const products = response.content || [];
        const categories = [...new Set(products.map((p) => p.category))].sort();
        const brands = [...new Set(products.map((p) => p.brand))].sort();

        setAvailableCategories(categories);
        setAvailableBrands(brands);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      } finally {
        setIsLoadingFilters(false);
      }
    };
    loadFilterOptions();
  }, []); // Empty dependency array = runs once

  // ❇️ Fetch *paginated* products whenever filters or page changes
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      const filters = {
        searchTerm,
        brands: selectedBrands,
        categories: selectedCategories,
        priceMin: priceRange.min,
        priceMax: priceRange.max,
        ratingMin: minRating,
        sortBy,
        page: currentPage, // Spring Pageable is 0-indexed
        limit: PRODUCTS_PER_PAGE,
      };

      const response = await fetchFilteredProducts(filters);
      setAllProducts(response.content || []); // Get the array for the current page
      setTotalPages(response.totalPages || 0); // Get the total page count
      setIsLoadingProducts(false);
    };

    // Don't run this fetch until the filters are loaded
    if (!isLoadingFilters) {
      loadProducts();
    }
  }, [
    searchTerm,
    selectedBrands,
    selectedCategories,
    priceRange,
    minRating,
    sortBy,
    currentPage,
    isLoadingFilters, // Dependency
  ]);

  // --- Event Handlers ---

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
    setCurrentPage(1); // Reset page on filter change
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
    setCurrentPage(1); // Reset page on filter change
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedBrands([]);
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setMinRating(0);
    setSortBy('featured');
    setCurrentPage(1);
  };

  // --- Render Logic ---

  return (
    <div className="p-shop-wrapper">
      <div className="p-shop-container">
        <div className="p-shop-grid">
          <aside className="p-shop-filters">
            <div className="p-shop-filters-header">
              <h2 className="p-shop-filters-title">Filters</h2>
              <button onClick={resetFilters} className="p-clear-button">
                <X size={14} /> Clear All
              </button>
            </div>

            {isLoadingFilters ? (
              <p>Loading filters...</p>
            ) : (
              <>
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
              </>
            )}

            <FilterSection title="Price">
              <div className="p-price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange((p) => ({ ...p, min: e.target.value }))
                  }
                  className="p-price-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange((p) => ({ ...p, max: e.target.value }))
                  }
                  className="p-price-input"
                />
              </div>
            </FilterSection>

            <FilterSection title="Rating">
              <div className="p-rating-buttons">
                {[4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`p-rating-button ${
                      minRating === rating ? 'active' : ''
                    }`}
                  >
                    {rating} <Star size={14} className="p-star-icon" /> & Up
                  </button>
                ))}
              </div>
            </FilterSection>
          </aside>

          <main className="p-shop-main">
            <div className="p-shop-controls">
              <div className="p-search-wrapper">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="p-search-input"
                />
                <Search className="p-search-icon" size={20} />
              </div>
              <div className="p-sort-wrapper">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-sort-select"
                >
                  <option value="id,asc">Featured items</option>
                  <option value="price,asc">Price: Low to High</option>
                  <option value="price,desc">Price: High to Low</option>
                  <option value="averageRating,desc">By Rating</option>
                </select>
                <ChevronDown className="p-sort-icon" size={20} />
              </div>
            </div>

            {isLoadingProducts ? (
              <div className="p-loading">Loading products...</div>
            ) : allProducts.length > 0 ? (
              <div className="p-product-grid">
                {allProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="p-no-results">
                <h3>No Products Found</h3>
                <p>
                  Try adjusting your filters to find what you're looking for.
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="p-pagination">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
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

// --- Helper Components ---

const FilterSection = ({ title, children }) => (
  <div className="p-filter-section">
    <h3 className="p-filter-title">{title}</h3>
    <div className="p-filter-options">{children}</div>
  </div>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="p-checkbox">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="p-checkbox-input"
    />
    <span className="p-checkbox-label">{label}</span>
  </label>
);

export default ShopAllPage;
