import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/products";

const ProductForm = ({ productToEdit, onFormSubmit }) => {
  const initialFormState = {
    title: "",
    brand: "",
    category: "",
    price: "",
    description: "",
    thumbnail: "",
    rating: "",
    stock: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const isEditMode = Boolean(productToEdit);

  useEffect(() => {
    if (isEditMode) {
      setFormData(productToEdit);
    } else {
      setFormData(initialFormState);
    }
  }, [productToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imagePath = `/images/${file.name}`;
      setFormData((prevData) => ({ ...prevData, thumbnail: imagePath }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.thumbnail && !isEditMode) {
      alert("An image must be selected.");
      return;
    }

    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode ? `${API_URL}/${productToEdit.id}` : API_URL;

    try {
      let productData = { ...formData };

      // --- NEW LOGIC TO CREATE A SEQUENTIAL ID ---
      if (!isEditMode) {
        // 1. Fetch all existing products to find out the highest current ID
        const response = await fetch(API_URL);
        if (!response.ok)
          throw new Error("Failed to fetch products to determine new ID.");
        const products = await response.json();

        // 2. Find the maximum ID from the existing products
        // This is more robust than just using products.length in case items have been deleted.
        const maxId = products.reduce(
          (max, product) => (product.id > max ? product.id : max),
          0
        );

        // 3. Add the new sequential ID to our product data
        productData.id = maxId + 1;
      }
      // --- END OF NEW LOGIC ---

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        // Send the productData object which now includes the ID for new products
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error("Failed to submit product data");

      onFormSubmit();
      setFormData(initialFormState);
      e.target.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-white rounded-lg shadow-md border"
    >
      <h2 className="text-2xl font-bold mb-4">
        {isEditMode ? "Edit Product" : "Add a New Product"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Product Title"
          required
          className="p-2 border rounded"
        />
        <input
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          placeholder="Brand"
          className="p-2 border rounded"
        />
        <input
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category"
          required
          className="p-2 border rounded"
        />
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          required
          className="p-2 border rounded"
        />
        <input
          type="number"
          name="rating"
          value={formData.rating}
          onChange={handleChange}
          placeholder="Rating"
          required
          className="p-2 border rounded"
        />
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          placeholder="Stock"
          required
          className="p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Product Image
        </label>
        <input
          type="file"
          accept="image/*" // only allow image files
          onChange={handleFileChange}
          required={!isEditMode}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        {formData.thumbnail && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              Image Path: {formData.thumbnail}
            </p>
            <img
              src={formData.thumbnail}
              alt="Preview"
              className="h-20 w-20 object-cover rounded mt-1"
            />
          </div>
        )}
      </div>

      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Product Description"
        required
        className="w-full p-2 border rounded h-24"
      />

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isEditMode ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
