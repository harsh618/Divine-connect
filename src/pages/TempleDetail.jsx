import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  Video, 
  Heart, 
  Package,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Star,
  BookOpen,
  Share2,
  Navigation,
  CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import ArticlesList from '../components/temple/ArticlesList';
import PriestArticleForm from '../components/temple/PriestArticleForm';
import BackButton from '../components/ui/BackButton';
import PrasadOrderModal from '../components/prasad/PrasadOrderModal';
import FAQSection from '../components/faq/FAQSection';

const timeSlots = [
  '6:00 AM - 8:00 AM',
  '8:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
  '6:00 PM - 8:00 PM'
];

export default function TempleDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const templeId = urlParams.get('id');
  const queryClient = useQueryClient();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [numDevotees, setNumDevotees] = useState(1);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showPriestArticleForm, setShowPriestArticleForm] = useState(false);
  const [isPriest, setIsPriest] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [showPrasadOrderModal, setShowPrasadOrderModal] = useState(false);
  const [selectedPrasadItems, setSelectedPrasadItems] = useState([]);

  const { data: temple, isLoading } = useQuery({
    queryKey: ['temple', templeId],
    queryFn: async () => {
      const temples = await base44.entities.Temple.filter({ id: templeId });
      return temples[0];
    },
    enabled: !!templeId
  });

  const { data: prasadItems } = useQuery({
    queryKey: ['prasad', templeId],
    queryFn: () => base44.entities.PrasadItem.filter({ temple_id: templeId, is_deleted: false }),
    enabled: !!templeId
  });

  const { data: articles, isLoading: loadingArticles } = useQuery({
    queryKey: ['temple-articles', templeId],
    queryFn: () => base44.entities.Article.filter({ 
      temple_id: templeId, 
      is_published: true,
      is_deleted: false 
    }, '-created_date'),
    enabled: !!templeId
  });

  const { data: maxArticles } = useQuery({
    queryKey: ['temple-article-settings', templeId],
    queryFn: () => 5,
    enabled: !!templeId
  });

  const { data: events } = useQuery({
    queryKey: ['temple-events', templeId],
    queryFn: () => base44.entities.TempleEvent.filter({ 
      temple_id: templeId, 
      is_deleted: false 
    }, 'event_date'),
    enabled: !!templeId
  });

  const { data: reviews } = useQuery({
    queryKey: ['temple-reviews', templeId],
    queryFn: () => base44.entities.Review.filter({ 
      temple_id: templeId 
    }, '-created_date'),
    enabled: !!templeId
  });

  React.useEffect(() => {
    const checkPriestStatus = async () => {
      try {
        const user = await base44.auth.me();
        const provider = await base44.entities.ProviderProfile.filter({ 
          user_id: user.id, 
          provider_type: 'priest',
          is_deleted: false 
        });
        setIsPriest(provider.length > 0);
        
        // Check if temple is favorited
        const favorites = await base44.entities.FavoriteTemple.filter({
          user_id: user.id,
          temple_id: templeId
        });
        setIsFavorite(favorites.length > 0);
      } catch {
        setIsPriest(false);
        setIsFavorite(false);
      }
    };
    checkPriestStatus();
  }, [templeId]);

  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const user = await base44.auth.me();
      return base44.entities.Booking.create({
        ...bookingData,
        user_id: user.id,
        temple_id: templeId,
        booking_type: 'temple_visit',
        status: 'confirmed',
        payment_status: 'completed'
      });
    },
    onSuccess: () => {
      toast.success('Temple visit booked successfully!');
      setShowBookingModal(false);
      queryClient.invalidateQueries(['bookings']);
    }
  });

  const donationMutation = useMutation({
    mutationFn: async (donationData) => {
      const user = await base44.auth.me();
      return base44.entities.Donation.create({
        ...donationData,
        user_id: user.id,
        temple_id: templeId,
        donor_name: user.full_name,
        donor_email: user.email
      });
    },
    onSuccess: () => {
      toast.success('Thank you for your generous donation!');
      setShowDonationModal(false);
      setDonationAmount('');
    }
  });

  const handleBookVisit = () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast.error('Please select a date and time slot');
      return;
    }
    bookingMutation.mutate({
      date: format(selectedDate, 'yyyy-MM-dd'),
      time_slot: selectedTimeSlot,
      num_devotees: numDevotees,
      special_requirements: specialRequirements,
      total_amount: 0
    });
  };

  const handleDonate = () => {
    if (!donationAmount || Number(donationAmount) <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }
    donationMutation.mutate({
      amount: Number(donationAmount),
      is_anonymous: isAnonymous
    });
  };

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      if (isFavorite) {
        const favorites = await base44.entities.FavoriteTemple.filter({
          user_id: user.id,
          temple_id: templeId
        });
        if (favorites[0]) {
          await base44.entities.FavoriteTemple.delete(favorites[0].id);
        }
      } else {
        await base44.entities.FavoriteTemple.create({
          user_id: user.id,
          temple_id: templeId
        });
      }
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      const user = await base44.auth.me();
      return base44.entities.Review.create({
        ...reviewData,
        user_id: user.id,
        temple_id: templeId
      });
    },
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      setRating(0);
      setReviewComment('');
      queryClient.invalidateQueries(['temple-reviews', templeId]);
    }
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: temple.name,
        text: `Check out ${temple.name} on Divine`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleGetDirections = () => {
    const address = encodeURIComponent(`${temple.name}, ${temple.location || temple.city + ', ' + temple.state}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  const handleReviewSubmit = () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    reviewMutation.mutate({
      rating,
      comment: reviewComment
    });
  };



  const defaultImage = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200";
  const images = temple?.images?.length > 0 ? temple.images : [defaultImage];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!temple) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Temple not found</h2>
        <Link to={createPageUrl('Temples')}>
          <Button>Back to Temples</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Back Button - Fixed Top Left */}
      <div className="fixed top-20 left-4 z-50">
        <BackButton />
      </div>

      {/* Action Buttons - Fixed Top Right */}
      <div className="fixed top-20 right-4 z-50 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFavoriteMutation.mutate()}
          className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
        >
          <Share2 className="w-5 h-5 text-gray-700" />
        </Button>
      </div>

      {/* Hero Image Gallery */}
      <div className="relative h-[50vh] md:h-[60vh] bg-black">
        <img
          src={images[currentImageIndex]}
          alt={temple.name}
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {temple.is_featured && (
            <Badge className="bg-orange-500 text-white border-0">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
          {temple.live_darshan_url && (
            <Badge className="bg-red-500 text-white border-0 animate-pulse">
              <Video className="w-3 h-3 mr-1" />
              Live
            </Badge>
          )}
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">
              {temple.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {temple.city}, {temple.state}
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {temple.primary_deity}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Image Thumbnails Scroll */}
      {images.length > 1 && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition ${
                    idx === currentImageIndex ? 'border-orange-500' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt={`${temple.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 -mt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="p-6 grid grid-cols-3 gap-4">
              <Button
                onClick={() => setShowBookingModal(true)}
                className="flex-col h-auto py-4 bg-orange-500 hover:bg-orange-600"
                disabled={!temple.visit_booking_enabled}
              >
                <CalendarIcon className="w-6 h-6 mb-2" />
                <span className="text-sm">Book Visit</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-4"
                onClick={() => {
                  if (prasadItems?.length > 0) {
                    setSelectedPrasadItems(prasadItems);
                    setShowPrasadOrderModal(true);
                  } else {
                    toast.error('No prasad items available at this temple');
                  }
                }}
              >
                <Package className="w-6 h-6 mb-2" />
                <span className="text-sm">Order Prasad</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDonationModal(true)}
                className="flex-col h-auto py-4"
              >
                <Heart className="w-6 h-6 mb-2" />
                <span className="text-sm">Donate</span>
              </Button>
            </Card>

            {/* Priest Article Seva */}
            {isPriest && (
              <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Article Seva</h3>
                      <p className="text-sm text-gray-600">Share divine knowledge with devotees</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowPriestArticleForm(true)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Write Article
                  </Button>
                </div>
              </Card>
            )}

            {/* About */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">About This Temple</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {temple.description || 'A sacred place of worship and spiritual significance.'}
              </p>
              
              {temple.significance && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Significance</h3>
                  <p className="text-gray-600">{temple.significance}</p>
                </div>
              )}

              {temple.history && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">History</h3>
                  <p className="text-gray-600">{temple.history}</p>
                </div>
              )}
            </Card>

            {/* Sacred Articles from Scriptures */}
            <ArticlesList 
              articles={articles}
              loading={loadingArticles}
              maxArticles={maxArticles || 5}
            />

            {/* FAQs */}
            <FAQSection entityType="temple" entityId={templeId} entityData={temple} />

            {/* Events & Festivals */}
            {(events?.length > 0 || temple.festivals?.length > 0) && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CalendarDays className="w-5 h-5 mr-2 text-orange-500" />
                  Upcoming Events & Festivals
                </h2>
                <div className="space-y-4">
                  {events?.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                      <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xs text-orange-600 font-semibold">
                          {format(new Date(event.event_date), 'MMM')}
                        </span>
                        <span className="text-lg font-bold text-orange-700">
                          {format(new Date(event.event_date), 'd')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        {event.event_time && (
                          <p className="text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {event.event_time}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {temple.festivals?.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 mb-2">Other Festivals:</p>
                      <div className="flex flex-wrap gap-2">
                        {temple.festivals.map((festival, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-orange-50 text-orange-700">
                            {festival}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Reviews & Ratings */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Reviews & Ratings</h2>
                <Button onClick={() => setShowReviewModal(true)} className="bg-orange-500 hover:bg-orange-600">
                  Write Review
                </Button>
              </div>
              
              {reviews?.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array(5).fill(0).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(review.created_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
              )}
            </Card>

            {/* Live Darshan */}
            {temple.live_darshan_url && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Video className="w-5 h-5 mr-2 text-red-500" />
                  Live Darshan
                </h2>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={temple.live_darshan_url}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Temple Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Opening Hours</p>
                    <p className="text-sm text-gray-600">{temple.opening_hours || '5:00 AM - 9:00 PM'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{temple.location || `${temple.city}, ${temple.state}`}</p>
                  </div>
                </div>
                {temple.dress_code && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Dress Code</p>
                      <p className="text-sm text-gray-600">{temple.dress_code}</p>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleGetDirections}
                className="w-full mt-4 bg-orange-500 hover:bg-orange-600"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            </Card>

            {/* Prasad Preview */}
            {prasadItems?.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Prasad Available</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-orange-600"
                    onClick={() => {
                      setSelectedPrasadItems(prasadItems);
                      setShowPrasadOrderModal(true);
                    }}
                  >
                    Order Now
                  </Button>
                </div>
                <div className="space-y-3">
                  {prasadItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1606491956689-2ea866880049?w=200'}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-orange-600 text-sm">₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Your Visit</DialogTitle>
            <DialogDescription>
              Book your darshan at {temple?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div>
              <Label className="mb-2 block">Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-lg border"
              />
            </div>

            <div>
              <Label className="mb-2 block">Select Time Slot</Label>
              <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Number of Devotees</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={numDevotees}
                onChange={(e) => setNumDevotees(Number(e.target.value))}
              />
            </div>

            <div>
              <Label className="mb-2 block">Special Requirements (Optional)</Label>
              <Textarea
                placeholder="Wheelchair access, elderly assistance, etc."
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowBookingModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleBookVisit} 
              disabled={bookingMutation.isPending}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {bookingMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Donation Modal */}
      <Dialog open={showDonationModal} onOpenChange={setShowDonationModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Donate to {temple?.name}</DialogTitle>
            <DialogDescription>
              Support the temple through official donation channels
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Official Donation Details for Ram Janmbhoomi */}
            {temple.name === "Shri Ram Janmbhoomi" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-200">
                  <h3 className="text-xl font-bold text-orange-900 mb-4">Official Bank Details - Indian Citizens</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* SBI */}
                    <Card className="p-4">
                      <h4 className="font-bold text-gray-900 mb-3">State Bank of India</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">A/c Name:</span> Shri Ram Janmbhoomi Teerth Kshetra</div>
                        <div><span className="font-medium">A/C No:</span> 39161495808</div>
                        <div><span className="font-medium">IFSC Code:</span> SBIN0002510</div>
                        <div><span className="font-medium">Branch:</span> Naya Ghat, Ayodhya, UP</div>
                        <div className="pt-2"><span className="font-medium">UPI ID:</span> <code className="bg-gray-100 px-2 py-1 rounded">shriramjanmbhoomi@sbi</code></div>
                      </div>
                    </Card>

                    {/* Bank of Baroda */}
                    <Card className="p-4">
                      <h4 className="font-bold text-gray-900 mb-3">Bank of Baroda</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">A/c Name:</span> Shri Ram Janmbhoomi Teerth Kshetra</div>
                        <div><span className="font-medium">A/C No:</span> 05820100021211</div>
                        <div><span className="font-medium">IFSC Code:</span> BARB0AYODHY</div>
                        <div><span className="font-medium">Branch:</span> Naya Ghat, Ayodhya, UP</div>
                        <div className="pt-2"><span className="font-medium">UPI ID:</span> <code className="bg-gray-100 px-2 py-1 rounded">shriramjanmbhoomi@bob</code></div>
                      </div>
                    </Card>

                    {/* PNB */}
                    <Card className="p-4">
                      <h4 className="font-bold text-gray-900 mb-3">Punjab National Bank</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">A/c Name:</span> Shri Ram Janmbhoomi Teerth Kshetra</div>
                        <div><span className="font-medium">A/C No:</span> 3865-000-1001-39999</div>
                        <div><span className="font-medium">IFSC Code:</span> PUNB0386500</div>
                        <div><span className="font-medium">Branch:</span> Naya Ghat, Ayodhya U.P.</div>
                      </div>
                    </Card>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900"><strong>Trust PAN:</strong> AAZTS6197B</p>
                    <p className="text-sm text-blue-900 mt-2"><strong>Tax Benefit:</strong> 50% of donation eligible for deduction u/s 80G(2)(b)</p>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-bold text-green-900 mb-4">For Non-Indian Passport Holders (FCRA)</h3>
                  <Card className="p-4">
                    <h4 className="font-bold text-gray-900 mb-3">State Bank of India - FCRA Account</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">A/c Name:</span> Shri Ram Janmbhoomi Teerth Kshetra</div>
                      <div><span className="font-medium">A/C No:</span> 42162875158</div>
                      <div><span className="font-medium">IFSC Code:</span> SBIN0000691</div>
                      <div><span className="font-medium">SWIFT Code:</span> SBININBB104</div>
                      <div><span className="font-medium">Branch:</span> New Delhi Main Branch, FCRA Cell</div>
                      <div><span className="font-medium">FCRA Registration:</span> 231661997</div>
                    </div>
                  </Card>
                </div>

                <div className="text-center">
                  <a href="https://srjbtkshetra.org/donation-options/" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      Visit Official Donation Page
                    </Button>
                  </a>
                </div>
              </div>
            )}

            {/* Official Donation Details for Kashi Vishwanath */}
            {temple.name === "Shri Kashi Vishwanath Mandir" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-200">
                  <h3 className="text-xl font-bold text-orange-900 mb-4">Official Bank Details</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* HDFC Main Account */}
                    <Card className="p-4">
                      <h4 className="font-bold text-gray-900 mb-3">HDFC Bank - Main Account</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">A/c Name:</span> Shri Kashi Vishwanath Mandir Fund</div>
                        <div><span className="font-medium">A/C No:</span> 50100176347450</div>
                        <div><span className="font-medium">IFSC Code:</span> HDFC0000220</div>
                        <div><span className="font-medium">Branch Code:</span> 0220</div>
                        <div><span className="font-medium">Branch:</span> Rathayatra, Varanasi</div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-600">For RTGS/NEFT transfers</p>
                      </div>
                    </Card>

                    {/* HDFC Anna Kshetram */}
                    <Card className="p-4">
                      <h4 className="font-bold text-gray-900 mb-3">HDFC - Anna Kshetram Account</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">A/C No:</span> 50100079361871</div>
                        <div><span className="font-medium">IFSC Code:</span> HDFC0001465</div>
                        <div><span className="font-medium">Purpose:</span> Core Banking donations</div>
                      </div>
                    </Card>

                    {/* SBI */}
                    <Card className="p-4">
                      <h4 className="font-bold text-gray-900 mb-3">State Bank of India</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">A/c Name:</span> Shri Kashi Vishwanath Mandir Fund</div>
                        <div><span className="font-medium">A/C No:</span> 10389243027</div>
                        <div><span className="font-medium">IFSC Code:</span> SBIN0009017</div>
                        <div className="mt-2 text-xs text-gray-600">Donations via SBI ATM using "Trust Donation" option (Min ₹51)</div>
                      </div>
                    </Card>

                    {/* FCRA Account */}
                    <Card className="p-4 bg-green-50">
                      <h4 className="font-bold text-green-900 mb-3">FCRA Account (Foreign Currency)</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">A/C No:</span> 50100264738596</div>
                        <div><span className="font-medium">IFSC Code:</span> HDFC0000220</div>
                        <div><span className="font-medium">SWIFT Code:</span> HDFCINBB</div>
                        <div><span className="font-medium">Branch Code:</span> 0220</div>
                      </div>
                    </Card>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900"><strong>Tax Exemption:</strong> Donations exempted from tax u/s 80G</p>
                    <p className="text-sm text-blue-900 mt-2"><strong>Cheque/DD Payable to:</strong> "Shri Kashi Vishwanath Mandir Fund"</p>
                    <p className="text-xs text-gray-600 mt-2">Send to: Chief Executive Officer, Shri Kashi Vishwanath Temple Trust, Vishwanath Gali, Varanasi 221001</p>
                  </div>
                </div>

                <div className="text-center">
                  <a href="https://shrikashivishwanath.org/general/donate" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      Visit Official Donation Page
                    </Button>
                  </a>
                </div>
              </div>
            )}

            {/* Official Donation Details for Krishna Janmabhoomi */}
            {temple.name === "Shri Krishna Janmabhoomi" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-xl font-bold text-purple-900 mb-4">Official Bank Details - Indian Citizens Only</h3>
                  
                  <Card className="p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Axis Bank</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Account Name:</span>
                          <p className="text-gray-900">Shri Krishna Janmabhoomi Teerth Kshetra</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Account No:</span>
                          <p className="text-gray-900">922020055152357</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">IFSC Code:</span>
                          <p className="text-gray-900">UTIB0000053</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Bank Name:</span>
                          <p className="text-gray-900">Axis Bank</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="font-medium text-gray-600 mb-2">Donate via Mobile / UPI / PayTm</p>
                        <p className="text-sm text-gray-700">Scan the QR code available on the official website</p>
                      </div>
                    </div>
                  </Card>

                  <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-900 font-medium mb-2">Donation Options Available:</p>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Daily Annadaan (Food Donation)</li>
                      <li>• Gau Seva Daan (Cow Service)</li>
                      <li>• Sadhu Bhojan (Meals for Saints)</li>
                      <li>• Radha Rani Krishna Seva</li>
                      <li>• Vidya Daan (Education)</li>
                      <li>• Vriddha Asaram Daan (Old Age Home)</li>
                      <li>• Recurring Donations</li>
                    </ul>
                  </div>
                </div>

                <div className="text-center">
                  <a href="https://skjbtkshetra.org/welcome/all_donation" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-purple-500 hover:bg-purple-600">
                      Visit Official Donation Page & View QR Code
                    </Button>
                  </a>
                </div>
              </div>
            )}

            {/* Generic donation for other temples */}
            {temple.name !== "Shri Ram Janmbhoomi" && 
             temple.name !== "Shri Kashi Vishwanath Mandir" && 
             temple.name !== "Shri Krishna Janmabhoomi" && (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 500, 1000, 5000].map((amount) => (
                    <Button
                      key={amount}
                      variant={donationAmount === String(amount) ? "default" : "outline"}
                      onClick={() => setDonationAmount(String(amount))}
                      className={donationAmount === String(amount) ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </div>

                <div>
                  <Label className="mb-2 block">Custom Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="anonymous" className="cursor-pointer">Make this donation anonymous</Label>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowDonationModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleDonate}
                    disabled={donationMutation.isPending}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    {donationMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Heart className="w-4 h-4 mr-2" />
                    )}
                    Donate ₹{donationAmount || '0'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Priest Article Form */}
      {showPriestArticleForm && (
        <PriestArticleForm
          templeId={templeId}
          templeName={temple?.name}
          onClose={() => setShowPriestArticleForm(false)}
        />
      )}

      {/* Prasad Order Modal */}
      {showPrasadOrderModal && (
        <PrasadOrderModal
          isOpen={showPrasadOrderModal}
          onClose={() => setShowPrasadOrderModal(false)}
          templeId={templeId}
          templeName={temple?.name}
          initialItems={selectedPrasadItems}
        />
      )}

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div>
              <Label className="mb-2 block">Your Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-8 h-8 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Your Review (Optional)</Label>
              <Textarea
                placeholder="Share your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowReviewModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleReviewSubmit}
              disabled={reviewMutation.isPending}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {reviewMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}