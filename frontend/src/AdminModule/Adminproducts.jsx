import React, { useEffect, useState } from 'react';
import './AdminProducts.css';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../user-authentication/context/AuthContext.jsx';
import { toast, ToastContainer } from 'react-toastify';

import {
  fetchFilteredProducts,
  createProduct,
  deleteProduct,
  updateProduct
} from '../product-management/api/productApi.js';

const productsPerPage = 10;

// Define an empty product state for resetting the form
const initialEmptyProduct = {
  title: '', description: '', category: '', price: '', stock: '',
  averageRating: '', brand: '',
  sku: '', weightG: '', widthCm: '', heightCm: '', depthCm: '',
  warrantyInformation: '', shippingInformation: '', returnPolicy: '',
  minOrderQuantity: '', barcode: '', qrCodeUrl: '', imageUrls: [], tags: [],
  availabilityStatus: 'In Stock',
  discountPercentage: '',
  thumbnailFile: null // Use a separate field for the file object
};

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // This state holds the data for the modal form
  const [productInForm, setProductInForm] = useState(initialEmptyProduct);
  // This state holds the URL of the *current* thumbnail in edit mode
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState(null);


  // --- Server-side State ---
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id,asc');

  const [selectedIds, setSelectedIds] = useState([]);

  const { user, token } = useAuth();
  const adminProfile = {
    name: user?.username || user?.name || 'Admin',
    email: user?.email || 'admin@example.com'
  };

  useEffect(() => {


    const loadProducts = async () => {
      setIsLoading(true);

      const filters = {
        searchTerm: searchTerm,
        brands: [],
        categories: [],
        priceMin: null,
        priceMax: null,
        ratingMin: null,
        sortBy: sortBy,
        page: currentPage,
        limit: productsPerPage
      };

      try {
        const data = await fetchFilteredProducts(filters);
        console.log("Filtered Products:", data);

        if (data && data.content) {
          setProducts(data.content);
          setTotalPages(data.totalPages);
        } else {
          setProducts([]);
          setTotalPages(0);
        }
      } catch (err) {
        toast.error('Failed to fetch products');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [ currentPage, searchTerm, sortBy]);

  // --- Modal Management ---

  const openAddModal = () => {
    setIsEditMode(false);
    setProductInForm(initialEmptyProduct);
    setCurrentThumbnailUrl(null);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setIsEditMode(true);
    // Populate form with all product data
    // `thumbnailFile` is null, as we haven't selected a *new* file yet
    setProductInForm({ ...product, thumbnailFile: null });
    // Store the *current* thumbnail URL to display
    setCurrentThumbnailUrl(product.thumbnail);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setCurrentThumbnailUrl(null);
    // No need to reset form here, it will be reset by the open functions
  };

  // --- REFACTORED: Combined Save Handler ---
  const handleSaveProduct = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (isEditMode) {
      await handleUpdateProduct();
    } else {
      await handleCreateProduct();
    }
  };

  // --- REFACTORED: Handle Product Creation ---
  const handleCreateProduct = async () => {
    if (!token) return;

    // 1. Create the 'productData' JSON object (matches DTO)
    const productData = {
      title: productInForm.title,
      description: productInForm.description,
      category: productInForm.category,
      price: productInForm.price,
      stock: productInForm.stock,
      averageRating: productInForm.averageRating || 0,
      brand: productInForm.brand,
      availabilityStatus: productInForm.availabilityStatus || 'In Stock',
      sku: productInForm.sku,
      weightG: productInForm.weightG,
      widthCm: productInForm.widthCm,
      heightCm: productInForm.heightCm,
      depthCm: productInForm.depthCm,
      warrantyInformation: productInForm.warrantyInformation,
      shippingInformation: productInForm.shippingInformation,
      returnPolicy: productInForm.returnPolicy,
      minOrderQuantity: productInForm.minOrderQuantity || 1,
      barcode: productInForm.barcode,
      qrCodeUrl: productInForm.qrCodeUrl,
      imageUrls: productInForm.imageUrls || [],
      tags: productInForm.tags || [],
      discountPercentage: productInForm.discountPercentage || 0 // <-- ADDED
    };

    // 2. Validate
    if (!productData.title || !productData.price || !productData.stock || !productData.sku) {
      toast.error("Fill required fields: Title, Price, Stock, SKU");
      return;
    }

    try {
      // 3. Call the API (passing JSON data and the separate file)
      const newProductData = await createProduct(
        productData,
        productInForm.thumbnailFile, // <-- The file object
        token
      );

      toast.success("Product added! Refreshing list...");
      closeModal();

      // 4. Reload data
      if (currentPage === 1) {
        const data = await fetchFilteredProducts({
          search: searchTerm, sort: sortBy, page: 1, limit: productsPerPage
        }, token);
        setProducts(data.content);
        setTotalPages(data.totalPages);
      } else {
        setCurrentPage(1); // Go to page 1
      }
    } catch (err) {
      toast.error(`Failed to add product: ${err.message || 'Unknown error'}`);
    }
  };

  // --- NEW: Handle Product Update ---
  const handleUpdateProduct = async () => {
    const productId = productInForm.id;
    if (!token || !productId) return;

    // 1. Create the 'productData' JSON object
    const productData = {
      title: productInForm.title,
      description: productInForm.description,
      category: productInForm.category,
      price: productInForm.price,
      stock: productInForm.stock,
      averageRating: productInForm.averageRating,
      brand: productInForm.brand,
      availabilityStatus: productInForm.availabilityStatus,
      sku: productInForm.sku,
      weightG: productInForm.weightG,
      widthCm: productInForm.widthCm,
      heightCm: productInForm.heightCm,
      depthCm: productInForm.depthCm,
      warrantyInformation: productInForm.warrantyInformation,
      shippingInformation: productInForm.shippingInformation,
      returnPolicy: productInForm.returnPolicy,
      minOrderQuantity: productInForm.minOrderQuantity,
      barcode: productInForm.barcode,
      qrCodeUrl: productInForm.qrCodeUrl,
      imageUrls: productInForm.imageUrls,
      tags: productInForm.tags,
      discountPercentage: productInForm.discountPercentage // <-- ADDED
    };

     // 2. Validate
    if (!productData.title || !productData.price || !productData.stock || !productData.sku) {
      toast.error("Fill required fields: Title, Price, Stock, SKU");
      return;
    }

    try {
      // 3. Call the API function
      // We pass the product ID, the JSON data, and the *new* thumbnail file (if any)
      const updatedProduct = await updateProduct(
        productId,
        productData,
        productInForm.thumbnailFile, // null if not changed, or a file object if changed
        token
      );

      // 4. Update the product in state
      setProducts(prev =>
        prev.map(p => (p.id === productId ? updatedProduct : p))
      );
      toast.success("Product updated!");
      closeModal();
    } catch (err) {
      toast.error(`Failed to update product: ${err.message || 'Unknown error'}`);
    }
  };

  // --- REFACTORED: Handle Product Deletion ---
  const handleDeleteProduct = async (id, title) => {
    if (!token) return;
    if (!window.confirm(`Delete "${title}"?`)) return;

    try {
      await deleteProduct(id, token);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Product deleted");
      // Note: May need to refetch data if page becomes empty
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  // --- REFACTORED: Handle Bulk Delete ---
  const handleBulkDelete = async () => {
    if (!token || selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected products?`)) return;

    try {
      await Promise.all(selectedIds.map(id => deleteProduct(id, token)));

      setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      toast.success("Selected products deleted");
    } catch (err) {
      toast.error("Bulk delete failed");
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Generic handler to update the form state
  const handleFormChange = (e) => {
    const { name, value, type } = e.target;

    // Handle file input
    if (type === 'file') {
      setProductInForm(prev => ({
        ...prev,
        thumbnailFile: e.target.files[0]
      }));
    } else {
      // Handle all other inputs
      setProductInForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };


  return (
    <div className="a-admin-user-wrapper">
      <Sidebar adminProfile={adminProfile} />
      <div className="a-user-main">
        <ToastContainer position="top-right" autoClose={2000} />
        <div className="a-admin-user">

          {/* Filter & Action Bar */}
          <div className="a-product-controls">
            <div className="a-search-sort-group">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on search
                }}
              />
              <select
                className="a-sort-btn"
                value={sortBy}
                onChange={e => {
                  setSortBy(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on sort
                }}
              >
                <option value="id,asc">Default (ID ASC)</option>
                <option value="price,asc">Price: Low to High</option>
                <option value="price,desc">Price: High to Low</option>
                <option value="averageRating,desc">Rating: High to Low</option>
              </select>
            </div>

            <div className="a-action-group">
              <button className="a-top-add-btn" onClick={openAddModal}>Add Product</button>
              {selectedIds.length > 0 && (
                <button className="a-top-add-btn a-bulk-delete-btn" onClick={handleBulkDelete}>
                  Delete Selected
                </button>
              )}
            </div>
          </div>

          {/* Product Table */}
          {isLoading ? (
            <div className="p-loading">Loading products...</div>
          ) : (
            <table className="a-product-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>#</th>
                  <th>Title</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price (₹)</th>
                  <th>Stock</th>
                  <th>Thumbnail</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, index) => (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => handleCheckboxChange(p.id)}
                      />
                    </td>
                    <td>{(currentPage - 1) * productsPerPage + index + 1}</td>

                    {/* --- REMOVED INLINE EDIT --- */}
                    <td>{p.title}</td>
                    <td>{p.brand}</td>
                    <td>{p.category}</td>
                    <td>₹{p.price}</td>
                    <td>{p.stock}</td>

                    <td>
                      {p.thumbnail && (
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          className="a-thumbnail-hover"
                        />
                      )}
                    </td>
                    <td>
                      {p.updatedAt
                        ? new Date(p.updatedAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })
                        : '—'}
                    </td>

                    {/* --- NEW ACTIONS --- */}
                    <td>
                      <div className="a-table-actions">
                        <button
                          className="a-table-btn-edit"
                          onClick={() => openEditModal(p)}
                          title="Edit Product"
                        >
                          Edit
                        </button>
                        <button
                          className="a-table-btn-delete"
                          onClick={() => handleDeleteProduct(p.id, p.title)}
                          title="Delete Product"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <div className="a-pagination">
            {/* ... pagination buttons ... (unchanged) */}
            <button
              className="a-page-btn a-arrow"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ⟨
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`a-page-btn ${currentPage === i + 1 ? 'a-active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="a-page-btn a-arrow"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              ⟩
            </button>
          </div>

          {/* Modal for Adding/Editing Product */}
          {showModal && (
            <div className="a-modal-overlay">
              <div className="a-modal-content a-add-product-modal">
                <h3>{isEditMode ? 'Edit Product' : 'Enter Product Details'}</h3>

                {/* The form now calls handleSaveProduct,
                  which decides whether to call create or update.
                */}
                <form className="a-add-product-form a-form-grid" onSubmit={handleSaveProduct}>

                  {/* --- Group 1: Core Details --- */}
                  <input type="text" placeholder="Title*" name="title" value={productInForm.title} required onChange={handleFormChange} />
                  <input type="text" placeholder="Brand*" name="brand" value={productInForm.brand} required onChange={handleFormChange} />
                  <input type="text" placeholder="Category*" name="category" value={productInForm.category} required onChange={handleFormChange} />

                  {/* Full-width description */}
                  <textarea className="a-form-span-3" placeholder="Description" name="description" value={productInForm.description} onChange={handleFormChange} />

                  {/* --- Group 2: Price & Stock --- */}
                  <input type="number" placeholder="Price*" name="price" value={productInForm.price} required min="0.01" step="0.01" onChange={handleFormChange} />
                  <input type="number" placeholder="Stock*" name="stock" value={productInForm.stock} required min="0" step="1" onChange={handleFormChange} />
                  {/* --- NEW Discount Percentage --- */}
                  <input type="number" placeholder="Discount %" name="discountPercentage" value={productInForm.discountPercentage} min="0" max="100" onChange={handleFormChange} />

                  {/* --- Group 3: Specifications --- */}
                  <input type="text" placeholder="SKU*" name="sku" value={productInForm.sku} required onChange={handleFormChange} />
                  <input type="text" placeholder="Availability Status" name="availabilityStatus" value={productInForm.availabilityStatus} onChange={handleFormChange} />
                  <input type="number" placeholder="Rating (0-5)" step="any" name="averageRating" value={productInForm.averageRating} min="0" max="5" onChange={handleFormChange} />

                  <input type="number" placeholder="Min Order Qty" name="minOrderQuantity" value={productInForm.minOrderQuantity} min="1" onChange={handleFormChange} />
                  <input type="number" placeholder="Weight (g)" name="weightG" value={productInForm.weightG} min="0"  step="any" onChange={handleFormChange} />
                  <input type="number" placeholder="Width (cm)" name="widthCm" value={productInForm.widthCm} min="0" step="any" onChange={handleFormChange} />

                  <input type="number" placeholder="Height (cm)" name="heightCm" value={productInForm.heightCm} min="0"  step="any" onChange={handleFormChange} />
                  <input type="number" placeholder="Depth (cm)" name="depthCm" value={productInForm.depthCm} min="0" onChange={handleFormChange} />
                  <span>{/* Empty cell for grid alignment */}</span>

                  {/* --- Group 4: Meta & Info (Full Width) --- */}
                  <input className="a-form-span-3" type="text" placeholder="Warranty Info" name="warrantyInformation" value={productInForm.warrantyInformation} onChange={handleFormChange} />
                  <input className="a-form-span-3" type="text" placeholder="Shipping Info" name="shippingInformation" value={productInForm.shippingInformation} onChange={handleFormChange} />
                  <input className="a-form-span-3" type="text" placeholder="Return Policy" name="returnPolicy" value={productInForm.returnPolicy} onChange={handleFormChange} />

                  {/* --- Group 5: File Upload (Full Width) --- */}
                  <div className="a-form-span-3 a-file-upload-section">
                    <label>Thumbnail Image:</label>
                    {/* Show *current* thumbnail if in Edit mode and no *new* file is selected */}
                    {isEditMode && currentThumbnailUrl && !productInForm.thumbnailFile && (
                      <div className="a-thumbnail-preview-wrapper">
                        <span>Current:</span>
                        <img src={currentThumbnailUrl} alt="Current" className="a-thumbnail-preview" />
                      </div>
                    )}
                    {/* Show *new* thumbnail preview if a file is selected */}
                    {productInForm.thumbnailFile && (
                      <div className="a-thumbnail-preview-wrapper">
                        <span>New:</span>
                        <img
                          src={URL.createObjectURL(productInForm.thumbnailFile)}
                          alt="Preview"
                          className="a-thumbnail-preview"
                        />
                      </div>
                    )}
                    <input type="file" accept="image/*" name="thumbnailFile" onChange={handleFormChange} />
                  </div>

                  <div className="a-modal-actions a-form-span-3">
                    <button type="submit">
                      {isEditMode ? 'Update Product' : 'Add Product'}
                    </button>
                    <button type="button" onClick={closeModal}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;
