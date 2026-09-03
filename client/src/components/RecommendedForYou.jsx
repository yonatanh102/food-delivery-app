import { useState, useEffect } from 'react';
import api from '../services/api';

export default function RecommendedForYou() {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await api.get('/recommendations');
                setRecommendations(response.data);
            } catch (err) {
                console.error('Failed to load recommendations');
            } finally {
                setLoading(false);
            }
        };
        
        fetchRecommendations();
    }, []);

    // if no recommendations or still loading, don't render anything
    if (loading || recommendations.length === 0) return null;

    return (
        <div className="recommendations-section" style={{ marginTop: '3rem', marginBottom: '2rem' }}>
            <h2 style={{ borderBottom: '2px solid var(--primary-color)', display: 'inline-block', paddingBottom: '0.5rem' }}>
                ✨ Recommended For You
            </h2>
            
            <div className="card-grid" style={{ marginTop: '1.5rem' }}>
                {recommendations.map(product => (
                    <div key={product._id} className="restaurant-card" style={{ padding: '1rem' }}>
                        {product.image ? (
                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                        ) : (
                            <div style={{ fontSize: '3rem', textAlign: 'center', padding: '2rem' }}>🍔</div>
                        )}
                        <h3 style={{ margin: '0.5rem 0' }}>{product.name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{product.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontWeight: 'bold' }}>
                            <span>${Number(product.price).toFixed(2)}</span>
                            <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Add</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}