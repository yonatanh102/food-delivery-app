import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className='navbar-container'>
            <div className='navbar-inner'>
                {}
                <Link to="/" className='navbar-logo'>
                FoodDelivery
                </Link>

                <div className='navbar-links'>
                    {user ? (
                        <>
                        {/* shows only for logged users */}
                        <span className=''>
                            Hi, {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>

                        <Link to="/" className='nav-link'>Restaurants</Link>
                        <Link to="/orders" className='nav-link'>My Orders</Link>

                        {user.role === 'admin' && (
                            <Link to="/admin" className='nav-link-admin'>
                                Dashboard
                            </Link>
                        )}

                        <button onClick={handleLogout} className='nav-link-admin'>
                            Logout
                        </button>
                        </>
                    ) : (
                    <>
                        {/* shows for guests */}
                        <Link to="/login" className='nav-link'>Login</Link>
                        <Link to="/register" className='nav-link'>Register</Link>
                    </>
                    )}
                </div>
            </div>
        </nav>
    );
}