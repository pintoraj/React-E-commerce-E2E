import React, { useState, useEffect } from "react";
import { fetchProducts } from "../api/productApi";
import ProductCard from "../components/ProductCard";
import "./ProductListPage.css";
import axios from "axios";

const PRODUCTS_PER_PAGE = 8;

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const getProducts = async () => {
      try{
        console.log("Fetching data...")
        const allProducts = await axios.get("http://localhost:8080/products");
        const allCategories= await axios.get("http://localhost:8080/categories")
        setProducts(allProducts.data);
        setCategories(allCategories.data);
        console.log(allProducts.data);
        console.log(allCategories.data);

      }
      catch (error){
        console.log("Error fetching the product list", error);
      }

        const uniqueCategories = [
        "All",
        ...new Set(categories.map((p) => p.categoryName)),
      ];
      setCategories(uniqueCategories);

    };
    getProducts();
  }, []);

  useEffect(() => {
    let result = products;
    if (selectedCategory !== "All") {
      result = products.filter((p) => p.category === selectedCategory);
    }
    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  return (
    <div className="p-list-wrapper">
      <div className="p-list-header">
        <div className="p-list-title">
          <h2>New Arrivals</h2>
          <p>Shop online for new arrivals and get free shipping!</p>
        </div>

        <div className="p-category-filters">
          {categories.map((category) => (
            <button
              key={category.categoryId}
              onClick={() => setSelectedCategory(category)}
              className={`p-category-button ${
                selectedCategory === category ? "active" : ""
              }`}
            >
              {category.categoryName}
            </button>
          ))}
        </div>
      </div>

      <div className="p-product-grid">
        {currentProducts.map((product) => (
          <ProductCard key={product.productId} product={product} />
        ))}
      </div>

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
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductListPage;
