import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, BookOpen } from 'lucide-react';
import moment from 'moment';

export default function ArticleCard({ article }) {
  const defaultImage = article.images?.[0] || "https://images.unsplash.com/photo-1518655189052-ba153835e009?w=800";
  
  return (
    <Link to={createPageUrl(`ArticleDetail?id=${article.id}`)}>
      <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 rounded-lg">
        <img src={defaultImage} alt={article.title} className="w-full h-48 object-cover" />
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              <BookOpen className="w-3 h-3 mr-1" />
              Article
            </Badge>
            {article.temple_id && (
              <Badge variant="outline" className="text-sm">
                Temple Specific
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3">
            {article.content}
          </p>
          <div className="flex items-center text-xs text-gray-500 mt-3">
            <CalendarDays className="w-3 h-3 mr-1" />
            <span>{moment(article.created_date).format('MMM DD, YYYY')}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}