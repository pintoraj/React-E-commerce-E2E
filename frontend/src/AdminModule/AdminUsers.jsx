import React, { useEffect, useState } from 'react';
import './AdminUsers.css';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../user-authentication/context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL;

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterCity, setFilterCity] = useState('');
  const [filterSpend, setFilterSpend] = useState('');
  const usersPerPage = 5;

  const { user, token } = useAuth();
  const adminProfile = {
    name: user?.username || user?.name || 'Admin',
    email: user?.email || 'admin@example.com'
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true);

    fetch(`${BASE_URL}/users/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => b.isAdmin - a.isAdmin); // Admin on top
          setUsers(sorted);
        } else {
          console.error('Unexpected user format:', data);
        }
      })
      .catch(err => console.error('Failed to fetch users:', err))
      .finally(() => setLoading(false));
  }, [token]);

  const filteredUsers = users
    .filter(u => {
      const search = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.address.toLowerCase().includes(search)
      );
    })
    .filter(u => (filterCity ? u.address.toLowerCase() === filterCity.toLowerCase() : true))
    .filter(u => (filterSpend === 'high' ? u.totalPrice > 5000 : true));

  switch (sortOrder) {
    case 'asc':
      filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'desc':
      filteredUsers.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'itemsAsc':
      filteredUsers.sort((a, b) => a.totalItems - b.totalItems);
      break;
    case 'itemsDesc':
      filteredUsers.sort((a, b) => b.totalItems - a.totalItems);
      break;
    case 'priceAsc':
      filteredUsers.sort((a, b) => a.totalPrice - b.totalPrice);
      break;
    case 'priceDesc':
      filteredUsers.sort((a, b) => b.totalPrice - a.totalPrice);
      break;
    default:
      break;
  }

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  return (
    <div className="a-admin-user-wrapper">
      <Sidebar adminProfile={adminProfile} />
      <div className="a-user-main">
        <div className="a-admin-user">
          <div className="a-user-header">
            <h2>User Management</h2>
          </div>

          <div className="a-search-bar">
            <input
              type="text"
              placeholder="Search by name, email, address..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="a-user-search"
            />
            <select
              value={sortOrder}
              onChange={e => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
              className="a-user-sort"
            >
              <option value="">No Sort</option>
              <option value="asc">Name A–Z</option>
              <option value="desc">Name Z–A</option>
              <option value="itemsAsc">Items ↑</option>
              <option value="itemsDesc">Items ↓</option>
              <option value="priceAsc">Price ↑</option>
              <option value="priceDesc">Price ↓</option>
            </select>
            <select
              value={filterCity}
              onChange={e => {
                setFilterCity(e.target.value);
                setCurrentPage(1);
              }}
              className="a-user-filter"
            >
              <option value="">All Cities</option>
              {[...new Set(users.map(u => u.address).filter(Boolean))].map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select
              value={filterSpend}
              onChange={e => {
                setFilterSpend(e.target.value);
                setCurrentPage(1);
              }}
              className="a-user-filter"
            >
              <option value="">All Spenders</option>
              <option value="high">High Spenders</option>
            </select>
          </div>

          {loading ? (
            <div className="a-loading">Loading users...</div>
          ) : (
            <table className="a-user-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Total Items Ordered</th>
                  <th>Total Price Ordered</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="a-empty-row">No users found</td>
                  </tr>
                ) : (
                  currentUsers.map((u, i) => (
                    <tr key={u.id}>
                      <td>{indexOfFirst + i + 1}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.address}</td>
                      <td>{u.totalItems}</td>
                      <td>₹{u.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

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
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
