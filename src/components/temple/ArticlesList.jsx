import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/components/translations';

export default function ArticlesList({ articles, loading, maxArticles = 3 }) {
  const { language } = useLanguage();
  const [expandedArticles, setExpandedArticles] = useState(new Set());
  const [showAll, setShowAll] = useState(false);

  // Filter articles by user's preferred language
  const filteredArticles = articles?.filter(article => 
    article.language === language || article.language === 'en'
  ) || [];

  const toggleArticle = (id) => {
    const newExpanded = new Set(expandedArticles);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedArticles(newExpanded);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-amber-600 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('articles.title', language)}</h2>
            <p className="text-sm text-gray-500">{t('common.loading', language)}</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-1" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!filteredArticles || filteredArticles.length === 0) {
    return null;
  }

  const displayedArticles = showAll ? filteredArticles : filteredArticles.slice(0, maxArticles);

  return (
    <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t('articles.title', language)}</h2>
          <p className="text-sm text-gray-500">{t('articles.subtitle', language)}</p>
        </div>
      </div>

      <div className="space-y-4">
        {displayedArticles.map((article) => {
          const isExpanded = expandedArticles.has(article.id);
          const previewLength = 200;
          const needsExpansion = article.content.length > previewLength;

          return (
            <div
              key={article.id}
              className="bg-white rounded-lg p-5 shadow-sm border border-amber-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {article.title}
                  </h3>
                  {article.scripture_reference && (
                    <p className="text-sm text-amber-600 font-medium mb-2">
                      {t('articles.from', language)}: {article.scripture_reference}
                    </p>
                  )}
                </div>
                {article.source === 'ai_generated' && (
                  <Badge className="bg-purple-100 text-purple-700 border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI
                  </Badge>
                )}
                {article.source === 'priest' && (
                  <Badge className="bg-orange-100 text-orange-700 border-0">
                    By {article.author_name}
                  </Badge>
                )}
              </div>

              {article.quote && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-3 mb-3 rounded">
                  <p className="text-sm italic text-gray-700">{article.quote}</p>
                </div>
              )}

              {article.images?.length > 0 && (
                <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(isExpanded ? article.images : article.images.slice(0, 2)).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${article.title} ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-lg border border-amber-200 cursor-pointer hover:opacity-90 transition"
                      onClick={() => window.open(img, '_blank')}
                    />
                  ))}
                </div>
              )}

              <div className="text-gray-600 leading-relaxed">
                {isExpanded || !needsExpansion ? (
                  <p>{article.content}</p>
                ) : (
                  <p>{article.content.substring(0, previewLength)}...</p>
                )}
              </div>

              {needsExpansion && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleArticle(article.id)}
                  className="mt-2 text-amber-600 hover:text-amber-700"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      {t('common.showLess', language)}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      {t('common.readMore', language)}
                    </>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {filteredArticles.length > maxArticles && (
        <Button
          variant="outline"
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          {showAll ? t('common.showLess', language) : t('articles.showAll', language, { count: filteredArticles.length })}
        </Button>
      )}
    </Card>
  );
}