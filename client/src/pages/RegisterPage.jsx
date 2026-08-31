import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from '../services/api';
import './Auth.css';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', address: '', phone: '', location: { lat: null, lng: null }
    });
    const [error, setError] = useState('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const getLocation = () => {
        if (!navigator.geolocation) { setError("Geolocation is not supported"); return; }
        setIsLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    if (data && data.display_name) {
                        setFormData((prev) => ({ ...prev, address: data.display_name, location: {lat: latitude, lng: longitude} }));
                        setError('');
                    }
                } catch (err) { setError("Failed to fetch address"); } 
                finally { setIsLoadingLocation(false); }
            },
            () => { setError("Unable to retrieve your location."); setIsLoadingLocation(false); }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/users', formData);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="page-container">
            <div className="form-card">
                <h2 className="form-title">Create Account</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="form-group">
                    <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required className="input-field" />
                    <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="input-field" />
                    <input type="password" name="password" placeholder="Password (min 6 chars)" onChange={handleChange} required className="input-field" />
                    <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required className="input-field" />
                    <div className="location-wrapper">
                        <input type="text" name="address" placeholder="Delivery Address" value={formData.address} onChange={handleChange} required className="input-field" />
                        <button type="button" onClick={getLocation} disabled={isLoadingLocation} className="btn-location" title="Get My Location">
                            {isLoadingLocation ? '⏳' : '📍'}
                        </button>
                    </div>
                    <button type="submit" className="btn-primary">Register</button>
                </form>
                <p className="form-footer">
                    Already have an account? <Link to="/login" className="link-text">Login here</Link>
                </p>
            </div>
        </div>
    );
}