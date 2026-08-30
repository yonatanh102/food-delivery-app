import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from '../services/api';

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

    if (loading) {
        return (
            <div className="page-container">
                <div className="status-message text-gray-600">Loading restaurants...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="status-message text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="catalog-container">
            <h1 className="page-title">Explore Restaurants</h1>

            {restaurants.length === 0 ? (
                <p className="text-center text-gray-500">No restaurants found.</p>
            ) : (
                <div className="restaurant-card">
                    {restaurants.map(restaurant => (
                        <div key={restaurant._id} className="restaurant-card">
                            {/* image */}
                            <div className="card-image-placeholder">🏪</div>

                            {/* restaurant info */}
                            <div className="card-content">
                                <h2 className="card-title">{restaurant.name}</h2>
                                <p className="card-description">{restaurant.description || 'Delicious food delivered straight to your door.'}</p>

                                <div className="card-footer">
                                    <span className="card-footer">📍 {restaurant.address || 'Local'}</span>

                                    {/* menu button */}
                                    <Link to={`/restaurants/${restaurant._id}`} className="btn-action">View Menu</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}