import React, { useState, useMemo } from 'react';
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
import LiveQueueTracker from '../components/yatra/LiveQueueTracker';

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
  // Capture the ID once on initial mount to prevent it from being lost on re-renders
  const templeId = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }, []);
  const queryClient = useQueryClient();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
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
  const [viewingItinerary, setViewingItinerary] = useState(null);

  const { data: temple, isLoading } = useQuery({
    queryKey: ['temple', templeId],
    queryFn: async () => {
      const temples = await base44.entities.Temple.filter({ is_deleted: false, is_hidden: false });
      return temples.find(t => t.id === templeId) || null;
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
      const allBookings = await base44.entities.Booking.filter({ 
        user_id: user.id,
        temple_id: templeId,
        is_deleted: false 
      }, '-date');
      // Filter only upcoming bookings
      const now = new Date();
      return allBookings.filter(b => new Date(b.date) >= now).slice(0, 2);
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
      total_amount: 0,
      metadata: selectedEndDate ? {
        end_date: format(selectedEndDate, 'yyyy-MM-dd'),
        multi_day_visit: true
      } : undefined
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
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(mapsUrl, '_blank');
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-2xl font-serif text-gray-900 mb-2">Temple Not Found</h2>
          <p className="text-gray-600 mb-6">
            {!templeId 
              ? "No temple ID was provided. Please select a temple from the list."
              : "This temple may have been removed or the link is incorrect."
            }
          </p>
          <Link to={createPageUrl('Temples')}>
            <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Browse All Temples
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] pb-24 md:pb-8">
      {/* Hero - The Sanctum Sanctorum */}
      <div className="relative w-full h-[90vh] overflow-hidden">
        {/* Slow Zoom Background */}
        <img
          src={images[0]}
          alt={temple.name}
          className="absolute inset-0 w-full h-full object-cover animate-[zoomSlow_20s_ease-in-out_infinite]"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Sticky Action Bar Overlay */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 shadow-xl"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 shadow-xl"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavoriteMutation.mutate()}
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 shadow-xl"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Play Video Button (if live darshan available) */}
        {temple.live_darshan_url && (
          <button
            onClick={() => window.open(temple.live_darshan_url, '_blank')}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-red-500/20 backdrop-blur-md border-2 border-red-500 flex items-center justify-center text-white hover:scale-110 transition-all animate-ping shadow-2xl z-10"
          >
            <Video className="w-10 h-10 ml-1" />
          </button>
        )}

        {/* Title at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-12 z-10">
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-white mb-4 tracking-tight leading-none drop-shadow-2xl">
            {temple.name}
          </h1>
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-sm text-white/90 tracking-wider">{temple.city}, {temple.state}</span>
            <span className="text-white/40">•</span>
            <span className="font-mono text-sm text-amber-400 tracking-wider uppercase">{temple.primary_deity}</span>
          </div>
        </div>
      </div>

      {/* Floating Ritual Dock */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl">
        <Button
          onClick={async () => {
            const isAuth = await base44.auth.isAuthenticated();
            if (!isAuth) {
              base44.auth.redirectToLogin();
              return;
            }
            setShowBookingModal(true);
          }}
          disabled={!temple.visit_booking_enabled}
          className="rounded-full bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 h-12"
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          Book Darshan
        </Button>
        <Button
          variant="ghost"
          onClick={async () => {
            const isAuth = await base44.auth.isAuthenticated();
            if (!isAuth) {
              base44.auth.redirectToLogin();
              return;
            }
            setShowDonationTypeModal(true);
          }}
          className="rounded-full text-white border border-white/20 hover:bg-white/10 px-6 h-12"
        >
          <Heart className="w-4 h-4 mr-2" />
          Donate
        </Button>
        <Button
          variant="ghost"
          onClick={async () => {
            const isAuth = await base44.auth.isAuthenticated();
            if (!isAuth) {
              base44.auth.redirectToLogin();
              return;
            }
            setShowItineraryModal(true);
          }}
          className="rounded-full text-white hover:text-amber-400 hover:bg-white/5 px-4 h-12"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Plan Trip
        </Button>
        <div className="h-8 w-[1px] bg-white/20 mx-1" />
        <Button
          variant="ghost"
          onClick={async () => {
            const isAuth = await base44.auth.isAuthenticated();
            if (!isAuth) {
              base44.auth.redirectToLogin();
              return;
            }
            if (prasadItems?.length > 0) {
              setSelectedPrasadItems(prasadItems);
              setShowPrasadOrderModal(true);
            } else {
              toast.error('No prasad items available at this temple');
            }
          }}
          size="icon"
          className="rounded-full text-white hover:bg-white/10 h-12 w-12"
          title="Order Prasad"
        >
          <Package className="w-5 h-5" />
        </Button>
      </div>

      {/* Light Mode Body Content */}
      <div className="bg-[#FAFAF9] py-16">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Narrative (2/3) */}
            <div className="lg:col-span-2 space-y-12">

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

              {/* About Section */}
              <Card className="p-10 bg-white shadow-sm border-gray-100">
                <h2 className="text-3xl font-serif text-amber-600 mb-6">About This Temple</h2>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => {
                        const text = String(children);
                        const firstLetter = text.charAt(0);
                        const rest = text.slice(1);
                        return (
                          <p className="mb-6 leading-relaxed">
                            <span className="float-left text-6xl font-serif text-amber-600 leading-none mr-3 mt-1">
                              {firstLetter}
                            </span>
                            {rest}
                          </p>
                        );
                      },
                      strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    }}
                  >
                    {temple.description || 'A sacred place of worship and spiritual significance.'}
                  </ReactMarkdown>
                </div>

                {temple.significance && (
                  <div className="mt-10 pt-8 border-t border-gray-200">
                    <h3 className="text-2xl font-serif text-amber-600 mb-4">Significance</h3>
                    <div className="prose max-w-none text-gray-700 leading-relaxed">
                      <ReactMarkdown>
                        {temple.significance}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {temple.history && (
                  <div className="mt-10 pt-8 border-t border-gray-200">
                    <h3 className="text-2xl font-serif text-amber-600 mb-4">History</h3>
                    <div className="prose max-w-none text-gray-700 leading-relaxed">
                      <ReactMarkdown>
                        {temple.history}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </Card>

              {/* Upcoming Festivals - Timeline */}
              <Card className="p-10 bg-white shadow-sm border-gray-100">
                <h2 className="text-3xl font-serif text-amber-600 mb-8">Upcoming Festivals</h2>
                {loadingFestivals ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                  </div>
                ) : upcomingFestivals?.length > 0 ? (
                  <div className="relative pl-8">
                    {/* Vertical Line */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-gray-300/0 via-gray-300 to-gray-300/0" />
                    
                    <div className="space-y-8">
                      {upcomingFestivals.map((festival, idx) => (
                        <div key={idx} className="relative group">
                          {/* Timeline Dot */}
                          <div className="absolute -left-8 top-2 w-4 h-4 bg-amber-500 rounded-full shadow-md group-hover:scale-125 transition-all" />
                          
                          {/* Festival Card */}
                          <div className="group-hover:bg-amber-50/50 p-5 rounded-lg transition-all">
                            <h3 className="text-xl font-serif text-gray-900 mb-2">{festival.name}</h3>
                            <p className="font-mono text-xs tracking-widest uppercase text-amber-600 mb-3">{festival.date}</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{festival.description}</p>
                            {festival.significance && (
                              <p className="text-xs text-gray-500 mt-2 italic">
                                {festival.significance}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">Loading festival information...</p>
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

            {/* Right Column - Sticky Sidebar (1/3) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Live Queue Tracker */}
              <LiveQueueTracker templeName={temple.name} />

              {/* Quick Info Card - Sticky */}
              <Card className="p-8 bg-white shadow-xl border-gray-100">
                <h3 className="text-xl font-serif text-amber-600 mb-6">Temple Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Opening Hours</p>
                      <p className="text-sm text-gray-600">{temple.opening_hours || '5:00 AM - 9:00 PM'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Location</p>
                      <p className="text-sm text-gray-600">{temple.location || `${temple.city}, ${temple.state}`}</p>
                    </div>
                  </div>
                  {temple.dress_code && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Dress Code</p>
                        <p className="text-sm text-gray-600">{temple.dress_code}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleGetDirections}
                  className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white h-12 rounded-lg"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </Card>

              {/* Saved Itineraries */}
              {savedItineraries?.length > 0 && (
                <Card className="p-6 bg-white shadow-xl border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Planned Trips</h3>
                <div className="space-y-3">
                  {savedItineraries.map((itinerary) => (
                    <button
                      key={itinerary.id}
                      onClick={() => setViewingItinerary(itinerary)}
                      className="w-full p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">
                          {format(new Date(itinerary.start_date), 'MMM d')} - {format(new Date(itinerary.end_date), 'MMM d, yyyy')}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {itinerary.itinerary_data?.days?.length || 0} days
                        </Badge>
                      </div>
                      {itinerary.preferences?.vibe && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {itinerary.preferences.vibe}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </Card>
            )}

              {/* Upcoming Bookings */}
              {templeBookings?.length > 0 && (
                <Card className="p-6 bg-white shadow-xl border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Upcoming Visits</h3>
                <div className="space-y-3">
                  {templeBookings.map((booking) => (
                    <Link key={booking.id} to={createPageUrl('MyBookings')}>
                      <div className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
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
                        {booking.provider_id && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Priest assigned
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

              {/* Prasad Preview */}
              {prasadItems?.length > 0 && (
                <Card className="p-6 bg-white shadow-xl border-gray-100">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">Start Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    if (selectedEndDate && date && date > selectedEndDate) {
                      setSelectedEndDate(null);
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  className="rounded-lg border w-full"
                />
              </div>
              
              <div>
                <Label className="mb-2 block text-sm font-medium">End Date (Optional)</Label>
                <Calendar
                  mode="single"
                  selected={selectedEndDate}
                  onSelect={setSelectedEndDate}
                  disabled={(date) => date < new Date() || (selectedDate && date < selectedDate)}
                  className="rounded-lg border w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Select for multi-day visits
                </p>
              </div>
            </div>
            
            {selectedDate && selectedEndDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Visit Duration:</strong> {Math.ceil((selectedEndDate - selectedDate) / (1000 * 60 * 60 * 24)) + 1} day(s)
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {format(selectedDate, 'MMM d')} - {format(selectedEndDate, 'MMM d, yyyy')}
                </p>
              </div>
            )}

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

            {selectedDate && selectedTimeSlot && (
              <div className={`border rounded-lg p-4 ${availablePriests.length > 0 ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                <Label className="mb-2 block text-sm font-medium">Priest Assignment</Label>
                {availablePriests.length > 0 ? (
                  <>
                    <Select value={selectedPriest} onValueChange={setSelectedPriest}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a priest (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-assign available priest</SelectItem>
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
                      ✓ {availablePriests.length} priest{availablePriests.length > 1 ? 's' : ''} available for this time slot
                    </p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-blue-900 bg-blue-100 rounded-md p-3">
                      <Users className="w-4 h-4" />
                      <span>No priests currently available for this slot</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      Don't worry! We'll connect you with an available priest after booking confirmation.
                    </p>
                  </div>
                )}
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

      {/* Donation Modal - The Karmic Card */}
      <Dialog open={showDonationModal} onOpenChange={setShowDonationModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Make an Offering
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Your offering supports {temple?.name}'s sacred activities
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
              {/* Gold Coin Amounts */}
              <div className="grid grid-cols-4 gap-3">
                {[100, 500, 1000, 5000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDonationAmount(String(amount))}
                    className={`relative h-20 rounded-full border-2 transition-all ${
                      donationAmount === String(amount)
                        ? 'bg-amber-500 border-amber-400 scale-110 shadow-[0_0_30px_rgba(217,119,6,0.5)]'
                        : 'bg-white/5 border-white/10 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={`text-2xl font-bold ${
                        donationAmount === String(amount) ? 'text-black' : 'text-white'
                      }`}>
                        ₹{amount}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <Label className="mb-2 block text-white/70">Custom Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              {/* Dynamic Impact Text */}
              {donationAmount && Number(donationAmount) > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-amber-400">
                    Your ₹{donationAmount} offering will support {temple?.name}'s sacred rituals and community service
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-white/20 bg-white/5"
                />
                <Label htmlFor="anonymous" className="cursor-pointer text-white/70">Make this offering anonymous</Label>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDonationModal(false)} 
                  className="flex-1 border-white/20 text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDonate}
                  disabled={donationMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  {donationMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Heart className="w-4 h-4 mr-2" />
                  )}
                  <span className="relative">Offer Now</span>
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

      {/* View Saved Itinerary Modal */}
      <Dialog open={!!viewingItinerary} onOpenChange={() => setViewingItinerary(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Your Trip Itinerary</DialogTitle>
            <DialogDescription>
              {viewingItinerary && (
                <>
                  {format(new Date(viewingItinerary.start_date), 'MMM d')} - {format(new Date(viewingItinerary.end_date), 'MMM d, yyyy')}
                  {viewingItinerary.preferences?.vibe && (
                    <span className="ml-2 capitalize">• {viewingItinerary.preferences.vibe}</span>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {viewingItinerary?.itinerary_data?.days?.map((day, dayIdx) => (
              <div key={dayIdx} className="space-y-4">
                <div className="sticky top-0 bg-primary/10 backdrop-blur-sm px-4 py-3 -mx-4 z-10">
                  <h3 className="font-normal text-lg tracking-wide">
                    {day.title}
                  </h3>
                </div>
                <div className="space-y-3 relative pl-8 border-l-2 border-border ml-2">
                  {day.activities?.map((activity, actIdx) => (
                    <div key={actIdx} className="relative">
                      <div className="absolute -left-[2.3rem] top-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Clock className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <Card className="p-4 hover:border-primary/50 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-light mb-1">
                              {activity.time}
                            </p>
                            <h4 className="font-normal text-base">{activity.name}</h4>
                          </div>
                          {activity.category && (
                            <Badge variant="secondary" className="text-xs font-light">
                              {activity.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-light leading-relaxed">
                          {activity.description}
                        </p>
                        {activity.location && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {activity.location}
                          </div>
                        )}
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setViewingItinerary(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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