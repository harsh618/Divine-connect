import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Star, ThumbsUp, MessageSquare, Filter, ChevronDown,
  Quote, CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PriestReviewsSection({ provider }) {
  const [sortBy, setSortBy] = useState('recent');
  const [filterRating, setFilterRating] = useState('all');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['provider-reviews', provider.id],
    queryFn: async () => {
      const allReviews = await base44.entities.Review.filter({
        provider_id: provider.id
      }, '-created_date');
      return allReviews;
    }
  });

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => Math.round(r.rating) === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => Math.round(r.rating) === rating).length / reviews.length) * 100 
      : 0
  }));

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(r => filterRating === 'all' || Math.round(r.rating) === parseInt(filterRating))
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return 0;
    });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Reviews & Ratings</h2>
        </div>

        {/* Rating Overview */}
        <div className="flex flex-col md:flex-row gap-8 mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl">
          {/* Overall Score */}
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-gray-900 mb-1">
              {provider.rating_average?.toFixed(1) || '0.0'}
            </div>
            <div className="flex justify-center md:justify-start mb-1">
              {renderStars(Math.round(provider.rating_average || 0))}
            </div>
            <p className="text-sm text-gray-500">
              Based on {reviews.length} reviews
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="w-3 text-sm font-medium text-gray-600">{rating}</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Progress value={percentage} className="flex-1 h-2" />
                <span className="w-8 text-sm text-gray-500">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review, idx) => (
              <div 
                key={review.id || idx} 
                className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white">
                      U
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-gray-900">Devotee</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-500">
                            {review.created_date && format(new Date(review.created_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" title="Verified Booking" />
                    </div>
                    
                    {review.comment && (
                      <p className="text-gray-600 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Quote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">No Reviews Yet</h3>
              <p className="text-gray-500 text-sm">Be the first to share your experience!</p>
            </div>
          )}
        </div>

        {/* Load More */}
        {filteredReviews.length > 5 && (
          <div className="text-center mt-6">
            <Button variant="outline">
              Load More Reviews
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}