import './Sidebar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiLogOut, FiHome, FiBox, FiShoppingCart, FiUsers } from 'react-icons/fi';
import { useAuth } from '../user-authentication/context/AuthContext';

function Sidebar({ adminProfile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, setRedirectPath } = useAuth();

  const menuItems = [
    { label: 'Dashboard', path: '/admin/', icon: <FiHome /> },
    { label: 'Products', path: '/admin/products', icon: <FiBox /> },
    { label: 'Orders', path: '/admin/orders', icon: <FiShoppingCart /> },
    { label: 'Users', path: '/admin/users', icon: <FiUsers /> }
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
    <nav className="a-sidebar">
      <div className="a-sidebar-header">
        <h2><span className="a-sidebar-name">{adminProfile.name}</span></h2>
        <span className="a-sidebar-email">{adminProfile.email}</span>
      </div>

      <ul className="a-sidebar-menu">
        {menuItems.map(item => (
          <li
            key={item.label}
            className={location.pathname.startsWith(item.path) ? 'a-active' : ''}
            onClick={() => navigate(item.path, { replace: true })}
          >
            <span className="a-menu-icon">{item.icon}</span>
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
    </nav>
  );
}

export default Sidebar;
