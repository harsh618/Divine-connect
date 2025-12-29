import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

const DivineCartContext = createContext();

export const useDivineCart = () => {
  const context = useContext(DivineCartContext);
  if (!context) throw new Error('useDivineCart must be used within DivineCartProvider');
  return context;
};

export function DivineCartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        toast.info('Slot already in Divine Cart');
        return prev;
      }
      toast.success('Added to Divine Cart!');
      return [...prev, { ...item, addedAt: new Date() }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
    toast.success('Removed from Divine Cart');
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success('Divine Cart cleared');
  };

  return (
    <DivineCartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </DivineCartContext.Provider>
  );
}