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
  CalendarDays,
  Building2,
  Globe,
  FileText,
  ExternalLink
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
import DonationTypeModal from '../components/temple/DonationTypeModal';
import ItineraryPlannerModal from '../components/temple/ItineraryPlannerModal';
import JournalsSection from '../components/temple/JournalsSection';
import ReactMarkdown from 'react-markdown';

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
  const [showDonationTypeModal, setShowDonationTypeModal] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);
  const [selectedPriest, setSelectedPriest] = useState(null);
  const [availablePriests, setAvailablePriests] = useState([]);

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

  const { data: savedItineraries } = useQuery({
    queryKey: ['saved-itineraries', templeId],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.SavedItinerary.filter({ 
        user_id: user.id,
        temple_id: templeId,
        is_deleted: false 
      }, '-created_date');
    },
    enabled: !!templeId
  });

  const { data: templeBookings } = useQuery({
    queryKey: ['temple-bookings', templeId],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Booking.filter({ 
        user_id: user.id,
        temple_id: templeId,
        is_deleted: false 
      }, '-created_date');
    },
    enabled: !!templeId
  });

  const { data: upcomingFestivals, isLoading: loadingFestivals } = useQuery({
    queryKey: ['upcoming-festivals', templeId],
    queryFn: async () => {
      const response = await base44.functions.invoke('getUpcomingFestivals', {
        temple_name: temple.name,
        temple_location: `${temple.city}, ${temple.state}`,
        primary_deity: temple.primary_deity
      });
      return response.data.festivals || [];
    },
    enabled: !!temple
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

  const checkPriestAvailability = async (date, timeSlot) => {
    if (!date || !timeSlot) return;

    try {
      // Find priests associated with this temple
      const templePriests = await base44.entities.ProviderProfile.filter({
        provider_type: 'priest',
        is_deleted: false,
        is_verified: true,
        is_hidden: false
      });

      // Filter priests who serve this temple
      const eligiblePriests = templePriests.filter(priest => {
        const templeMatch = priest.associated_temples?.some(t => t.temple_id === templeId);
        const cityMatch = priest.city === temple.city;
        return templeMatch || cityMatch;
      });

      // Check their bookings for this date/time
      const dateStr = format(date, 'yyyy-MM-dd');
      const bookingsOnDate = await base44.entities.Booking.filter({
        date: dateStr,
        time_slot: timeSlot,
        status: ['confirmed', 'in_progress']
      });

      // Find available priests
      const bookedPriestIds = bookingsOnDate.map(b => b.provider_id);
      const available = eligiblePriests.filter(p => !bookedPriestIds.includes(p.id));

      setAvailablePriests(available);
      
      if (available.length > 0) {
        setSelectedPriest(available[0].id);
      } else {
        setSelectedPriest(null);
        toast.info('No priests available for this slot. We will assign one upon confirmation.');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailablePriests([]);
    }
  };

  React.useEffect(() => {
    if (selectedDate && selectedTimeSlot) {
      checkPriestAvailability(selectedDate, selectedTimeSlot);
    }
  }, [selectedDate, selectedTimeSlot]);

  const handleBookVisit = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast.error('Please select a date and time slot');
      return;
    }

    bookingMutation.mutate({
      date: format(selectedDate, 'yyyy-MM-dd'),
      time_slot: selectedTimeSlot,
      num_devotees: numDevotees,
      special_requirements: specialRequirements,
      provider_id: selectedPriest,
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
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Hero Image Grid - Camana Homes Style */}
      <div className="relative w-full bg-black">
        {/* Sticky Action Bar Overlay */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavoriteMutation.mutate()}
              className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Image Grid */}
        {images.length === 1 ? (
          <div className="relative aspect-[21/9] cursor-pointer" onClick={() => { setViewerImageIndex(0); setShowImageViewer(true); }}>
            <img
              src={images[0]}
              alt={temple.name}
              className="w-full h-full object-cover hover:brightness-95 transition-all"
            />
          </div>
        ) : images.length === 2 ? (
          <div className="grid grid-cols-2 gap-2 aspect-[21/9]">
            {images.slice(0, 2).map((img, idx) => (
              <div key={idx} className="relative overflow-hidden cursor-pointer" onClick={() => { setViewerImageIndex(idx); setShowImageViewer(true); }}>
                <img src={img} alt={`${temple.name} ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 aspect-[21/9]">
            <div className="col-span-2 row-span-2 relative overflow-hidden cursor-pointer" onClick={() => { setViewerImageIndex(0); setShowImageViewer(true); }}>
              <img src={images[0]} alt={temple.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            {images.slice(1, 5).map((img, idx) => (
              <div key={idx} className="relative overflow-hidden cursor-pointer" onClick={() => { setViewerImageIndex(idx + 1); setShowImageViewer(true); }}>
                <img src={img} alt={`${temple.name} ${idx + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                {idx === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold">
                    +{images.length - 5} more
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2">
          {temple.is_featured && (
            <Badge className="bg-primary text-primary-foreground border-0 shadow-lg">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
          {temple.live_darshan_url && (
            <Badge className="bg-red-500 text-white border-0 animate-pulse shadow-lg">
              <Video className="w-3 h-3 mr-1" />
              Live
            </Badge>
          )}
        </div>
      </div>

      {/* Title Section */}
      <div className="container mx-auto px-8 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light text-foreground mb-4 tracking-wide">
            {temple.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <div className="flex items-center text-sm font-light">
              <MapPin className="w-4 h-4 mr-1" />
              {temple.city}, {temple.state}
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs uppercase tracking-wider font-light">
              {temple.primary_deity}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card className="p-6 border-0 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={() => setShowBookingModal(true)}
                  className="flex-col h-auto py-6 bg-primary hover:bg-primary/90"
                  disabled={!temple.visit_booking_enabled}
                >
                  <CalendarIcon className="w-6 h-6 mb-2" />
                  <span className="text-sm uppercase tracking-wider">Book Visit</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto py-6 border-border"
                  onClick={() => setShowItineraryModal(true)}
                >
                  <MapPin className="w-6 h-6 mb-2" />
                  <span className="text-sm uppercase tracking-wider">Plan Trip</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto py-6 border-border"
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
                  <span className="text-sm uppercase tracking-wider">Order Prasad</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDonationTypeModal(true)}
                  className="flex-col h-auto py-6 border-border"
                >
                  <Heart className="w-6 h-6 mb-2" />
                  <span className="text-sm uppercase tracking-wider">Donate</span>
                </Button>
              </div>
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
            <Card className="p-8 border-0 shadow-sm">
              <h2 className="text-2xl font-normal mb-6 tracking-wide">About This Temple</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground font-light">
                <ReactMarkdown
                  components={{
                    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                    em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
                    h1: ({ children }) => <h1 className="text-3xl font-normal mt-8 mb-4 text-foreground">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-normal mt-6 mb-3 text-foreground">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-normal mt-4 mb-2 text-foreground">{children}</h3>,
                    p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                  }}
                >
                  {temple.description || 'A sacred place of worship and spiritual significance.'}
                </ReactMarkdown>
              </div>
              
              {temple.significance && (
                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="font-normal text-lg mb-3 tracking-wide">Significance</h3>
                  <div className="prose max-w-none text-muted-foreground font-light">
                    <ReactMarkdown
                      components={{
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
                        p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                      }}
                    >
                      {temple.significance}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {temple.history && (
                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="font-normal text-lg mb-3 tracking-wide">History</h3>
                  <div className="prose max-w-none text-muted-foreground font-light">
                    <ReactMarkdown
                      components={{
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
                        p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                      }}
                    >
                      {temple.history}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </Card>

            {/* Upcoming Festivals (AI Generated) */}
            <Card className="p-8 border-0 shadow-sm">
              <h2 className="text-2xl font-normal mb-6 tracking-wide flex items-center">
                <CalendarDays className="w-5 h-5 mr-3 text-primary" />
                Upcoming Festivals
              </h2>
              {loadingFestivals ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : upcomingFestivals?.length > 0 ? (
                <div className="space-y-4">
                  {upcomingFestivals.map((festival, idx) => (
                    <div key={idx} className="p-5 bg-muted/30 border border-border">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-primary/10 flex items-center justify-center text-2xl">
                          🪔
                        </div>
                        <div className="flex-1">
                          <h3 className="font-normal text-lg mb-1">{festival.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2 font-light">{festival.date}</p>
                          <p className="text-sm text-muted-foreground font-light">{festival.description}</p>
                          {festival.significance && (
                            <p className="text-xs text-muted-foreground mt-2 italic font-light">
                              {festival.significance}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8 font-light">Loading festival information...</p>
              )}

              {/* Static Festivals */}
              {temple.festivals?.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-3 uppercase tracking-wider font-light">Annual Festivals:</p>
                  <div className="flex flex-wrap gap-2">
                    {temple.festivals.map((festival, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary border-0 font-light">
                        {festival}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* FAQs */}
            <FAQSection entityType="temple" entityId={templeId} entityData={temple} />

            {/* Journals & Stories */}
            <JournalsSection 
              templeId={templeId} 
              templeName={temple.name}
              primaryDeity={temple.primary_deity}
            />

            {/* Reviews & Ratings */}
            <Card className="p-8 border-0 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-normal tracking-wide">Reviews & Ratings</h2>
                <Button onClick={() => setShowReviewModal(true)} className="bg-primary hover:bg-primary/90 text-xs uppercase tracking-wider">
                  Write Review
                </Button>
              </div>
              
              {reviews?.length > 0 ? (
                <div className="space-y-8">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="pb-8 border-b border-border last:border-b-0">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-normal text-primary">
                            {(review.created_by || 'A')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-normal text-base mb-2">{review.created_by || 'Anonymous'}</p>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex">
                              {Array(5).fill(0).map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground font-light">
                              {format(new Date(review.created_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-muted-foreground text-sm leading-relaxed font-light">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Star className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-light">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </Card>

            {/* Live Darshan */}
            {temple.live_darshan_url && (
              <Card className="p-6 border-0 shadow-sm">
                <h2 className="text-xl font-normal mb-4 flex items-center tracking-wide">
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
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Saved Itineraries */}
            {savedItineraries?.length > 0 && (
              <Card className="p-6 border-0 shadow-sm">
                <h3 className="font-normal text-lg text-foreground mb-4 tracking-wide">Your Planned Trips</h3>
                <div className="space-y-3">
                  {savedItineraries.map((itinerary) => (
                    <div key={itinerary.id} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">
                          {format(new Date(itinerary.start_date), 'MMM d')} - {format(new Date(itinerary.end_date), 'MMM d, yyyy')}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {itinerary.itinerary_data?.days?.length || 0} days
                        </Badge>
                      </div>
                      {itinerary.preferences?.vibe && (
                        <p className="text-xs text-muted-foreground">
                          {itinerary.preferences.vibe}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Temple Bookings */}
            {templeBookings?.length > 0 && (
              <Card className="p-6 border-0 shadow-sm">
                <h3 className="font-normal text-lg text-foreground mb-4 tracking-wide">Your Bookings</h3>
                <div className="space-y-3">
                  {templeBookings.map((booking) => (
                    <div key={booking.id} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">
                          {format(new Date(booking.date), 'MMM d, yyyy')}
                        </p>
                        <Badge 
                          variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{booking.time_slot}</p>
                      {booking.num_devotees > 1 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {booking.num_devotees} devotees
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Info Card */}
            <Card className="p-6 border-0 shadow-sm">
              <h3 className="font-normal text-lg text-foreground mb-6 tracking-wide">Temple Information</h3>
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
              <Card className="p-6 border-0 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-normal text-lg text-foreground tracking-wide">Prasad Available</h3>
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
        <DialogContent className="sm:max-w-lg max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Schedule Your Visit</DialogTitle>
            <DialogDescription>
              Book your darshan at {temple?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
            <div>
              <Label className="mb-2 block text-sm font-medium">Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-lg border w-full"
              />
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">Select Time Slot</Label>
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

            {availablePriests.length > 0 && selectedDate && selectedTimeSlot && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <Label className="mb-2 block text-sm font-medium">Available Priest</Label>
                <Select value={selectedPriest} onValueChange={setSelectedPriest}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a priest" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePriests.map((priest) => (
                      <SelectItem key={priest.id} value={priest.id}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{priest.display_name}</span>
                          {priest.years_of_experience && (
                            <span className="text-xs text-muted-foreground">
                              ({priest.years_of_experience} yrs exp)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-green-700 mt-2">
                  {availablePriests.length} priest{availablePriests.length > 1 ? 's' : ''} available for this slot
                </p>
              </div>
            )}

            <div>
              <Label className="mb-2 block text-sm font-medium">Number of Devotees</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={numDevotees}
                onChange={(e) => setNumDevotees(Number(e.target.value))}
              />
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">Special Requirements (Optional)</Label>
              <Textarea
                placeholder="Wheelchair access, elderly assistance, etc."
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Donate to {temple?.name}</DialogTitle>
            <DialogDescription>
              Your contribution helps maintain the temple and support religious activities.
            </DialogDescription>
          </DialogHeader>

          {temple?.donation_details ? (
            <div className="space-y-6 py-4">
              {/* UPI Details */}
              {temple.donation_details.upi_id && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-orange-600" />
                    Donate Using UPI
                  </h3>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">UPI ID</p>
                    <p className="font-mono text-lg font-semibold text-gray-900">
                      {temple.donation_details.upi_id}
                    </p>
                  </div>
                  {temple.donation_details.qr_code_url && (
                    <div className="mt-3 text-center">
                      <img 
                        src={temple.donation_details.qr_code_url} 
                        alt="UPI QR Code" 
                        className="w-48 h-48 mx-auto border-2 border-orange-200 rounded-lg"
                      />
                      <p className="text-xs text-gray-600 mt-2">Scan to pay</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bank Account Details */}
              {temple.donation_details.bank_accounts && temple.donation_details.bank_accounts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Bank Transfer (NEFT/RTGS/IMPS)
                  </h3>
                  {temple.donation_details.bank_accounts.map((account, idx) => (
                    <Card key={idx} className="p-4 bg-blue-50 border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3">{account.bank_name}</h4>
                      <div className="space-y-2 text-sm">
                        {account.account_name && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Account Name:</span>
                            <span className="font-semibold text-gray-900">{account.account_name}</span>
                          </div>
                        )}
                        {account.account_number && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Account Number:</span>
                            <span className="font-mono font-semibold text-gray-900">{account.account_number}</span>
                          </div>
                        )}
                        {account.ifsc_code && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">IFSC Code:</span>
                            <span className="font-mono font-semibold text-gray-900">{account.ifsc_code}</span>
                          </div>
                        )}
                        {account.swift_code && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">SWIFT Code:</span>
                            <span className="font-mono font-semibold text-gray-900">{account.swift_code}</span>
                          </div>
                        )}
                        {account.branch && (
                          <div>
                            <p className="text-gray-600 mb-1">Branch:</p>
                            <p className="font-medium text-gray-900">{account.branch}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* FCRA Account for Foreign Donations */}
              {temple.donation_details.fcra_account && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-green-900">
                    <Globe className="w-5 h-5 text-green-600" />
                    For Non-Indian Passport Holders (FCRA Account)
                  </h3>
                  <div className="space-y-2 text-sm">
                    {temple.donation_details.fcra_account.account_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Name:</span>
                        <span className="font-semibold text-gray-900">{temple.donation_details.fcra_account.account_name}</span>
                      </div>
                    )}
                    {temple.donation_details.fcra_account.account_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-mono font-semibold text-gray-900">{temple.donation_details.fcra_account.account_number}</span>
                      </div>
                    )}
                    {temple.donation_details.fcra_account.ifsc_code && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">IFSC Code:</span>
                        <span className="font-mono font-semibold text-gray-900">{temple.donation_details.fcra_account.ifsc_code}</span>
                      </div>
                    )}
                    {temple.donation_details.fcra_account.swift_code && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">SWIFT Code:</span>
                        <span className="font-mono font-semibold text-gray-900">{temple.donation_details.fcra_account.swift_code}</span>
                      </div>
                    )}
                    {temple.donation_details.fcra_account.branch && (
                      <div>
                        <p className="text-gray-600 mb-1">Branch:</p>
                        <p className="font-medium text-gray-900">{temple.donation_details.fcra_account.branch}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tax Exemption Details */}
              {temple.donation_details.tax_exemption_details && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Tax Benefits
                  </h4>
                  <p className="text-sm text-yellow-900 whitespace-pre-line">
                    {temple.donation_details.tax_exemption_details}
                  </p>
                </div>
              )}

              {/* Donation Note */}
              {temple.donation_details.donation_note && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900 whitespace-pre-line">
                    {temple.donation_details.donation_note}
                  </p>
                </div>
              )}

              {/* Official Donation Link */}
              {temple.donation_details.official_donation_url && (
                <div className="text-center pt-4 border-t">
                  <a
                    href={temple.donation_details.official_donation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Official Donation Page
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 py-4">
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
            </div>
          )}
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
              className="flex-1 bg-primary hover:bg-primary/90"
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

      {/* Donation Type Modal */}
      <DonationTypeModal
        isOpen={showDonationTypeModal}
        onClose={() => setShowDonationTypeModal(false)}
        templeId={templeId}
        templeName={temple?.name}
      />

      {/* Itinerary Planner Modal */}
      <ItineraryPlannerModal
        isOpen={showItineraryModal}
        onClose={() => setShowItineraryModal(false)}
        temple={temple}
        />

        {/* Image Viewer Modal */}
        <Dialog open={showImageViewer} onOpenChange={setShowImageViewer}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden">
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <button
              onClick={() => setViewerImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center text-white transition-all shadow-xl"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>

            <img
              src={images[viewerImageIndex]}
              alt={`${temple.name} ${viewerImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            <button
              onClick={() => setViewerImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center text-white transition-all shadow-xl"
            >
              <ChevronRight className="w-7 h-7" />
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full text-white text-sm font-light">
              {viewerImageIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
        </Dialog>
        </div>
        );
        }