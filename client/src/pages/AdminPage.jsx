import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from '../services/api';
import './AdminPage.css';

export default function AdminPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // States for Orders
    const [allOrders, setAllOrders] = useState([]);
    
    // States for Restaurants
    const [restaurants, setRestaurants] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const initialFormState = { name: '', description: '', address: '', logo: '', banner: '', location: { lat: '', lng: '' } };
    const [formData, setFormData] = useState(initialFormState);
    
    // --- States for Products (Menu Management) ---
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [products, setProducts] = useState([]);
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const initialProductFormState = { name: '', description: '', price: '', calories: '', limited: false, image: '' };
    const [productFormData, setProductFormData] = useState(initialProductFormState);

    // Global States
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (user?.role === 'admin') {
            if (activeTab === 'orders') fetchAllOrders();
            else if (activeTab === 'restaurants') fetchRestaurants();
        }
    }, [user, activeTab]);

    // --- Orders Logic ---
    const fetchAllOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders/all');
            setAllOrders(response.data.reverse());
        } catch (err) {
            setError('Failed to load system orders.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus });
            setAllOrders(prevOrders => prevOrders.map(order => order._id === orderId ? { ...order, status: newStatus } : order));
        } catch (err) {
            alert('Failed to update order status');
        }
    };

    // --- Restaurants Logic ---
    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const response = await api.get('/restaurants');
            setRestaurants(response.data);
            setSelectedRestaurant(null); 
        } catch (err) {
            setError('Failed to load restaurants.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (restaurant) => {
        setFormData({
            name: restaurant.name || '',
            description: restaurant.description || '',
            address: restaurant.address || '',
            logo: restaurant.logo || '',
            banner: restaurant.banner || '',
            location: {
                lat: restaurant.location?.lat || '',
                lng: restaurant.location?.lng || ''
            }
        });
        setEditingId(restaurant._id);
        setShowForm(true);
    };

    const handleDeleteRestaurant = async (id) => {
        if (!window.confirm('Are you sure you want to delete this restaurant? This might leave orphaned products.')) return;
        try {
            await api.delete(`/restaurants/${id}`);
            setRestaurants(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            alert('Failed to delete restaurant.');
        }
    };

    const handleSaveRestaurant = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const response = await api.put(`/restaurants/${editingId}`, formData);
                setRestaurants(prev => prev.map(r => r._id === editingId ? response.data : r));
            } else {
                const response = await api.post('/restaurants', formData);
                setRestaurants([...restaurants, response.data]);
            }
            setShowForm(false);
            setEditingId(null);
            setFormData(initialFormState);
        } catch (err) {
            alert('Failed to save restaurant. Please check your inputs.');
        }
    };

    // --- Products (Menu) Logic ---
    const handleManageMenu = async (restaurant) => {
        setSelectedRestaurant(restaurant);
        setShowForm(false);
        try {
            const response = await api.get('/products');
            const restaurantProducts = response.data.filter(p => p.restaurantId === restaurant._id);
            setProducts(restaurantProducts);
        } catch (err) {
            alert('Failed to load products');
        }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            if (editingProductId) {
                const response = await api.put(`/products/${editingProductId}`, productFormData);
                setProducts(prev => prev.map(p => p._id === editingProductId ? response.data : p));
            } else {
                const payload = { ...productFormData, restaurantId: selectedRestaurant._id };
                const response = await api.post('/products', payload);
                setProducts([...products, response.data]);
            }
            setShowProductForm(false);
            setEditingProductId(null);
            setProductFormData(initialProductFormState);
        } catch (err) {
            alert('Failed to save product.');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            alert('Failed to delete product.');
        }
    };

    const handleEditProductClick = (product) => {
        setProductFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            calories: product.calories || '',
            limited: product.limited || false,
            image: product.image || ''
        });
        setEditingProductId(product._id);
        setShowProductForm(true);
    };


    if (loading && allOrders.length === 0 && restaurants.length === 0) {
        return <div className="page-container"><div className="status-message">Loading dashboard...</div></div>;
    }
    if (error) { 
        return <div className="page-container"><div className="status-message" style={{color: '#ef4444'}}>{error}</div></div>;
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="page-title" style={{margin: 0}}>Admin Dashboard</h1>
            </div>

            <div className="admin-tabs">
                <button 
                    className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Manage Orders
                </button>
                <button 
                    className={`tab-button ${activeTab === 'restaurants' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('restaurants');
                        setSelectedRestaurant(null);
                    }}
                >
                    Manage Restaurants
                </button>
            </div>

            {/* TAB 1: ORDERS */}
            {activeTab === 'orders' && (
                <div className="admin-table-wrapper">
                    {allOrders.length === 0 ? (
                        <p className="status-message">No orders in the system yet.</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Customer Address</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allOrders.map(order => (
                                    <tr key={order._id}>
                                        <td style={{fontSize: '0.875rem'}}>{order._id}</td>
                                        <td>{new Date(order.createdAt || order.orderTime).toLocaleString()}</td>
                                        <td>{order.address || 'Address on file'}</td>
                                        <td>
                                            <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem'}}>
                                                {order.products.map((item, idx) => (
                                                    <li key={idx}>{item.quantity}x {item.productName}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td style={{fontWeight: 'bold'}}>
                                            ${order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}
                                            <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal'}}>
                                                ({order.products?.length || 0} Items)
                                            </div>
                                        </td>
                                        <td>
                                            <select 
                                                className="status-select"
                                                value={order.status || 'pending'}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="accepted">Accepted</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* TAB 2: RESTAURANTS & MENU */}
            {activeTab === 'restaurants' && (
                <div>
                    {!selectedRestaurant ? (
                        // ============================================
                        // VIEW A: RESTAURANTS LIST
                        // ============================================
                        <>
                            <div className="admin-section-header">
                                <h2 style={{ margin: 0 }}>Restaurants Management</h2>
                                {!showForm && (
                                    <button className="btn-add" onClick={() => { setFormData(initialFormState); setEditingId(null); setShowForm(true); }}>
                                        + Add New Restaurant
                                    </button>
                                )}
                            </div>

                            {/* Form for Add/Edit Restaurant */}
                            {showForm && (
                                <div className="admin-form-container">
                                    <h3>{editingId ? 'Edit Restaurant' : 'Add New Restaurant'}</h3>
                                    <form onSubmit={handleSaveRestaurant} className="admin-form">
                                        <input className="form-input" type="text" placeholder="Restaurant Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                        <input className="form-input" type="text" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                                        <input className="form-input" type="text" placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                                        <div className="form-row">
                                            <input className="form-input" type="text" placeholder="Logo URL (Optional)" value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} />
                                            <input className="form-input" type="text" placeholder="Banner URL (Optional)" value={formData.banner} onChange={e => setFormData({...formData, banner: e.target.value})} />
                                        </div>
                                        <div className="form-row">
                                            <input className="form-input" type="number" step="any" placeholder="Latitude (e.g., 32.0853)" value={formData.location.lat} onChange={e => setFormData({...formData, location: {...formData.location, lat: e.target.value}})} required />
                                            <input className="form-input" type="number" step="any" placeholder="Longitude (e.g., 34.7818)" value={formData.location.lng} onChange={e => setFormData({...formData, location: {...formData.location, lng: e.target.value}})} required />
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit" className="btn-save">Save Restaurant</button>
                                            <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Restaurants Table */}
                            <div className="admin-table-wrapper">
                                {restaurants.length === 0 ? (
                                    <p className="status-message" style={{padding: '1rem'}}>No restaurants in the system.</p>
                                ) : (
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Logo</th>
                                                <th>Name</th>
                                                <th>Address</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {restaurants.map(restaurant => (
                                                <tr key={restaurant._id}>
                                                    <td>
                                                        {restaurant.logo ? (
                                                            <img src={restaurant.logo} alt={restaurant.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <span style={{ fontSize: '1.5rem' }}>🏪</span>
                                                        )}
                                                    </td>
                                                    <td style={{ fontWeight: 'bold' }}>{restaurant.name}</td>
                                                    <td>{restaurant.address}</td>
                                                    <td>
                                                        <button type="button" className="btn-edit" style={{ borderColor: '#10b981', color: '#10b981', marginRight: '0.5rem' }} onClick={() => handleManageMenu(restaurant)}>Menu</button>
                                                        <button type="button" className="btn-edit" onClick={() => handleEditClick(restaurant)}>Edit</button>
                                                        <button type="button" className="btn-delete" onClick={() => handleDeleteRestaurant(restaurant._id)}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    ) : (
                        // ============================================
                        // VIEW B: PRODUCTS LIST FOR SELECTED RESTAURANT
                        // ============================================
                        <>
                            <div className="admin-section-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button className="btn-cancel" style={{ padding: '0.5rem 1rem' }} onClick={() => { setSelectedRestaurant(null); setShowProductForm(false); }}>← Back</button>
                                    <h2 style={{ margin: 0 }}>Menu: {selectedRestaurant.name}</h2>
                                </div>
                                {!showProductForm && (
                                    <button className="btn-add" onClick={() => { setProductFormData(initialProductFormState); setEditingProductId(null); setShowProductForm(true); }}>
                                        + Add New Product
                                    </button>
                                )}
                            </div>

                            {/* Form for Add/Edit Product */}
                            {showProductForm && (
                                <div className="admin-form-container">
                                    <h3>{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
                                    <form onSubmit={handleSaveProduct} className="admin-form">
                                        <div className="form-row">
                                            <input className="form-input" type="text" placeholder="Product Name" value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} required />
                                            <input className="form-input" type="number" step="any" placeholder="Price ($)" value={productFormData.price} onChange={e => setProductFormData({...productFormData, price: e.target.value})} required />
                                        </div>
                                        <input className="form-input" type="text" placeholder="Description" value={productFormData.description} onChange={e => setProductFormData({...productFormData, description: e.target.value})} required />
                                        <div className="form-row">
                                            <input className="form-input" type="number" placeholder="Calories (e.g., 450)" value={productFormData.calories} onChange={e => setProductFormData({...productFormData, calories: e.target.value})} />
                                            <input className="form-input" type="text" placeholder="Image URL (Optional)" value={productFormData.image} onChange={e => setProductFormData({...productFormData, image: e.target.value})} />
                                        </div>
                                        <div className="form-row" style={{ alignItems: 'center', marginTop: '0.5rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-main)', fontWeight: '500' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={productFormData.limited} 
                                                    onChange={e => setProductFormData({...productFormData, limited: e.target.checked})} 
                                                    style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                                                />
                                                Limited Edition
                                            </label>
                                        </div>

                                        <div className="form-actions">
                                            <button type="submit" className="btn-save">Save Product</button>
                                            <button type="button" className="btn-cancel" onClick={() => setShowProductForm(false)}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Products Table */}
                            <div className="admin-table-wrapper">
                                {products.length === 0 ? (
                                    <p className="status-message" style={{padding: '1rem'}}>No products found in this menu.</p>
                                ) : (
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Image</th>
                                                <th>Name</th>
                                                <th>Price</th>
                                                <th>Calories</th>
                                                <th>Limited</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(product => (
                                                <tr key={product._id}>
                                                    <td>
                                                        {product.image ? (
                                                            <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                                        ) : (
                                                            <span style={{ fontSize: '1.5rem' }}>🍔</span>
                                                        )}
                                                    </td>
                                                    <td style={{ fontWeight: 'bold' }}>{product.name}</td>
                                                    <td>${Number(product.price).toFixed(2)}</td>
                                                    <td>{product.calories ? `${product.calories} kcal` : '-'}</td>
                                                    <td>
                                                        {product.limited ? (
                                                            <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold' }}>Yes</span>
                                                        ) : (
                                                            <span style={{ color: 'var(--text-muted)' }}>No</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button type="button" className="btn-edit" onClick={() => handleEditProductClick(product)}>Edit</button>
                                                        <button type="button" className="btn-delete" onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}