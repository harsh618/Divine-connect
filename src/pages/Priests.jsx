import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Search, 
  Star, 
  MessageCircle, 
  Languages,
  CheckCircle,
  Send,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import BackButton from '../components/ui/BackButton';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/components/translations';

function PriestCard({ provider }) {
  const defaultAvatar = "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200";
  
  return (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500">
      <div className="p-6">
        <div className="flex gap-4">
          <div className="relative">
            <img
              src={provider.avatar_url || defaultAvatar}
              alt={provider.display_name}
              className="w-20 h-20 rounded-full object-cover"
            />
            {provider.is_verified && (
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white fill-white" />
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">
              {provider.display_name}
            </h3>
            <p className="text-sm text-gray-500">
              {provider.years_of_experience || 10}+ years experience
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium ml-1">{provider.rating_average || 4.8}</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">
                {provider.total_consultations || 200}+ poojas
              </span>
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div className="flex flex-wrap gap-1 mt-4">
          {(provider.specializations || ['Vedic Rituals', 'Havan', 'Marriage Ceremonies']).slice(0, 3).map((spec, idx) => (
            <Badge key={idx} variant="secondary" className="bg-orange-50 text-orange-700 border-0 text-xs">
              {spec}
            </Badge>
          ))}
        </div>

        {/* Languages */}
        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
          <Languages className="w-4 h-4" />
          {(provider.languages || ['Hindi', 'Sanskrit']).join(', ')}
        </div>

        {/* Bio */}
        {provider.bio && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{provider.bio}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Link to={createPageUrl(`PriestProfile?id=${provider.id}`)} className="flex-1">
            <Button variant="outline" className="w-full">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

function PriestCardSkeleton() {
  return (
    <Card className="overflow-hidden p-6">
      <div className="flex gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-12 w-full mt-4" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </Card>
  );
}

export default function Priests() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickQuery, setShowQuickQuery] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [queryCategory, setQueryCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: providers, isLoading } = useQuery({
    queryKey: ['priests'],
    queryFn: () => base44.entities.ProviderProfile.filter({ 
      provider_type: 'priest', 
      is_deleted: false,
      is_verified: true 
    }, '-rating_average'),
  });

  const filteredProviders = providers?.filter(provider => 
    provider.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitQuery = async () => {
    if (!queryText.trim()) {
      toast.error('Please enter your question');
      return;
    }
    setIsSubmitting(true);
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Your question has been submitted! You will receive an answer within 24 hours.');
    setShowQuickQuery(false);
    setQueryText('');
    setQueryCategory('');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 py-16 px-6">
        <div className="container mx-auto">
          <BackButton to={createPageUrl('Home')} label={t('common.back', language)} />
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Connect with Priests
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Get guidance from verified pandits for rituals, ceremonies, and spiritual queries.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        {/* Quick Query Card */}
        <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-orange-200 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-100">
                <HelpCircle className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Have a Quick Question?</h3>
                <p className="text-gray-600">Ask our verified priests and get answers within 24 hours</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowQuickQuery(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Ask a Question - ₹99
            </Button>
          </div>
        </Card>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search priests by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>
        </div>

        {/* Priests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <PriestCardSkeleton key={i} />)
          ) : filteredProviders?.length > 0 ? (
            filteredProviders.map((provider) => (
              <PriestCard key={provider.id} provider={provider} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-teal-100 flex items-center justify-center">
                <span className="text-4xl">🙏</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No priests available</h3>
              <p className="text-gray-500">Check back soon for verified priests</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Query Modal */}
      <Dialog open={showQuickQuery} onOpenChange={setShowQuickQuery}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ask a Question</DialogTitle>
            <DialogDescription>
              Submit your question to our verified priests. You'll receive an answer within 24 hours.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">Category</Label>
              <Select value={queryCategory} onValueChange={setQueryCategory}>
                <SelectTrigger>
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
                className="min-h-32"
              />
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Cost:</strong> ₹99 per question
                <br />
                <strong>Response time:</strong> Within 24 hours
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowQuickQuery(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitQuery}
              disabled={isSubmitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
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