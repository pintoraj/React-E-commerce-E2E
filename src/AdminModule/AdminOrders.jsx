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

  const { user } = useAuth();
  const adminProfile = {
    name: user?.username || user?.name || 'Admin',
    email: user?.email || 'admin@example.com'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3001/users');
        const usersData = await res.json();

        const allOrders = [];

        usersData.forEach(u => {
          const userName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.username || 'Unnamed';

          if (Array.isArray(u.orders)) {
            u.orders.forEach(o => {
              const productsArr = Array.isArray(o.items) ? o.items : o.products;
              const itemCount = Array.isArray(productsArr)
                ? productsArr.reduce((sum, p) => sum + (p.qty || p.quantity || 0), 0)
                : 0;
              const productNames = Array.isArray(productsArr)
                ? productsArr.map(p => p.name).join(', ')
                : '';

              const formattedDate = o.orderedDate
                ? new Date(o.orderedDate).toLocaleDateString()
                : new Date().toLocaleDateString();
              const deliveryDate = o.deliveryDate
                ? new Date(o.deliveryDate).toLocaleDateString()
                : '';

              allOrders.push({
                id: o.id ?? `ORD-${Math.random().toString(36).slice(2, 8)}`,
                orderId: o.id ?? o.orderId,
                user: userName,
                items: itemCount,
                products: productNames,
                status: o.status ?? 'Confirmed',
                deliveryDate,
                date: formattedDate
              });
            });
          }
        });

        setOrders(allOrders);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch users/orders:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
                      <th>Sno</th>
                      <th>Order ID</th>
                      <th>User</th>
                      <th>Products</th>
                      <th>Items</th>
                      <th>Status</th>
                      <th>Delivery Date</th>
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
                        <td>{o.deliveryDate}</td>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;
