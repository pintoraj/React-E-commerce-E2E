import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../api/productApi';
import ProductCard from '../components/ProductCard';

const PRODUCTS_PER_PAGE = 8;

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All'); // default set ALL selected - forgotten and added [] leading to categories storing as a array but not getting updated
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const getProducts = async () => {
      const allProducts = await fetchProducts();
      setProducts(allProducts);
      const uniqueCategories = [
        'All',
        ...new Set(allProducts.map((p) => p.category)), //Set is used because it doesn't allow duplicate values
        //spread operator is used , so that it can be made into an array
      ];
      setCategories(uniqueCategories);
    };
    getProducts();
  }, []);

  useEffect(() => {
    let result = products;
    if (selectedCategory !== 'All') {
      result = products.filter((p) => p.category === selectedCategory);
    }
    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE,
  );

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800">
              New Arrivals
            </h2>
            <p className="text-gray-500 mt-1">
              Shop online for new arrivals and get free shipping!
            </p>
          </div>
          <div className="flex items-center space-x-4 sm:space-x-6 text-sm font-semibold">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`pb-1 transition-all duration-200
                    ${
                      selectedCategory === category
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-500 hover:text-primary'
                    }`}
              >
                {category.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="flex justify-center items-center mt-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductListPage;
