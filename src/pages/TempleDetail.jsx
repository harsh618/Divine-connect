import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  ExternalLink,
  Hotel,
  Wifi,
  Car,
  Utensils,
  CheckCircle,
  ChevronDown,
  Sparkles,
  ImageIcon
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
import TempleSchemaMarkup from '../components/temple/TempleSchemaMarkup';
import TempleIntroSection from '../components/temple/TempleIntroSection';
import TempleHistorySection from '../components/temple/TempleHistorySection';
import TempleDeitiesSection from '../components/temple/TempleDeitiesSection';
import TempleRitualsSection from '../components/temple/TempleRitualsSection';
import TempleVisitorInfoSection from '../components/temple/TempleVisitorInfoSection';

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
  const [showMultiDay, setShowMultiDay] = useState(false);
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
  const [wantHotel, setWantHotel] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const heroRef = useRef(null);

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

  const { data: nearbyHotels, isLoading: hotelsLoading } = useQuery({
    queryKey: ['hotels-near-temple', temple?.city],
    queryFn: () => base44.entities.Hotel.filter({
      is_deleted: false
    }, '-rating_average', 20),
    enabled: !!temple?.city && showBookingModal
  });

  const cityHotels = nearbyHotels?.filter(h => h.city === temple?.city) || [];
  const displayHotels = cityHotels.length > 0 ? cityHotels : nearbyHotels?.slice(0, 6) || [];

  const { data: templeBookings } = useQuery({
    queryKey: ['temple-bookings', templeId],
    queryFn: async () => {
      const user = await base44.auth.me();
      const allBookings = await base44.entities.Booking.filter({ 
        user_id: user.id,
        temple_id: templeId,
        is_deleted: false 
      }, '-date');
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

  useEffect(() => {
    const checkPriestStatus = async () => {
      try {
        const user = await base44.auth.me();
        const provider = await base44.entities.ProviderProfile.filter({ 
          user_id: user.id, 
          provider_type: 'priest',
          is_deleted: false 
        });
        setIsPriest(provider.length > 0);
        
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

  // Scroll effect for hero
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      setShowBookingModal(false);
      setShowBookingSuccess(true);
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
      const templePriests = await base44.entities.ProviderProfile.filter({
        provider_type: 'priest',
        is_deleted: false,
        is_verified: true,
        is_hidden: false
      });

      const eligiblePriests = templePriests.filter(priest => {
        const templeMatch = priest.associated_temples?.some(t => t.temple_id === templeId);
        const cityMatch = priest.city === temple.city;
        return templeMatch || cityMatch;
      });

      const dateStr = format(date, 'yyyy-MM-dd');
      const bookingsOnDate = await base44.entities.Booking.filter({
        date: dateStr,
        time_slot: timeSlot,
        status: ['confirmed', 'in_progress']
      });

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

  useEffect(() => {
    if (selectedDate && selectedTimeSlot) {
      checkPriestAvailability(selectedDate, selectedTimeSlot);
    }
  }, [selectedDate, selectedTimeSlot]);

  const handleBookVisit = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast.error('Please select a date and time slot');
      return;
    }

    const bookingData = {
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
    };

    if (selectedHotel) {
      const roomPrice = selectedHotel.room_inventory?.[0]?.price_per_night || 1500;
      bookingData.special_requirements = `${specialRequirements ? specialRequirements + ' | ' : ''}Hotel: ${selectedHotel.name}`;
      bookingData.total_amount = roomPrice;
    }

    bookingMutation.mutate(bookingData);
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
        text: `Check out ${temple.name} on MandirSutra`,
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
    <div className="min-h-screen bg-white">
      {/* Schema.org JSON-LD Markup for SEO */}
      <TempleSchemaMarkup temple={temple} />
      
      {/* Immersive Hero - Full Screen Story */}
      <div ref={heroRef} className="relative w-full h-screen overflow-hidden">
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
          style={{
            backgroundImage: `url(${images[currentImageIndex]})`,
            transform: `scale(${1 + scrollProgress * 0.2})`
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

        {/* Floating Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavoriteMutation.mutate()}
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Central Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          <div 
            className="space-y-6 transition-all duration-700"
            style={{
              opacity: 1 - scrollProgress * 2,
              transform: `translateY(${scrollProgress * 50}px)`
            }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/90">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">Experience the Divine</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white tracking-tight leading-tight">
              {temple.name}
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light">
              {temple.tagline || `A sacred journey to ${temple.primary_deity} awaits`}
            </p>

            {/* Location Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="text-white/90 text-sm">{temple.city}, {temple.state}</span>
            </div>

            {/* Scroll Indicator */}
            <div className="mt-16 animate-bounce">
              <ChevronDown className="w-8 h-8 text-white/60 mx-auto" />
              <p className="text-white/60 text-sm mt-2">Scroll to begin your journey</p>
            </div>
          </div>
        </div>

        {/* Image Gallery Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentImageIndex 
                    ? 'bg-white w-8' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setViewerImageIndex(currentImageIndex);
                setShowImageViewer(true);
              }}
              className="ml-3 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 text-xs"
            >
              <ImageIcon className="w-3 h-3 mr-1" />
              View Gallery
            </Button>
          </div>
        )}
      </div>

      {/* Story Section 1: Introduction & CTA */}
      <div className="relative bg-gradient-to-br from-orange-50 via-white to-amber-50 py-24">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                Plan Your Divine Journey
              </div>
              <h2 className="text-4xl md:text-5xl font-serif text-gray-900 leading-tight">
                Want to experience spiritual bliss?
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Book your personalized divine experience with us. From darshan bookings to complete travel planning, we've crafted the perfect spiritual journey for you.
              </p>
              
              <div className="space-y-4">
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
                  className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white h-14 px-8 text-lg rounded-xl shadow-lg"
                >
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Book Your Darshan
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const isAuth = await base44.auth.isAuthenticated();
                    if (!isAuth) {
                      base44.auth.redirectToLogin();
                      return;
                    }
                    setShowItineraryModal(true);
                  }}
                  className="w-full md:w-auto h-14 px-8 text-lg rounded-xl border-2 border-orange-300 hover:bg-orange-50"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Plan Complete Trip
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{reviews?.length || 0}</div>
                  <div className="text-sm text-gray-500">Devotees</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-3xl font-bold text-orange-600">
                    <Star className="w-7 h-7 fill-orange-500 text-orange-500" />
                    4.8
                  </div>
                  <div className="text-sm text-gray-500">Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src={images[1] || images[0]}
                alt={temple.name}
                className="rounded-3xl shadow-2xl"
              />
              {temple.live_darshan_url && (
                <button
                  onClick={() => window.open(temple.live_darshan_url, '_blank')}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-red-500/90 backdrop-blur-md border-4 border-white flex items-center justify-center text-white hover:scale-110 transition-all shadow-2xl"
                >
                  <Video className="w-10 h-10 ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Story Section 2: About & History */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="max-w-4xl mx-auto">
            {/* About */}
            {temple.description && (
              <div className="mb-16">
                <h2 className="text-4xl font-serif text-amber-700 mb-8 text-center">The Sacred Story</h2>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => {
                        const text = String(children);
                        const firstLetter = text.charAt(0);
                        const rest = text.slice(1);
                        return (
                          <p className="mb-6 leading-relaxed text-lg">
                            <span className="float-left text-7xl font-serif text-amber-600 leading-none mr-4 mt-2">
                              {firstLetter}
                            </span>
                            {rest}
                          </p>
                        );
                      },
                    }}
                  >
                    {temple.description}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* History & Legend */}
            <TempleHistorySection temple={temple} />

            {/* Deities */}
            <TempleDeitiesSection temple={temple} />
          </div>
        </div>
      </div>

      {/* Rituals & Festivals Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 py-20">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <TempleRitualsSection 
            temple={temple} 
            upcomingFestivals={upcomingFestivals} 
            loadingFestivals={loadingFestivals} 
          />
        </div>
      </div>

      {/* Visitor Information */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-serif text-amber-700 mb-8">Plan Your Visit</h2>
              <TempleVisitorInfoSection temple={temple} />
              <Button 
                onClick={handleGetDirections}
                className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white h-12 rounded-lg"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            </div>

            <div className="space-y-6">
              {/* Upcoming Bookings */}
              {templeBookings?.length > 0 && (
                <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Your Upcoming Visits
                  </h3>
                  <div className="space-y-3">
                    {templeBookings.map((booking) => (
                      <Link key={booking.id} to={createPageUrl('MyBookings')}>
                        <div className="p-4 bg-white rounded-lg hover:shadow-md transition-all cursor-pointer border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900">
                              {format(new Date(booking.date), 'MMM d, yyyy')}
                            </p>
                            <Badge className="bg-green-100 text-green-700">
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{booking.time_slot}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Services</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const isAuth = await base44.auth.isAuthenticated();
                      if (!isAuth) {
                        base44.auth.redirectToLogin();
                        return;
                      }
                      setShowDonationTypeModal(true);
                    }}
                    className="h-20 flex-col gap-2"
                  >
                    <Heart className="w-6 h-6 text-red-500" />
                    <span className="text-sm">Donate</span>
                  </Button>
                  <Button
                    variant="outline"
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
                        toast.error('No prasad items available');
                      }
                    }}
                    className="h-20 flex-col gap-2"
                  >
                    <Package className="w-6 h-6 text-orange-500" />
                    <span className="text-sm">Prasad</span>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <FAQSection entityType="temple" entityId={templeId} entityData={temple} />
        </div>
      </div>

      {/* Journals & Stories */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <JournalsSection 
            templeId={templeId} 
            templeName={temple.name}
            primaryDeity={temple.primary_deity}
          />
        </div>
      </div>

      {/* Reviews & Ratings */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 py-20">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <Card className="p-8 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-serif text-amber-700">What Devotees Say</h2>
              <Button 
                onClick={() => setShowReviewModal(true)} 
                className="bg-orange-500 hover:bg-orange-600"
              >
                Write Review
              </Button>
            </div>
            
            {reviews?.length > 0 ? (
              <div className="space-y-6">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="pb-6 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                        {(review.created_by || 'A')[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">{review.created_by || 'Anonymous'}</p>
                          <span className="text-xs text-gray-500">
                            {format(new Date(review.created_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex mb-2">
                          {Array(5).fill(0).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modals remain the same... */}
      {/* I'll keep all the existing modal code from the original file */}
      
      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Schedule Your Visit</DialogTitle>
            <DialogDescription>
              Book your darshan at {temple?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 -mr-2">
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="multiDay"
                checked={showMultiDay}
                onChange={(e) => {
                  setShowMultiDay(e.target.checked);
                  if (!e.target.checked) {
                    setSelectedEndDate(null);
                  }
                }}
                className="rounded"
              />
              <Label htmlFor="multiDay" className="cursor-pointer text-sm font-normal">
                Multi-day visit
              </Label>
            </div>
            
            {showMultiDay && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <Label className="mb-2 block text-sm font-medium">End Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedEndDate}
                  onSelect={setSelectedEndDate}
                  disabled={(date) => date < new Date() || (selectedDate && date < selectedDate)}
                  className="rounded-lg border w-full"
                />
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

          <div className="flex-shrink-0 pt-4 border-t space-y-3">
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
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Other Modals */}
      {showPriestArticleForm && (
        <PriestArticleForm
          templeId={templeId}
          templeName={temple?.name}
          onClose={() => setShowPriestArticleForm(false)}
        />
      )}

      {showPrasadOrderModal && (
        <PrasadOrderModal
          isOpen={showPrasadOrderModal}
          onClose={() => setShowPrasadOrderModal(false)}
          templeId={templeId}
          templeName={temple?.name}
          initialItems={selectedPrasadItems}
        />
      )}

      <DonationTypeModal
        isOpen={showDonationTypeModal}
        onClose={() => setShowDonationTypeModal(false)}
        templeId={templeId}
        templeName={temple?.name}
      />

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
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center text-white transition-all"
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
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center text-white transition-all"
            >
              <ChevronRight className="w-7 h-7" />
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full text-white text-sm">
              {viewerImageIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}