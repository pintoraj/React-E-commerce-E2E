import { useEffect, useState } from "react";
import ProductForm from "../components/ProductForm";

const API_URL = "http://localhost:3000/products";

const AdminPage = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      await fetch(`${API_URL}/${productId}`, { method: "DELETE" });
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const [editingProduct, setEditingProduct] = useState(null);
  const handleFormSuccess = (isCancel = false) => {
    if (isCancel) {
      setEditingProduct(null);
      return;
    }
    setEditingProduct(null);
    fetchProducts();
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-extrabold mb-8">Product Management</h1>
      <div className="mb-12">
        <ProductForm
          productToEdit={editingProduct}
          onFormSubmit={handleFormSuccess}
        />
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Existing Products</h2>
        {products.map((product) => (
          <div
            key={product.id}
            className="flex justify-between items-center p-4 bg-white rounded shadow-sm border"
          >
            <div>
              <p className="font-bold text-lg">{product.title}</p>
              <p className="text-sm text-gray-600">
                {product.category} - ₹{product.price}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingProduct(product)}
                className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
