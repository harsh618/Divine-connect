import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/components/translations';
import { createPageUrl } from '@/utils';

export default function BackButton({ to, label }) {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className="mb-4 text-gray-600 hover:text-gray-900"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {label || t('common.back', language)}
    </Button>
  );
}