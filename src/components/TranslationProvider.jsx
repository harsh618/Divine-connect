import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from './LanguageContext';

const TranslationContext = createContext();

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};

export const TranslationProvider = ({ children }) => {
  const { language } = useLanguage();
  const [cache, setCache] = useState({});
  const [pending, setPending] = useState(new Set());

  // Load cache from localStorage on mount
  useEffect(() => {
    const savedCache = localStorage.getItem('translation_cache');
    if (savedCache) {
      try {
        setCache(JSON.parse(savedCache));
      } catch (e) {
        console.error('Failed to load translation cache:', e);
      }
    }
  }, []);

  // Save cache to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('translation_cache', JSON.stringify(cache));
  }, [cache]);

  const translate = useCallback(async (text, targetLang) => {
    if (!text || typeof text !== 'string') return text;
    if (targetLang === 'en') return text; // No translation needed for English

    const cacheKey = `${targetLang}:${text}`;
    
    // Check cache first
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }

    // Check if already pending
    if (pending.has(cacheKey)) {
      // Wait a bit and check cache again
      await new Promise(resolve => setTimeout(resolve, 100));
      return cache[cacheKey] || text;
    }

    // Mark as pending
    setPending(prev => new Set(prev).add(cacheKey));

    try {
      const languageNames = {
        hi: 'Hindi',
        ml: 'Malayalam',
        ta: 'Tamil',
        te: 'Telugu'
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following text to ${languageNames[targetLang]}. Only return the translated text, nothing else:\n\n${text}`,
        add_context_from_internet: false
      });

      const translation = result.trim();
      
      // Update cache
      setCache(prev => ({
        ...prev,
        [cacheKey]: translation
      }));

      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    } finally {
      setPending(prev => {
        const newPending = new Set(prev);
        newPending.delete(cacheKey);
        return newPending;
      });
    }
  }, [cache, pending]);

  const t = useCallback((text) => {
    if (language === 'en' || !text) return text;
    
    const cacheKey = `${language}:${text}`;
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }

    // Translate in background
    translate(text, language);
    
    // Return original text while translating
    return text;
  }, [language, cache, translate]);

  const tAsync = useCallback(async (text) => {
    if (language === 'en' || !text) return text;
    return await translate(text, language);
  }, [language, translate]);

  return (
    <TranslationContext.Provider value={{ t, tAsync, language }}>
      {children}
    </TranslationContext.Provider>
  );
};