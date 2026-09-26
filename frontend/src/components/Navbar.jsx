import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">✈</span>
          <span>LOW<b>COST</b></span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={isActive('/')}>Главная</Link>
          {user && <Link to="/profile" className={isActive('/profile')}>Мои билеты</Link>}
          {user && <Link to="/favorites" className={isActive('/favorites')}>Избранное</Link>}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className={`${isActive('/admin')} admin-link`}>Админка</Link>
          )}
        </div>

        <div className="navbar-auth">
          {user ? (
            <div className="navbar-user">
              <span className="user-name">{user.fullName || user.username}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Выйти</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">Войти</Link>
          )}
        </div>
      </div>
    </nav>
  );
}