import React, { useState, useMemo, useRef } from 'react';
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
  Check,
  Loader2,
  Star,
  BookOpen,
  Building2,
  Globe,
  FileText,
  ExternalLink,
  Hotel,
  Wifi,
  Car,
  Utensils,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import PriestArticleForm from '../components/temple/PriestArticleForm';
import PrasadOrderModal from '../components/prasad/PrasadOrderModal';
import FAQSection from '../components/faq/FAQSection';
import DonationTypeModal from '../components/temple/DonationTypeModal';
import ItineraryPlannerModal from '../components/temple/ItineraryPlannerModal';
import TempleSchemaMarkup from '../components/temple/TempleSchemaMarkup';
import TempleHistorySection from '../components/temple/TempleHistorySection';
import TempleDeitiesSection from '../components/temple/TempleDeitiesSection';
import TempleRitualsSection from '../components/temple/TempleRitualsSection';
import TempleVisitorInfoSection from '../components/temple/TempleVisitorInfoSection';

// New Storyboard Components
import TempleHeroRedesign from '../components/temple/TempleHeroRedesign';
import TempleQuickActions from '../components/temple/TempleQuickActions';
import TempleStorySection from '../components/temple/TempleStorySection';
import TempleDivineExperienceCTA from '../components/temple/TempleDivineExperienceCTA';
import TempleGallerySection from '../components/temple/TempleGallerySection';

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
  const contentRef = useRef(null);

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
  const [selectedPriest, setSelectedPriest] = useState(null);
  const [availablePriests, setAvailablePriests] = useState([]);
  const [wantHotel, setWantHotel] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);

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

  const { data: reviews } = useQuery({
    queryKey: ['temple-reviews', templeId],
    queryFn: () => base44.entities.Review.filter({ temple_id: templeId }, '-created_date'),
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

  const { data: nearbyHotels, isLoading: hotelsLoading } = useQuery({
    queryKey: ['hotels-near-temple', temple?.city],
    queryFn: () => base44.entities.Hotel.filter({ is_deleted: false }, '-rating_average', 20),
    enabled: !!temple?.city && showBookingModal
  });

  const cityHotels = nearbyHotels?.filter(h => h.city === temple?.city) || [];
  const displayHotels = cityHotels.length > 0 ? cityHotels : nearbyHotels?.slice(0, 6) || [];

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
      }
    } catch (error) {
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
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  const handleAuthAction = async (action) => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin();
      return;
    }
    action();
  };

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const defaultImage = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200";
  const images = temple?.images?.length > 0 ? temple.images : [defaultImage];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
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
      
      {/* SECTION 1: Immersive Hero */}
      <TempleHeroRedesign
        temple={temple}
        images={images}
        isFavorite={isFavorite}
        onBack={() => window.history.back()}
        onShare={handleShare}
        onToggleFavorite={() => toggleFavoriteMutation.mutate()}
        onScrollDown={scrollToContent}
      />

      {/* SECTION 2: Quick Actions Bar */}
      <div ref={contentRef}>
        <TempleQuickActions
          temple={temple}
          onBookDarshan={() => handleAuthAction(() => setShowBookingModal(true))}
          onDonate={() => handleAuthAction(() => setShowDonationTypeModal(true))}
          onPlanTrip={() => handleAuthAction(() => setShowItineraryModal(true))}
          onOrderPrasad={() => handleAuthAction(() => {
            if (prasadItems?.length > 0) {
              setSelectedPrasadItems(prasadItems);
              setShowPrasadOrderModal(true);
            } else {
              toast.error('No prasad items available');
            }
          })}
          onGetDirections={handleGetDirections}
          hasPrasad={prasadItems?.length > 0}
        />
      </div>

      {/* SECTION 3: The Sacred Story (About Temple) */}
      <TempleStorySection temple={temple} />

      {/* SECTION 4: Divine Experience CTA */}
      <TempleDivineExperienceCTA
        temple={temple}
        onBookDarshan={() => handleAuthAction(() => setShowBookingModal(true))}
        onPlanTrip={() => handleAuthAction(() => setShowItineraryModal(true))}
        onDonate={() => handleAuthAction(() => setShowDonationTypeModal(true))}
      />

      {/* SECTION 5: Gallery */}
      {images.length > 1 && (
        <TempleGallerySection images={images} templeName={temple.name} />
      )}

      {/* SECTION 6: Deep Dive Content */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
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
                        <p className="text-sm text-gray-600">Share divine knowledge</p>
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

              {/* History & Legend */}
              <TempleHistorySection temple={temple} />

              {/* Deities */}
              <TempleDeitiesSection temple={temple} />

              {/* Rituals & Festivals */}
              <TempleRitualsSection 
                temple={temple} 
                upcomingFestivals={upcomingFestivals} 
                loadingFestivals={loadingFestivals} 
              />

              {/* FAQs */}
              <FAQSection entityType="temple" entityId={templeId} entityData={temple} />

              {/* Reviews */}
              <Card className="p-8 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-serif text-gray-900">Devotee Reviews</h2>
                  <Button onClick={() => setShowReviewModal(true)} variant="outline" size="sm">
                    Write Review
                  </Button>
                </div>
                
                {reviews?.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="pb-6 border-b last:border-b-0">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <span className="text-amber-700 font-medium">
                              {(review.created_by || 'A')[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{review.created_by || 'Anonymous'}</p>
                            <div className="flex items-center gap-2 mt-1 mb-2">
                              <div className="flex">
                                {Array(5).fill(0).map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {format(new Date(review.created_date), 'MMM d, yyyy')}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-gray-600 text-sm">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No reviews yet. Be the first!</p>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <TempleVisitorInfoSection temple={temple} />
              
              {/* Prasad Preview */}
              {prasadItems?.length > 0 && (
                <Card className="p-6 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Prasad Available</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-orange-600"
                      onClick={() => handleAuthAction(() => {
                        setSelectedPrasadItems(prasadItems);
                        setShowPrasadOrderModal(true);
                      })}
                    >
                      Order
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

      {/* Final CTA */}
      <TempleDivineExperienceCTA
        temple={temple}
        onBookDarshan={() => handleAuthAction(() => setShowBookingModal(true))}
        onPlanTrip={() => handleAuthAction(() => setShowItineraryModal(true))}
        onDonate={() => handleAuthAction(() => setShowDonationTypeModal(true))}
      />

      {/* ========== MODALS ========== */}
      
      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Book Your Darshan</DialogTitle>
            <DialogDescription>Schedule your visit to {temple?.name}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div>
              <Label className="mb-2 block">Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
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
                  if (!e.target.checked) setSelectedEndDate(null);
                }}
                className="rounded"
              />
              <Label htmlFor="multiDay" className="cursor-pointer text-sm">Multi-day visit</Label>
            </div>
            
            {showMultiDay && (
              <div>
                <Label className="mb-2 block">End Date</Label>
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
              <Label className="mb-2 block">Time Slot</Label>
              <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                <SelectTrigger><SelectValue placeholder="Choose time" /></SelectTrigger>
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
              <Label className="mb-2 block">Special Requirements</Label>
              <Textarea
                placeholder="Wheelchair access, elderly assistance..."
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                rows={2}
              />
            </div>

            {/* Hotel Option */}
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                wantHotel ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
              }`}
              onClick={() => {
                setWantHotel(!wantHotel);
                if (wantHotel) setSelectedHotel(null);
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  wantHotel ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                }`}>
                  {wantHotel && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Hotel className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold">Add Hotel Stay</span>
                  </div>
                  <p className="text-sm text-gray-500">Hotels near {temple?.city}</p>
                </div>
              </div>
            </div>

            {wantHotel && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {hotelsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500 mx-auto" />
                ) : displayHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    onClick={() => setSelectedHotel(hotel)}
                    className={`p-3 rounded-lg border cursor-pointer ${
                      selectedHotel?.id === hotel.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={hotel.thumbnail_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
                        alt={hotel.name}
                        className="w-14 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{hotel.name}</h4>
                        <p className="text-xs text-gray-500">{hotel.city}</p>
                        <p className="text-orange-600 text-sm font-semibold">
                          ₹{hotel.room_inventory?.[0]?.price_per_night || 1500}/night
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-shrink-0 pt-4 border-t flex gap-3">
            <Button variant="outline" onClick={() => setShowBookingModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleBookVisit} 
              disabled={bookingMutation.isPending || (wantHotel && !selectedHotel)}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {bookingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">Your Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)}>
                    <Star className={`w-8 h-8 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Your Review</Label>
              <Textarea
                placeholder="Share your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowReviewModal(false)} className="flex-1">Cancel</Button>
            <Button 
              onClick={() => {
                if (rating === 0) { toast.error('Please select a rating'); return; }
                reviewMutation.mutate({ rating, comment: reviewComment });
              }}
              disabled={reviewMutation.isPending}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Success */}
      <Dialog open={showBookingSuccess} onOpenChange={setShowBookingSuccess}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className="text-white/80">Your darshan has been booked</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Temple</span>
                <span className="font-semibold">{temple?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold">{selectedDate && format(selectedDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-semibold">{selectedTimeSlot}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl('MyBookings')} className="flex-1">
                <Button variant="outline" className="w-full">View Bookings</Button>
              </Link>
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                onClick={() => {
                  setShowBookingSuccess(false);
                  setSelectedDate(null);
                  setSelectedTimeSlot('');
                  setWantHotel(false);
                  setSelectedHotel(null);
                }}
              >
                Done
              </Button>
            </div>
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
    </div>
  );
}