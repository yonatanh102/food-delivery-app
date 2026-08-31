import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from '../services/api';
import './CartPage.css';

export default function CartPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const handleCheckout = async () => {
        try {
            const orderPayload = {
                restaurantId: cart.restaurantId,
                products: cart.items.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
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
                        <div>
                            <h3 className="item-name">{item.productName}</h3>
                            <p className="item-qty">Qty: {item.quantity}</p>
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
        </div>
    );
}