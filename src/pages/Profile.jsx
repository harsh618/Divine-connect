import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Phone, 
  Save,
  Heart,
  Calendar,
  Star,
  LogOut,
  Loader2,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/components/translations';

const deities = ['Shiva', 'Vishnu', 'Ganesha', 'Hanuman', 'Durga', 'Krishna', 'Ram', 'Lakshmi', 'Saraswati'];
const rashis = ['Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)', 'Simha (Leo)', 
               'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)', 'Dhanu (Sagittarius)', 
               'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'];

export default function Profile() {
  const { language, changeLanguage } = useLanguage();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    gotra: '',
    rashi: '',
    favorite_deity: '',
    preferred_language: 'en'
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setFormData({
          full_name: userData.full_name || '',
          gotra: userData.gotra || '',
          rashi: userData.rashi || '',
          favorite_deity: userData.favorite_deity || '',
          preferred_language: userData.preferred_language || 'en'
        });
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: bookings } = useQuery({
    queryKey: ['user-bookings-count', user?.id],
    queryFn: () => base44.entities.Booking.filter({ user_id: user.id, is_deleted: false }),
    enabled: !!user?.id
  });

  const { data: donations } = useQuery({
    queryKey: ['user-donations', user?.id],
    queryFn: () => base44.entities.Donation.filter({ user_id: user.id }),
    enabled: !!user?.id
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      toast.success('Profile updated successfully!');
    }
  });

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      gotra: formData.gotra,
      rashi: formData.rashi,
      favorite_deity: formData.favorite_deity,
      preferred_language: formData.preferred_language
    });
    changeLanguage(formData.preferred_language);
  };

  const totalDonated = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
  const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-16 px-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
                {user.full_name || 'Devotee'}
              </h1>
              <p className="text-white/80">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-100">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{bookings?.length || 0}</p>
                <p className="text-sm text-gray-500">{t('profile.totalBookings', language)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedBookings}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-pink-100">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">₹{totalDonated.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Donated</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Full Name</Label>
                    <Input 
                      value={formData.full_name} 
                      disabled 
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Email</Label>
                    <Input 
                      value={user.email} 
                      disabled 
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Gotra</Label>
                    <Input 
                      placeholder="Enter your gotra"
                      value={formData.gotra}
                      onChange={(e) => setFormData({...formData, gotra: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Rashi (Moon Sign)</Label>
                    <Select 
                      value={formData.rashi} 
                      onValueChange={(value) => setFormData({...formData, rashi: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your rashi" />
                      </SelectTrigger>
                      <SelectContent>
                        {rashis.map(rashi => (
                          <SelectItem key={rashi} value={rashi}>{rashi}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Favorite Deity</Label>
                  <Select 
                    value={formData.favorite_deity} 
                    onValueChange={(value) => setFormData({...formData, favorite_deity: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your favorite deity" />
                    </SelectTrigger>
                    <SelectContent>
                      {deities.map(deity => (
                        <SelectItem key={deity} value={deity}>{deity}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">{t('profile.language', language)}</Label>
                  <Select 
                    value={formData.preferred_language} 
                    onValueChange={(value) => setFormData({...formData, preferred_language: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t('languages.en', language)}</SelectItem>
                      <SelectItem value="hi">{t('languages.hi', language)}</SelectItem>
                      <SelectItem value="ta">{t('languages.ta', language)}</SelectItem>
                      <SelectItem value="te">{t('languages.te', language)}</SelectItem>
                      <SelectItem value="bn">{t('languages.bn', language)}</SelectItem>
                      <SelectItem value="mr">{t('languages.mr', language)}</SelectItem>
                      <SelectItem value="gu">{t('languages.gu', language)}</SelectItem>
                      <SelectItem value="kn">{t('languages.kn', language)}</SelectItem>
                      <SelectItem value="ml">{t('languages.ml', language)}</SelectItem>
                      <SelectItem value="pa">{t('languages.pa', language)}</SelectItem>
                      <SelectItem value="or">{t('languages.or', language)}</SelectItem>
                      <SelectItem value="as">{t('languages.as', language)}</SelectItem>
                      <SelectItem value="ur">{t('languages.ur', language)}</SelectItem>
                      <SelectItem value="sa">{t('languages.sa', language)}</SelectItem>
                      <SelectItem value="kok">{t('languages.kok', language)}</SelectItem>
                      <SelectItem value="mni">{t('languages.mni', language)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to={createPageUrl('MyBookings')}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-3" />
                    My Bookings
                  </Button>
                </Link>
                <Link to={createPageUrl('KundliGenerator')}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Star className="w-4 h-4 mr-3" />
                    {t('profile.myKundli', language)}s
                  </Button>
                </Link>
                <Link to={createPageUrl('Donate')}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Heart className="w-4 h-4 mr-3" />
                    Donation History
                  </Button>
                </Link>
                {user.role === 'admin' && (
                  <Link to={createPageUrl('AdminDashboard')}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-3" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <Button 
                variant="outline" 
                onClick={() => base44.auth.logout()}
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}