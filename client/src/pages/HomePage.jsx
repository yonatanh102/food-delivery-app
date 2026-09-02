import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from '../services/api';
import { calculateDistance } from '../utils/distance';
import './HomePage.css';

export default function HomePage() {
    const { user } = useAuth(); 
    
    const [restaurants, setRestaurants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userLocation, setUserLocation] = useState(null);

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

        if (user && user.location?.lat && user.location?.lng) {
            // option a: user is logged in and has a location
            setUserLocation({
                lat: user.location.lat,
                lng: user.location.lng
            });
        } else if ("geolocation" in navigator) {
            // option b: guest user (or without location) - request location from browser
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => {
                    console.warn("Location access denied. Using default fallback.");
                    setUserLocation({ lat: 31.2588, lng: 35.2128 });
                }
            );
        } else {
            // option c: geolocation not available - fallback to default location
            setUserLocation({ lat: 31.2588, lng: 35.2128 });
        }
    }, [user]); 

    if (loading) return <div className="page-container"><div className="status-message">Loading restaurants...</div></div>;
    if (error) return <div className="page-container"><div className="status-message" style={{color: '#ef4444'}}>{error}</div></div>;

    const isSearching = searchTerm.trim() !== '';

    const processedRestaurants = restaurants.map(restaurant => {
        let distance = null;
        if (userLocation && restaurant.location?.lat && restaurant.location?.lng) {
            distance = calculateDistance(userLocation.lat, userLocation.lng, restaurant.location.lat, restaurant.location.lng);
        }
        return { ...restaurant, distance };
    }).sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
    });

    const displayRestaurants = !isSearching 
        ? processedRestaurants 
        : processedRestaurants.filter(restaurant => 
            restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    return (
        <div className="catalog-container">
            <h1 className="page-title center">Explore Restaurants</h1>
            
            <div className="search-container"> 
                <input 
                    type="text"
                    placeholder="Search for restaurants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {restaurants.length === 0 ? (
                <p className="empty-message">No restaurants available right now.</p>
            ) : displayRestaurants.length === 0 ? (
                <p className="empty-message">No restaurants found matching "{searchTerm}".</p>
            ) : (
                <div className="card-grid">
                    {displayRestaurants.map(restaurant => (
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
                                    <span className="card-address" style={{ fontWeight: '500', color: 'var(--primary-color)' }}>
                                        {restaurant.distance !== null 
                                            ? `📍 ${restaurant.distance.toFixed(1)} km away` 
                                            : `📍 ${restaurant.address || 'Local'}`}
                                    </span>
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