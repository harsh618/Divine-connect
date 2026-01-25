import React from 'react';
import { useTranslation } from './TranslationProvider';

// Higher-order component to inject translation
export function withTranslation(Component) {
  return function TranslatedComponent(props) {
    const { t, tAsync, language } = useTranslation();
    return <Component {...props} t={t} tAsync={tAsync} language={language} />;
  };
}

// Helper component for translating text nodes
export function T({ children, context }) {
  const { t } = useTranslation();
  
  if (typeof children === 'string') {
    return t(children);
  }
  
  return children;
}

export default T;