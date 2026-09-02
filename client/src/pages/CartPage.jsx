import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from '../services/api';
import './CartPage.css';

export default function CartPage() {
    const { cart, cartTotal, clearCart, updateQuantity, addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(false);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (cart.items.length === 0) {
                setRecommendations([]);
                return;
            }

            try {
                setLoadingRecs(true);
                const productIds = cart.items.map(item => item.productId);
                
                const response = await api.post('/recommendations/cart', { 
                    productIds, 
                    restaurantId: cart.restaurantId 
                });
                
                const inCartIds = new Set(productIds);
                const filteredRecs = response.data.filter(rec => !inCartIds.has(rec._id));
                
                setRecommendations(filteredRecs);
            } catch (err) {
                console.error('Failed to fetch recommendations', err);
            } finally {
                setLoadingRecs(false);
            }
        };

        fetchRecommendations();
        
    }, [cart.items.map(i => i.productId).join(',')]);

    const handleCheckout = async () => {
        try {
            const orderPayload = {
                restaurantId: cart.restaurantId,
                products: cart.items.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    price: item.price,
                    quantity: item.quantity
                })),
                description: "Standard delivery"
            };
            await api.post('/orders', orderPayload);
            alert('Order placed successfully! 🚀');
            clearCart();
            navigate('/orders');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to place order');
        }
    };

    const handleQuantityChange = async (productId, newQuantity) => {
        updateQuantity(productId, newQuantity);
        if (newQuantity < 1) {
            try {
                await api.delete(`/cart/${productId}`);
            } catch (err) {
                console.error('Failed to remove item from server', err);
            }
        }
    };

    if (cart.items.length === 0) return (
      <div className="page-container">
        <h2 className="empty-title">Your Cart is Empty 🛒</h2>
        <button onClick={() => navigate('/')} className="btn-primary">Go back to menu</button>
      </div>
    );

    return (
        <div className="cart-container">
            <h1 className="page-title">Your Order from {cart.restaurantName}</h1>
            <div className="cart-list">
                {cart.items.map(item => (
                    <div key={item.productId} className="cart-item">
                        <div className="item-info">
                            <h3 className="item-name">{item.productName}</h3>
                            <div className="cart-qty">
                                <button onClick={() => handleQuantityChange(item.productId, item.quantity - 1)} className="btn-qty">-</button>
                                <span>Qty: {item.quantity}</span>
                                <button onClick={() => handleQuantityChange(item.productId, item.quantity + 1)} className="btn-qty">+</button>
                            </div>
                        </div>
                        <p className="item-price">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            
            <div className="cart-summary">
                <h2>Total: ${cartTotal.toFixed(2)}</h2>
                <div className="cart-actions">
                    <button onClick={clearCart} className="btn-clear">Clear Cart</button>
                    <button onClick={handleCheckout} className="btn-primary">Checkout</button>
                </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="recommendations-section" style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Frequently Bought Together 💡</h2>
                    <div className="recommendations-grid" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                        {recommendations.map(product => (
                            <div key={product._id} style={{ minWidth: '200px', backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                {product.image && <img src={product.image} alt={product.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }} />}
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{product.name}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold' }}>${Number(product.price).toFixed(2)}</span>
                                    <button 
                                        onClick={() => addToCart(product, cart.restaurantId, cart.restaurantName)}
                                        style={{ backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                                    >
                                        + Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}