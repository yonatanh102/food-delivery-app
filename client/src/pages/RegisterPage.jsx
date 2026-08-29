import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from '../services/api';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', address: '', phone: '', location: { lat: null, lng: null }
    });
    const [error, setError] = useState('');
    const [isLoadingLocation, setIsLoadingLocation] = useState('false');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setIsLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();

                    if (data && data.display_name) {
                        setFormData((prev) => ({ 
                            ...prev, 
                            address: data.display_name, 
                            location: {lat: latitude, lng: longitude} 
                        }));
                        setError('');
                    }
                } catch (err) {
                    setError("Failed to fetch address from coordinates");
                } finally {
                    setIsLoadingLocation(false);
                }
            },
            () => {
                setError("Unable to retrieve your location. Please check your browser permissions.");
                setIsLoadingLocation(false);
            }
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Full Name" 
                        onChange={handleChange} 
                        required 
                        className="input-field" 
                    />
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        onChange={handleChange} 
                        required 
                        className="input-field" 
                    />
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password (min 6 chars)" 
                        onChange={handleChange} 
                        required 
                        className="input-field" 
                    />
                    <input 
                        type="text" 
                        name="phone" 
                        placeholder="Phone Number" 
                        onChange={handleChange} 
                        required 
                        className="input-field" 
                    />
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            name="Adrees" 
                            placeholder="Delivery Address"
                            value={formData.address}
                            onChange={handleChange} 
                            required 
                            className="input-field flex-1" 
                        />
                        <button
                            type="button" 
                            onClick={getLocation} 
                            disabled={isLoadingLocation}
                            className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 transition cursor-pointer disabled:opacity-50"
                            title="Get My Location"
                        >{isLoadingLocation ? '⏳' : '📍'}</button>
                    </div>

                    <button className="btn-primary">Register</button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="link-text">Login here</Link>
                </p>
            </div>
        </div>
    );
}