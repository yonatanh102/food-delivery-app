import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from '../services/api';
import './OrdersPage.css';

export default function OrderPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders');
                setOrders(response.data.reverse());
            } catch (err) {
                setError('Failed to load your orders.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusClass = (status) => {
        switch(status?.toLowerCase()) {
            case 'pending': return 'status-pending';
            case 'accepted': return 'status-accepted';
            case 'delivered': return 'status-delivered';
            case 'cancelled': return 'status-cancelled';
            default: return 'status-pending';
        }
    };

    if (loading) return <div className="page-container"><div className="status-message">Loading orders... 📦</div></div>;
    if (error) return <div className="page-container"><div className="status-message" style={{color: '#ef4444'}}>{error}</div></div>;

    return (
        <div className="orders-container">
            <h1 className="page-title" style={{textAlign: 'left'}}>My Orders</h1>
            {orders.length === 0 ? (
                <div className="empty-orders">
                    <p className="empty-text">You haven't placed any orders yet.</p>
                    <Link to="/" className="btn-primary">Start Exploring</Link>
                </div>
            ) : (
                orders.map(order => (
                <div key={order._id} className="order-card">
                    <div className="order-header">
                        <div>
                            <p className="order-id">Order ID: {order._id}</p>
                            <p className="order-date">Date: {new Date(order.orderTime).toLocaleDateString()}</p>
                        </div>
                        <span className={`order-status ${getStatusClass(order.status)}`}>
                            {order.status ? order.status.toUpperCase() : 'PENDING'}
                        </span>
                    </div>

                    <h3 className="order-items-title">Items:</h3>
                    <ul className="order-items-list">
                        {order.products.map((item, index) => (
                            <li key={index} className="order-item">
                                <span>{item.quantity}x {item.productName}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="order-footer">
                        Delivery to: <span className="delivery-address">{order.address || 'Address on file'}</span>
                    </div>
                </div>
            )))}
        </div>
    );
}