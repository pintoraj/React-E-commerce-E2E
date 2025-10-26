import React, { useEffect, useState } from 'react';
import './AdminProducts.css';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../user-authentication/context/AuthContext';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    id: '',
    title: '',
    description: '',
    category: '',
    price: '',
    sold: '',
    discountPercentage: '',
    rating: '',
    stock: '',
    tags: '', 
    brand: '',
    reviews: '', 
    meta: { createdAt: '', updatedAt: ''},
    thumbnail: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const productsPerPage = 10;

  const { user } = useAuth();
  const adminProfile = {
    name: user?.username || user?.name || 'Admin',
    email: user?.email || 'admin@example.com'
  };

  useEffect(() => {
    fetch('http://localhost:3000/products')
      .then(res => res.json())
      .then(data => {
        const mapped = Array.isArray(data)
          ? data.map(p => ({
              id: p.id.toString(),
              title: p.title,
              price: p.price,
              stock: p.stock ?? 0,
              rating: p.rating ?? 0,
              description: p.description ?? '',
              category: p.category ?? '',
              discountPercentage: p.discountPercentage ?? 0,
              brand: p.brand ?? '',
              meta: p.meta || { createdAt: '', updatedAt: '' },
              thumbnail: p.thumbnail ?? ''
            }))
          : [];
        setProducts(mapped);
      })
      .catch(err => console.error('Failed to fetch products:', err));
  }, []);

  const emptyProduct = {
    id: '',
    title: '',
    description: '',
    category: '',
    price: '',
    brand: '',
    discountPercentage: '',
    stock: '',
    thumbnail: '',
    meta: { createdAt: '', updatedAt: '' }
  };

  const openModal = () => {
    setNewProduct({ ...emptyProduct });
    setShowModal(true);
  };

  const handleProductIdChange = e => {
    const id = e.target.value.trim();
    const match = products.find(p => p.id === id);
    if (match) {
      setNewProduct({
        ...emptyProduct,
        ...match,
        id: match.id,
        dimensions: match.dimensions || { width: '', height: '', depth: '' },
        meta: match.meta || { createdAt: '', updatedAt: '', barcode: '', qrCode: '' }
      });
    } else {
      setNewProduct({ ...emptyProduct, id });
    }
  };

  const handleSubmitProduct = () => {
    const {
      id, title, description, category, price, sold, discountPercentage, rating, stock, tags, brand, sku, weight,
      dimensions, warrantyInformation, shippingInformation, availabilityStatus, reviews, returnPolicy, minimumOrderQuantity, meta, images, thumbnail
    } = newProduct;

    const trimmedTitle = title.trim();
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);
    const parsedRating = parseFloat(rating);
    const parsedSold = parseInt(sold);
    const parsedDiscount = parseFloat(discountPercentage);
    const parsedWeight = parseFloat(weight);
    const parsedMinOrder = parseInt(minimumOrderQuantity);

    const tagsArr = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const imagesArr = images ? images.split(',').map(i => i.trim()).filter(Boolean) : [];

    let reviewsArr = [];
    try {
      reviewsArr = reviews ? JSON.parse(reviews) : [];
    } catch {
      reviewsArr = [];
    }

    const payload = {
      id,
      title: trimmedTitle,
      description,
      category,
      price: parsedPrice,
      discountPercentage: isNaN(parsedDiscount) ? 0 : parsedDiscount,
      rating: isNaN(parsedRating) ? 0 : parsedRating,
      stock: isNaN(parsedStock) ? 0 : parsedStock,
      brand,
      minimumOrderQuantity: isNaN(parsedMinOrder) ? 0 : parsedMinOrder,
      meta: {
        createdAt: meta.createdAt,
        updatedAt: meta.updatedAt
      },
      thumbnail
    };

    if (!trimmedTitle || isNaN(parsedPrice) || parsedPrice <= 0 || isNaN(parsedStock) || parsedStock < 0) {
      alert("Please enter valid product details.");
      return;
    }

    const exists = products.some(p => p.id === id);

    if (exists) {
      fetch(`http://localhost:3000/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(() => {
          setProducts(prev =>
            prev.map(p => (p.id === id ? { ...p, ...payload } : p))
          );
          setShowModal(false);
        })
        .catch(err => console.error('Failed to update product:', err));
    } else {
      fetch('http://localhost:3000/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(newEntry => {
          setProducts(prev => [...prev, { ...newEntry, id: newEntry.id.toString() }]);
          setShowModal(false);
        })
        .catch(err => console.error('Failed to add product:', err));
    }

    setNewProduct({ ...emptyProduct });
  };

  const handleDeleteProduct = () => {
    const { id } = newProduct;
    fetch(`http://localhost:3000/products/${id}`, { method: 'DELETE' })
      .then(() => {
        setProducts(prev => prev.filter(p => p.id !== id));
        setShowModal(false);
        setNewProduct({ ...emptyProduct });
      })
      .catch(err => console.error('Failed to delete product:', err));
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
  <div className="a-admin-user-wrapper">
    <Sidebar adminProfile={adminProfile} />
    <div className="a-user-main">
      <div className="a-admin-user">
        <div className="a-product-controls">
          <div className="a-search-bar">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <button className="a-top-add-btn" onClick={openModal}>Add / Update Product</button>
          </div>
        </div>

        <table className="a-product-table">
          <thead>
            <tr>
              <th>ItemNumber</th>
              <th>Title</th>
              <th>Price (₹)</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((p, index) => (
              <tr key={p.id}>
                <td>{products.findIndex(prod => prod.id === p.id) + 1}</td>
                <td>{p.title}</td>
                <td>{p.price}</td>
                <td>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="a-pagination">
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

        {showModal && (
          <div className="a-modal-overlay">
            <div className="a-modal-content">
              <h3>Enter Product Details</h3>
              <form className="a-add-product-form" onSubmit={e => e.preventDefault()}>
                <input type="text" placeholder="Product ID" value={newProduct.id} onChange={handleProductIdChange} />
                <input type="text" placeholder="Product Title" value={newProduct.title} required onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} />
                <textarea placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                <input type="text" placeholder="Category" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} />
                <input type="number" placeholder="Price" value={newProduct.price} required min="0.01" step="0.01" onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                <input type="text" placeholder="Brand" value={newProduct.brand} onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })} />
                <input type="number" placeholder="Discount %" value={newProduct.discountPercentage} min="0" step="0.01" onChange={e => setNewProduct({ ...newProduct, discountPercentage: e.target.value })} />
                <input type="number" placeholder="Stock" value={newProduct.stock} required min="0" step="1" onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
                <input type="number" placeholder="Rating" value={newProduct.rating} min="0" max="5" step="0.1" onChange={e => setNewProduct({ ...newProduct, rating: e.target.value })} />
                <input type="text" placeholder="Thumbnail URL" value={newProduct.thumbnail} onChange={e => setNewProduct({ ...newProduct, thumbnail: e.target.value })} />
                <input type="text" placeholder="Meta Created At" value={newProduct.meta.createdAt} onChange={e => setNewProduct({ ...newProduct, meta: { ...newProduct.meta, createdAt: e.target.value } })} />
                <input type="text" placeholder="Meta Updated At" value={newProduct.meta.updatedAt} onChange={e => setNewProduct({ ...newProduct, meta: { ...newProduct.meta, updatedAt: e.target.value } })} />
                <div className="a-modal-actions">
                  <button type="submit" onClick={handleSubmitProduct}>Update / Add</button>
                  <button type="button" onClick={handleDeleteProduct}>Delete</button>
                  <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
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