import './Sidebar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../user-authentication/context/AuthContext';

function Sidebar({ adminProfile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, setRedirectPath } = useAuth();

  const menuItems = [
    { label: 'Dashboard', path: '/admin/' },
    { label: 'Products', path: '/admin/products' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Users', path: '/admin/users' }
  ];

  const handleLogout = () => {
    logout();
    setRedirectPath(null);
    localStorage.removeItem('admin');
    localStorage.removeItem('authToken');
    navigate('/login', { replace: true });
    window.location.reload();
  };

  return (
    <div className="a-sidebar">
      <div className="a-sidebar-header">
        <h2><span className="a-sidebar-name">{adminProfile.name}</span></h2>
        <span className="a-sidebar-email">{adminProfile.email}</span>
      </div>

      <ul className="a-sidebar-menu">
        {menuItems.map(item => (
          <li
            key={item.label}
            className={location.pathname === item.path ? 'a-active' : ''}
            onClick={() => navigate(item.path, { replace: true })}
          >
            {item.label}
          </li>
        ))}
      </ul>

      <div className="a-sidebar-logout">
        <button className="a-logout-button" onClick={handleLogout}>
          <FiLogOut className="a-logout-icon" />
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
