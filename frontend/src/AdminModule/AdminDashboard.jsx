import './AdminDashboard.css';
import Sidebar from './Sidebar.jsx';
import RevenueChart from './RevenueChart.jsx';
import SalesChart from './SalesChart.jsx';
import { useState, useEffect } from 'react';
import { useAuth } from '../user-authentication/context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const [adminProfile, setAdminProfile] = useState({
    name: '',
    email: '',
  });

  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
  });

  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    outfordelivery: 0,
    shippingOrders: 0,
    cancelledOrders: 0,
  });

  useEffect(() => {
    const handlePopState = () => {
      logout();
      navigate('/', { replace: true });
      window.location.reload();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [logout, navigate]);

  useEffect(() => {
    if (user) {
      setAdminProfile({
        name: user.username || user.name || 'Admin',
        email: user.email || 'admin@example.com',
      });
    }
  }, [user]);

  useEffect(() => {
    // ✅ Fetch products
    fetch(`${API_BASE}/products`)
      .then(res => res.json())
      .then(data => {
        const productList = Array.isArray(data) ? data : data.products || [];
        setProducts(productList);
        setMetrics(m => ({ ...m, totalProducts: productList.length }));
      })
      .catch(err => console.error('Failed to fetch products:', err));

    // ✅ Fetch users
    fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
          setMetrics(m => ({ ...m, totalUsers: data.length }));
        }
      })
      .catch(err => console.error('Failed to fetch users:', err));

    // ✅ Fetch orders
    fetch(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;

        setOrders(data);

        let totalRevenue = 0;
        let totalSales = 0;
        let totalOrders = data.length;
        let outfordelivery = 0;
        let shippingOrders = 0;
        let cancelledOrders = 0;

        data.forEach(order => {
          const items = Array.isArray(order.items) ? order.items : [];
          items.forEach(item => {
            totalRevenue += (item.price || 0) * (item.qty || 0);
            totalSales += (item.qty || 0);
          });

          const status = order.status;
          if (status === 'Out for Delivery') outfordelivery++;
          else if (status === 'Shipping') shippingOrders++;
          else if (status === 'Cancelled') cancelledOrders++;
        });

        setMetrics(m => ({
          ...m,
          totalRevenue,
          totalSales
        }));

        setOrderStats({ totalOrders, outfordelivery, shippingOrders, cancelledOrders });
      })
      .catch(err => console.error('Failed to fetch orders:', err));
  }, [API_BASE, token]);

  return (
    <div className="a-admin-dashboard">
      <Sidebar adminProfile={adminProfile} />
      <div className="a-dashboard-main">
        <div className="a-dashboard-greeting">
          <h2>Good afternoon, {adminProfile.name} 👋</h2>
          <p>{adminProfile.email}</p>
          <p>Here’s what’s happening with your dashboard today:</p>
        </div>

        <div className="a-metrics-container">
          <h3 className="a-metrics-title">Total Sales <div>Sales Summary</div></h3>
          <div className="a-summary-section">
            <div className="a-summary-card a-summary-card1">
              <div className="a-metric-value">{metrics.totalSales.toLocaleString()}</div>
              <div className="a-metric-label">Total Sales</div>
            </div>
            <div className="a-summary-card a-summary-card2">
              <div className="a-metric-value">₹{metrics.totalRevenue.toLocaleString()}</div>
              <div className="a-metric-label">Total Revenue</div>
            </div>
            <div className="a-summary-card a-summary-card3">
              <div className="a-metric-value">{metrics.totalUsers}</div>
              <div className="a-metric-label">Total Users</div>
            </div>
            <div className="a-summary-card a-summary-card4">
              <div className="a-metric-value">{metrics.totalProducts}</div>
              <div className="a-metric-label">Total Products</div>
            </div>
          </div>
        </div>

        <div className="a-charts-section">
          <div className="a-chart-box"><RevenueChart /></div>
          <div className="a-chart-box"><SalesChart /></div>
        </div>

        <div className="a-metrics-container">
          <h3 className="a-metrics-title">Order Statistics <div>Order Summary</div></h3>
          <div className="a-summary-section">
            <div className="a-summary-card a-summary-card1">
              <div className="a-metric-value">{orderStats.totalOrders}</div>
              <div className="a-metric-label">Total Orders</div>
            </div>
            <div className="a-summary-card a-summary-card2">
              <div className="a-metric-value">{orderStats.outfordelivery}</div>
              <div className="a-metric-label">Out for Delivery</div>
            </div>
            <div className="a-summary-card a-summary-card3">
              <div className="a-metric-value">{orderStats.shippingOrders}</div>
              <div className="a-metric-label">Shipping</div>
            </div>
            <div className="a-summary-card a-summary-card4">
              <div className="a-metric-value">{orderStats.cancelledOrders}</div>
              <div className="a-metric-label">Cancelled</div>
            </div>
          </div>
        </div>

        <div className="a-product-stock-section">
          <div className="a-table-section">
            <h3>Top Selling Products</h3>
            <table className="a-product-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .sort((a, b) => (b.sold || 0) - (a.sold || 0))
                  .slice(0, 7)
                  .map(product => (
                    <tr key={product.id}>
                      <td>{product.title}</td>
                      <td>₹{product.price}</td>
                      <td>{product.stock}</td>
                      <td>
                        <span className={`a-status-badge ${product.stock > 10 ? 'a-in-stock' : 'a-out-stock'}`}>
                          {product.stock > 10 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
