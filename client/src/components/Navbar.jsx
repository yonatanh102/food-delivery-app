import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();
    
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className='navbar-container'>
            <div className='navbar-inner'>
                <Link to="/" className='navbar-logo'>🍔 FoodDelivery</Link>

                <div className='navbar-links'>
                    {user ? (
                        <>
                            {/* for connected users */}
                            <span className='user-badge'>
                                Hi, {user.name}!
                            </span>

                            <Link to="/" className='nav-link'>Restaurants</Link>
                            <Link to="/orders" className='nav-link'>My Orders</Link>
                            
                            {/* cart */}
                            <div className="nav-cart-wrapper">
                                <Link to="/cart" className="nav-link">
                                    🛒 My Cart
                                </Link>
                                ({itemCount > 0 && <span className="badge-icon">{itemCount}</span>})
                            </div>

                            {/* admin panel */}
                            {user.role === 'admin' && (
                                <Link to="/admin" className='nav-link-admin'>
                                    Dashboard
                                </Link>
                            )}

                            <button onClick={handleLogout} className='btn-logout'>
                                Logout
                            </button>

                            {/* theme button */}
                            <button 
                                onClick={() => setIsDark(!isDark)} 
                                className="theme-toggle-btn"
                                title="Toggle Dark Mode"
                            >
                                {isDark ? '☀️' : '🌙'}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* for guests */}
                            <Link to="/login" className='nav-link'>Login</Link>
                            <Link to="/register" className='btn-register'>Register</Link>
                            
                            <button 
                                onClick={() => setIsDark(!isDark)} 
                                className="theme-toggle-btn"
                                title="Toggle Dark Mode"
                            >
                                {isDark ? '☀️' : '🌙'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}