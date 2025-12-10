import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown, ChevronUp, Sparkles, Languages } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/components/translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ArticlesList({ articles, loading, maxArticles = 3 }) {
  const { language } = useLanguage();
  const [expandedArticles, setExpandedArticles] = useState(new Set());
  const [showAll, setShowAll] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  // Filter articles based on selected language
  const filteredArticles = selectedLanguage === 'all' 
    ? (articles || [])
    : (articles?.filter(article => {
        // Normalize both values to lowercase for comparison
        const articleLang = article.language?.toLowerCase();
        const selectedLang = selectedLanguage.toLowerCase();
        
        // Check if article language matches
        return articleLang === selectedLang || 
               (selectedLang === 'english' && articleLang === 'en') ||
               (selectedLang === 'en' && articleLang === 'english');
      }) || []);

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('articles.title', language)}</h2>
            <p className="text-sm text-gray-500">{t('articles.subtitle', language)}</p>
          </div>
        </div>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-[180px]">
            <Languages className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="हिन्दी">हिन्दी</SelectItem>
            <SelectItem value="தமிழ்">தமிழ்</SelectItem>
            <SelectItem value="తెలుగు">తెలుగు</SelectItem>
            <SelectItem value="বাংলা">বাংলা</SelectItem>
            <SelectItem value="संस्कृत">संस्कृत</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {displayedArticles.map((article) => {
          const isExpanded = expandedArticles.has(article.id);
          const previewLength = 200;
          const needsExpansion = article.content.length > previewLength;

          return (
            <div
              key={article.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-amber-100 hover:shadow-lg transition-all duration-200"
            >
              {/* Header with badges */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                    {article.title}
                  </h3>
                  {article.scripture_reference && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-amber-700 font-semibold">
                        {t('articles.from', language)}:
                      </span>
                      <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                        {article.scripture_reference}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {article.source === 'ai_generated' && (
                    <Badge className="bg-purple-100 text-purple-700 border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI
                    </Badge>
                  )}
                  {article.source === 'priest' && (
                    <Badge className="bg-orange-100 text-orange-700 border-0">
                      <BookOpen className="w-3 h-3 mr-1" />
                      By {article.author_name}
                    </Badge>
                  )}
                </div>
              </div>

              {article.quote && (
                <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 mb-4 rounded-lg">
                  <div className="absolute top-2 left-2 text-amber-300 text-4xl leading-none">"</div>
                  <p className="text-sm italic text-gray-800 font-medium pl-6 pr-2">
                    {article.quote}
                  </p>
                  <div className="absolute bottom-2 right-2 text-amber-300 text-4xl leading-none">"</div>
                </div>
              )}

              <div className="text-gray-700 leading-relaxed text-justify">
                {isExpanded || !needsExpansion ? (
                  <p className="whitespace-pre-line">{article.content}</p>
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