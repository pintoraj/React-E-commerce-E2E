import React, { useEffect, useState } from 'react';
import './AdminUsers.css';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../user-authentication/context/AuthContext';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const { user } = useAuth();
  const adminProfile = {
    name: user?.username || user?.name || 'Admin',
    email: user?.email || 'admin@example.com'
  };

  useEffect(() => {
    fetch('http://localhost:3001/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map(u => {
            const id = u.id?.toString() ?? '';
            const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
            const address = Array.isArray(u.addresses) && u.addresses.length > 0
              ? u.addresses[0].city ?? ''
              : '';

            let totalItems = 0;
            let totalPrice = 0;
            if (Array.isArray(u.orders)) {
              u.orders.forEach(order => {
                if (Array.isArray(order.items)) {
                  totalItems += order.items.reduce((sum, item) => sum + (item.qty || 0), 0);
                }
                totalPrice += order.total || 0;
              });
            }

            return {
              id,
              username: u.username ?? '',
              firstName: u.firstName ?? '',
              lastName: u.lastName ?? '',
              name,
              email: u.email ?? '',
              address,
              totalItems,
              totalPrice
            };
          });

          setUsers(mapped);
        } else {
          console.error('Unexpected user format:', data);
        }
      })
      .catch(err => console.error('Failed to fetch users:', err));
  }, []);

  const filteredUsers = users.filter(u => {
    const search = searchTerm.toLowerCase();
    return (
      u.id.toLowerCase().includes(search) ||
      u.firstName.toLowerCase().includes(search) ||
      u.lastName.toLowerCase().includes(search) ||
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.address.toLowerCase().includes(search)
    );
  });

  if (sortOrder === 'asc') {
    filteredUsers.sort((a, b) => a.firstName.localeCompare(b.firstName));
  } else if (sortOrder === 'desc') {
    filteredUsers.sort((a, b) => b.firstName.localeCompare(a.firstName));
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
              placeholder="Search by ID..."
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
              <option value="">No Filter</option>
              <option value="asc">Filter A–Z</option>
              <option value="desc">Filter Z–A</option>
            </select>
          </div>

          <table className="a-user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Total Items Ordered</th>
                <th>Total Price Ordered</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.address}</td>
                  <td>{u.totalItems}</td>
                  <td>{u.totalPrice}</td>
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
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
