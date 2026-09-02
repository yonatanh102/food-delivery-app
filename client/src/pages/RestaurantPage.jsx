import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from '../services/api';
import './RestaurantPage.css';

export default function RestaurantPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [restaurant, setRestaurant] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, SetLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRestaurantAndMenu = async () => {
            try {
                const resResponse = await api.get(`/restaurants/${id}`);
                setRestaurant(resResponse.data);
                const prodResponse = await api.get('/products');
                const restaurantProducts = prodResponse.data.filter(product => product.restaurantId === id);
                setProducts(restaurantProducts);
            } catch (err) {
                setError('Failed to load restaurant details.');
            } finally {
                SetLoading(false);
            }
        };
        fetchRestaurantAndMenu();
    }, [id]);

    if (loading) return <div className="page-container"><div className="status-message">Loading menu...</div></div>;
    if (error || !restaurant) return (
        <div className="page-container">
            <div className="status-message" style={{color: '#ef4444', marginBottom: '1rem'}}>{error || 'Restaurant not found'}</div>
            <button onClick={() => navigate('/')} className="btn-primary">Back to Catalog</button>
        </div>
    );

    return (
        <div className="restaurant-page-wrapper">
            <div className="restaurant-header" style={restaurant.banner ? { backgroundImage: `url(${restaurant.banner})` } : {}}>
                <div className="restaurant-header-overlay"></div>
                <div className="restaurant-header-content">
                    <h1 className="restaurant-title">{restaurant.name}</h1>
                    <p className="restaurant-info">{restaurant.description}</p>
                    <p className="restaurant-address">📍 {restaurant.address}</p>
                </div>
            </div>

            <div className="menu-section">
                <h2 className="section-title">Menu</h2>
                {products.length === 0 ? (
                    <p className="status-message">No products available yet.</p>
                ) : (
                    <div className="menu-grid">
                        {products.map(product => (
                            <div key={product._id} className="product-card">
                                <div className="product-thumbnail" onClick={() => setSelectedImage(product)}>
                                    {product.image ? <img src={product.image} alt={product.name} className="product-thumb-img" /> : '🍽️'}
                                </div>
                                <div className="product-details">
                                    {product.limited && <span className="badge-limited">Limited Time</span>}
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-desc">{product.description || 'Fresh & tasty'}</p>
                                    <div className="product-meta">
                                        <p className="product-price">${product.price?.toFixed(2)}</p>
                                        {product.calories && <span className="calories-badge">🔥 {product.calories} Cal</span>}
                                    </div>
                                </div>
                                <button onClick={() => addToCart(product, restaurant._id, restaurant.name)} className="btn-add">+ Add</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedImage && (
                <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedImage(null)}>&times;</button>
                        <div className="modal-image">
                            {selectedImage.image ? <img src={selectedImage.image} alt={selectedImage.name} className="modal-image-full" /> : '🍽️'}
                        </div>
                        <h3 className="restaurant-title" style={{color: 'var(--text-main)'}}>{selectedImage.name}</h3>
                        {selectedImage.calories && <p className="calories-badge" style={{display:'inline-block', marginTop:'0.5rem'}}>🔥 {selectedImage.calories} Calories</p>}
                    </div>
                </div>
            )}
        </div>
    );
}