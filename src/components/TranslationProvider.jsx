import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
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
  const pendingBatchRef = useRef([]);
  const batchTimeoutRef = useRef(null);

  // Load cache from localStorage on mount
  useEffect(() => {
    const savedCache = localStorage.getItem('translation_cache_v2');
    if (savedCache) {
      try {
        setCache(JSON.parse(savedCache));
      } catch (e) {
        console.error('Failed to load translation cache:', e);
      }
    }
  }, []);

  // Save cache to localStorage whenever it changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('translation_cache_v2', JSON.stringify(cache));
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [cache]);

  // Batch translation function
  const batchTranslate = useCallback(async (texts, targetLang) => {
    if (!texts || texts.length === 0) return {};
    if (targetLang === 'en') return {};

    try {
      // Filter out already cached texts
      const textsToTranslate = texts.filter(text => {
        const cacheKey = `${targetLang}:${text}`;
        return !cache[cacheKey];
      });

      if (textsToTranslate.length === 0) return {};

      const response = await base44.functions.invoke('translateText', {
        texts: textsToTranslate,
        targetLanguage: targetLang
      });

      const translations = response.data.translations;
      
      // Update cache with all translations
      const newCache = {};
      textsToTranslate.forEach((text, index) => {
        const cacheKey = `${targetLang}:${text}`;
        newCache[cacheKey] = translations[index];
      });

      setCache(prev => ({
        ...prev,
        ...newCache
      }));

      return newCache;
    } catch (error) {
      console.error('Batch translation error:', error);
      return {};
    }
  }, [cache]);

  const translate = useCallback(async (text, targetLang) => {
    if (!text || typeof text !== 'string') return text;
    if (targetLang === 'en') return text;

    const cacheKey = `${targetLang}:${text}`;
    
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }

    // Add to pending batch
    if (!pendingBatchRef.current.includes(text)) {
      pendingBatchRef.current.push(text);
    }

    // Clear existing timeout
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }

    // Set new timeout to process batch
    batchTimeoutRef.current = setTimeout(async () => {
      const textsToTranslate = [...pendingBatchRef.current];
      pendingBatchRef.current = [];

      if (textsToTranslate.length > 0) {
        await batchTranslate(textsToTranslate, targetLang);
      }
    }, 50);

    // Return cached if available after a short wait, otherwise original text
    await new Promise(resolve => setTimeout(resolve, 100));
    return cache[cacheKey] || text;
  }, [cache, batchTranslate]);

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