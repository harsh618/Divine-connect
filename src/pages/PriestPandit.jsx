import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Star, 
  MessageCircle, 
  Languages,
  CheckCircle,
  Send,
  HelpCircle,
  Loader2,
  Sparkles,
  ArrowUpRight,
  Flame,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200";
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1920',
  'https://images.unsplash.com/photo-1604608672516-f1e3c1f9f6e6?w=1920',
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1920'
];

const SPECIALIZATIONS = [
  { value: 'all', label: 'All Priests' },
  { value: 'vedic', label: 'Vedic Rituals' },
  { value: 'havan', label: 'Havan' },
  { value: 'marriage', label: 'Marriage' },
  { value: 'griha', label: 'Griha Pravesh' },
];

function PriestCard({ provider }) {
  const [imgSrc, setImgSrc] = useState(provider.avatar_url || FALLBACK_AVATAR);

  return (
    <Link to={createPageUrl(`PriestProfile?id=${provider.id}`)} className="group block h-full">
      <div className="relative h-full bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
        
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img 
            src={imgSrc} 
            alt={provider.display_name}
            onError={() => setImgSrc(FALLBACK_AVATAR)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between">
            <div className="flex gap-1.5">
              {provider.is_verified && (
                <Badge className="bg-blue-500 text-white border-0 px-2.5 py-1 text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified
                </Badge>
              )}
              {provider.is_featured && (
                <Badge className="bg-amber-400 text-black border-0 px-2.5 py-1 text-xs flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-black" /> Featured
                </Badge>
              )}
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 text-xs text-white">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {provider.rating_average || 4.5}
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white/80 text-sm">{provider.years_of_experience || 10}+ Years Experience</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <p className="text-xs text-amber-600 uppercase tracking-wide mb-1">
            {provider.city || 'India'}
          </p>

          <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-amber-700 transition-colors line-clamp-1">
            {provider.display_name}
          </h3>

          <p className="text-gray-500 text-sm line-clamp-2 mb-3">
            {provider.bio || `Experienced priest specializing in ${(provider.specializations || ['Vedic Rituals']).slice(0, 2).join(', ')}.`}
          </p>

          {/* Specializations */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(provider.specializations || ['Vedic Rituals', 'Havan']).slice(0, 3).map((spec, idx) => (
              <Badge key={idx} variant="secondary" className="bg-orange-50 text-orange-700 border-0 text-xs px-2 py-1 rounded-full">
                {spec}
              </Badge>
            ))}
          </div>

          {/* Languages */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Languages className="w-4 h-4" />
            {(provider.languages || ['Hindi', 'Sanskrit']).join(', ')}
          </div>
        </div>
      </div>
    </Link>
  );
}

function PriestCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function PriestPandit() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('all');
  const [showQuickQuery, setShowQuickQuery] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [queryCategory, setQueryCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rotate Hero Background
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { data: providers, isLoading } = useQuery({
    queryKey: ['priests'],
    queryFn: () => base44.entities.ProviderProfile.filter({ 
      provider_type: 'priest', 
      is_deleted: false,
      is_verified: true,
      is_hidden: false
    }, '-rating_average'),
  });

  const filteredProviders = providers?.filter(provider => {
    const matchesSearch = provider.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpec = selectedSpec === 'all' || 
      provider.specializations?.some(s => s.toLowerCase().includes(selectedSpec));
    return matchesSearch && matchesSpec;
  });

  const featuredProviders = filteredProviders?.filter(p => p.is_featured) || [];
  const regularProviders = filteredProviders?.filter(p => !p.is_featured) || [];

  const handleSubmitQuery = async () => {
    if (!queryText.trim()) {
      toast.error('Please enter your question');
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Your question has been submitted! You will receive an answer within 24 hours.');
    setShowQuickQuery(false);
    setQueryText('');
    setQueryCategory('');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 pb-24 font-sans">
      
      {/* Cinematic Hero */}
      <section className="relative h-[60vh] flex items-end justify-center overflow-hidden pb-16">
        <div className="absolute inset-0 z-0 bg-black">
          {HERO_IMAGES.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-60' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-orange-50 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium uppercase tracking-widest mb-4">
                <Users className="w-3 h-3 text-amber-400" />
                Sacred Guides
             </div>
             <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-none drop-shadow-xl">
                Expert Priests,<br/>
                <span className="italic text-white/70">Divine Guidance.</span>
             </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-6 max-w-7xl relative z-20 -mt-8">
        
        {/* Quick Query Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 shadow-xl shadow-stone-200/50 mb-8 border border-orange-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-100">
                <HelpCircle className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-serif text-gray-900">Have a Quick Question?</h3>
                <p className="text-gray-600 font-light">Ask our verified priests and get answers within 24 hours</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowQuickQuery(true)}
              className="bg-amber-600 hover:bg-amber-700 rounded-full px-6"
            >
              Ask a Question - ₹99
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-xl shadow-stone-200/50 mb-12 border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                 type="text" 
                 placeholder="Search priests by name..." 
                 className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-amber-500 focus:ring-0 transition-all text-sm"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           
           {/* Horizontal Specialization Filter */}
           <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              {SPECIALIZATIONS.map((spec) => (
                 <button
                    key={spec.value}
                    onClick={() => setSelectedSpec(spec.value)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                       selectedSpec === spec.value
                       ? 'bg-orange-600 text-white shadow-lg'
                       : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                 >
                    {spec.label}
                 </button>
              ))}
           </div>
        </div>

        {/* Featured Priests Section */}
        {featuredProviders.length > 0 && !searchQuery && selectedSpec === 'all' && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-amber-600" />
              <h2 className="text-3xl font-serif text-gray-900">Featured Priests</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProviders.map((provider) => (
                <PriestCard key={provider.id} provider={provider} />
              ))}
            </div>
            <div className="mt-12 mb-8 border-t border-gray-200" />
          </div>
        )}

        {/* All Priests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <PriestCardSkeleton key={i} />)
          ) : (searchQuery || selectedSpec !== 'all' ? filteredProviders : regularProviders)?.length > 0 ? (
            (searchQuery || selectedSpec !== 'all' ? filteredProviders : regularProviders).map((provider) => (
              <PriestCard key={provider.id} provider={provider} />
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-2">No priests available</h3>
              <p className="text-gray-500 font-light">Check back soon for verified priests.</p>
              <Button 
                variant="link" 
                onClick={() => {setSearchQuery(''); setSelectedSpec('all');}}
                className="text-amber-600 mt-2"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Query Modal */}
      <Dialog open={showQuickQuery} onOpenChange={setShowQuickQuery}>
        <DialogContent className="sm:max-w-lg rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Ask a Question</DialogTitle>
            <DialogDescription>
              Submit your question to our verified priests. You'll receive an answer within 24 hours.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">Category</Label>
              <Select value={queryCategory} onValueChange={setQueryCategory}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rituals">Rituals & Poojas</SelectItem>
                  <SelectItem value="festivals">Festivals</SelectItem>
                  <SelectItem value="muhurat">Muhurat & Timing</SelectItem>
                  <SelectItem value="traditions">Traditions</SelectItem>
                  <SelectItem value="general">General Guidance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Your Question</Label>
              <Textarea
                placeholder="Describe your question in detail..."
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                className="min-h-32 rounded-xl"
              />
            </div>

            <div className="bg-amber-50 p-4 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>Cost:</strong> ₹99 per question
                <br />
                <strong>Response time:</strong> Within 24 hours
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowQuickQuery(false)} className="flex-1 rounded-xl h-12">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitQuery}
              disabled={isSubmitting}
              className="flex-1 bg-amber-600 hover:bg-amber-700 rounded-xl h-12"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Submit & Pay ₹99
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}