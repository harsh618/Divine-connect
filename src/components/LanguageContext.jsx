import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserLanguage = async () => {
      try {
        // First check if user is authenticated
        const isAuthenticated = await base44.auth.isAuthenticated();
        if (!isAuthenticated) {
          setLanguage('en');
          setLoading(false);
          return;
        }
        
        const user = await base44.auth.me();
        if (user?.preferred_language) {
          setLanguage(user.preferred_language);
        }
      } catch {
        setLanguage('en');
      } finally {
        setLoading(false);
      }
    };
    loadUserLanguage();
  }, []);

  const changeLanguage = async (newLanguage) => {
    setLanguage(newLanguage);
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (isAuthenticated) {
        await base44.auth.updateMe({ preferred_language: newLanguage });
      }
    } catch (error) {
      console.error('Failed to update language preference:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, loading }}>
      {children}
    </LanguageContext.Provider>
  );
};