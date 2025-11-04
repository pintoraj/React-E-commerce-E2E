import React, { useEffect, useState } from 'react';
import './AdminOrders.css';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../user-authentication/context/AuthContext';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const ordersPerPage = 5;

  const { user, token } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL;

  const adminProfile = {
    name: user?.username || user?.name || 'Admin',
    email: user?.email || 'admin@example.com'
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const contentType = res.headers.get('Content-Type');
        if (!res.ok || !contentType?.includes('application/json')) {
          throw new Error('Invalid response format');
        }

        const data = await res.json();

        const mappedOrders = data.map(o => ({
          id: o.id,
          orderId: o.id,
          user: o.userName || o.userEmail || o.userId,
          items: o.items?.reduce((sum, item) => sum + item.qty, 0),
          products: o.items?.map(item => item.name || 'Unnamed').join(', '),
          status: o.status,
          deliveryDate: o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString() : '',
          date: o.orderedDate ? new Date(o.orderedDate).toLocaleDateString() : ''
        }));

        setOrders(mappedOrders);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [API_BASE, token]);

  const uniqueStatuses = Array.from(new Set(orders.map(o => o.status))).filter(Boolean);

  const filteredOrders = statusFilter
    ? orders.filter(o => o.status === statusFilter)
    : orders;

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfFirst = (currentPage - 1) * ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfFirst + ordersPerPage);

  return (
    <div className="a-admin-orders-wrapper">
      <Sidebar adminProfile={adminProfile} />
      <div className="a-orders-main">
        <div className="a-admin-orders">
          <div className="a-orders-header">
            <h2>Order Management</h2>
          </div>

          <div className="a-table-container">
            <div className="a-filter-controls">
              <label htmlFor="statusFilter">Filter by Status:</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <p className="a-loading-text">Loading orders...</p>
            ) : error ? (
              <p className="a-error-text">Failed to load orders.</p>
            ) : currentOrders.length === 0 ? (
              <p className="a-empty-text">No orders found.</p>
            ) : (
              <>
                <table className="a-orders-table">
                  <thead>
                    <tr>
                      <th>Sno</th><th>Order ID</th><th>User</th>
                      <th>Products</th><th>Items</th><th>Status</th>
                      <th>Ordered Date</th><th>Delivery Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((o, i) => (
                      <tr key={o.id}>
                        <td>{indexOfFirst + i + 1}</td>
                        <td>{o.orderId}</td>
                        <td>{o.user}</td>
                        <td>{o.products}</td>
                        <td>{o.items}</td>
                        <td>{o.status}</td>
                        <td>{o.date}</td>
                        <td>{o.deliveryDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalPages > 1 && (
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
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;
