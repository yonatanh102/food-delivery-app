import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from '../services/api';
import './HomePage.css';

export default function HomePage() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await api.get('/restaurants');
                setRestaurants(response.data);
            } catch (err) {
                setError('Failed to load restaurants.');
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    if (loading) return <div className="page-container"><div className="status-message">Loading restaurants...</div></div>;
    if (error) return <div className="page-container"><div className="status-message" style={{color: '#ef4444'}}>{error}</div></div>;

    return (
        <div className="catalog-container">
            <h1 className="page-title center">Explore Restaurants</h1>

            {restaurants.length === 0 ? (
                <p className="empty-message">No restaurants found.</p>
            ) : (
                <div className="card-grid">
                    {restaurants.map(restaurant => (
                        <div key={restaurant._id} className="restaurant-card">
                            {restaurant.logo ? (
                                <img src={restaurant.logo} alt={restaurant.name} className="card-image" />
                            ) : (
                                <div className="card-image-placeholder">🏪</div>
                            )}

                            <div className="card-content">
                                <h2 className="card-title">{restaurant.name}</h2>
                                <p className="card-description">{restaurant.description || 'Delicious food delivered straight to your door.'}</p>

                                <div className="card-footer">
                                    <span className="card-address">📍 {restaurant.address || 'Local'}</span>
                                    <Link to={`/restaurants/${restaurant._id}`} className="btn-primary">View Menu</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}