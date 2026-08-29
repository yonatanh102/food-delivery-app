import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import api from "../services/api";

export default function() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: ''});
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/users/login', formData);
            login(response.data.token);
            alert('Login Successful');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="page-container">
            <div className="form-card">
                <h2 className="form-title">Login</h2>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        onChange={handleChange} 
                        required 
                        className="input-field" />
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        onChange={handleChange} 
                        required 
                        className="input-field" />

                    <button type="submit" className="btn-primary">Login</button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/register" className="link-text">Register here</Link>
                </p>
            </div>
        </div>
    );
}