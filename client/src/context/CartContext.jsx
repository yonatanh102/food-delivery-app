import { createContext, useState, useContext } from 'react';
import api from '../services/api'; 
import { useAuth } from './AuthContext'; 

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], restaurantId: null, restaurantName: null });
  const { user } = useAuth(); 

  const addToCart = async (product, restaurantId, restaurantName) => {
    
    setCart(prev => {
      if (prev.restaurantId && prev.restaurantId !== restaurantId) {
        alert("You can only order from one restaurant at a time. Clear your cart first.");
        return prev;
      }

      const existingItem = prev.items.find(item => item.productId === product._id);
      let updatedItems;
      
      if (existingItem) {
        updatedItems = prev.items.map(item =>
          item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedItems = [...prev.items, {
          productId: product._id,
          productName: product.name,
          price: product.price,
          quantity: 1
        }];
      }
      
      return { items: updatedItems, restaurantId, restaurantName };
    });

    if (user) {
        try {
            await api.post('/interactions/view', {
                userId: user.userId,
                items: [product._id]
            });
        } catch (err) {
            console.error('Failed to record product view', err);
        }
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    setCart(prev => {
      if (newQuantity < 1) {
        return {
          ...prev,
          items: prev.items.filter(item => item.productId !== productId)
        };
      }
      return {
        ...prev,
        items: prev.items.map(item =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      };
    });
  };

  const clearCart = () => setCart({ items: [], restaurantId: null, restaurantName: null });
  
  const cartTotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart, updateQuantity, cartTotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);