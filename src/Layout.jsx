import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import AgentAssistChat from './components/yatra/AgentAssistChat';
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import { TranslationProvider, useTranslation } from './components/TranslationProvider';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Menu, 
  User, 
  LogOut, 
  Home, 
  Building2, 
  Flame, 
  Stars, 
  Users, 
  Heart,
  Search,
  Settings,
  Compass,
  Edit,
  Languages
} from 'lucide-react';

function LayoutContent({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isHotelAdmin, setIsHotelAdmin] = useState(false);
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' }
  ];

  const navLinks = [
    { name: t('Mandir'), icon: Building2, page: 'Temples' },
    { name: t('Pooja'), icon: Flame, page: 'Pooja' },
    { name: t('Yatra'), icon: Compass, page: 'Yatra' },
    { name: t('Pandit'), icon: Users, page: 'PriestPandit' },
    { name: t('Jyotish'), icon: Stars, page: 'Astrology' },
    { name: t('Daan'), icon: Heart, page: 'Donate' },
  ];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        
        if (!authenticated) {
          setUser(null);
          setUserRole(null);
          setIsHotelAdmin(false);
          return;
        }

        const userData = await base44.auth.me();
        setUser(userData);
        
        // Only fetch additional data if we have a valid user
        try {
          const profiles = await base44.entities.ProviderProfile.filter({ 
            user_id: userData.id, 
            is_deleted: false,
            profile_status: 'approved'
          });
          if (profiles && profiles.length > 0) {
            setUserRole(profiles[0].provider_type);
          }
        } catch (profileError) {
          console.error("Could not load provider profile:", profileError);
        }

        try {
          const hotels = await base44.entities.Hotel.filter({
            admin_user_id: userData.id,
            is_deleted: false
          });
          if (hotels && hotels.length > 0) {
            setIsHotelAdmin(true);
          }
        } catch (hotelError) {
          console.error("Could not load hotel data:", hotelError);
        }

      } catch (error) {
        console.error("Authentication error:", error);
        setUser(null);
        setUserRole(null);
        setIsHotelAdmin(false);
      }
    };
    
    loadUser();
  }, []);

  const isHomePage = currentPageName === 'Home';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-orange-200 shadow-lg">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center">
              <span className="text-base md:text-xl font-serif bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-bold">
                Mandir<span className="inline-block w-0.5 md:w-1"></span>Sutra
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <Link key={link.name} to={createPageUrl(link.page)}>
                  <span className={`text-xs lg:text-sm transition-all cursor-pointer uppercase tracking-wider font-medium pb-1 border-b-2 ${
                    currentPageName === link.page 
                      ? 'text-orange-600 border-orange-600 font-semibold' 
                      : 'text-gray-700 border-transparent hover:text-orange-500 hover:border-orange-400'
                  }`}>
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 md:gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
                    >
                      <User className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2">
                      <p className="font-medium text-sm">{user.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <Link to={createPageUrl('Profile')}>
                      <DropdownMenuItem>
                        <User className="w-4 h-4 mr-2" />
                        {t('Profile')}
                      </DropdownMenuItem>
                    </Link>

                    {userRole === 'priest' && (
                      <Link to={createPageUrl('PriestDashboard')}>
                        <DropdownMenuItem>
                          <Flame className="w-4 h-4 mr-2" />
                          {t('Priest Dashboard')}
                        </DropdownMenuItem>
                      </Link>
                    )}

                    {userRole === 'astrologer' && (
                      <Link to={createPageUrl('AstrologerDashboard')}>
                        <DropdownMenuItem>
                          <Stars className="w-4 h-4 mr-2" />
                          {t('Astrologer Dashboard')}
                        </DropdownMenuItem>
                      </Link>
                    )}

                    {isHotelAdmin && (
                      <Link to={createPageUrl('HotelDashboard')}>
                        <DropdownMenuItem>
                          <Building2 className="w-4 h-4 mr-2" />
                          {t('Hotel Dashboard')}
                        </DropdownMenuItem>
                      </Link>
                    )}

                    {!userRole && (
                      <>
                        <Link to={createPageUrl('AstrologyProfile')}>
                          <DropdownMenuItem>
                            <Stars className="w-4 h-4 mr-2" />
                            {t('Astrology Profile')}
                          </DropdownMenuItem>
                        </Link>
                        <Link to={createPageUrl('MyKundalis')}>
                          <DropdownMenuItem>
                            <Stars className="w-4 h-4 mr-2" />
                            {t('My Kundalis')}
                          </DropdownMenuItem>
                        </Link>
                        <Link to={createPageUrl('MyBookings')}>
                          <DropdownMenuItem>
                            <Flame className="w-4 h-4 mr-2" />
                            {t('My Bookings')}
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}

                    {(user.role === 'admin' || user.app_role === 'admin') && (
                      <Link to={createPageUrl('AdminDashboard')}>
                        <DropdownMenuItem>
                          <Settings className="w-4 h-4 mr-2" />
                          {t('Admin Panel')}
                        </DropdownMenuItem>
                      </Link>
                    )}

                    {(user.app_role === 'editor' || user.role === 'admin') && (
                      <Link to={createPageUrl('EditorDashboard')}>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          {t('Content Editor')}
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => base44.auth.logout(createPageUrl('Home'))}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('Sign Out')}
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  size="icon"
                  className="w-9 h-9 md:w-auto md:h-auto md:px-5 md:py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-full md:rounded-md transition-all border-0 shadow-lg"
                >
                  <User className="w-4 h-4 md:hidden" />
                  <span className="hidden md:inline text-xs uppercase tracking-wider font-semibold">{t('Sign In')}</span>
                </Button>
              )}
                </div>
                </div>
                </div>
                </nav>

      {/* Page Content */}
      <main className="pt-14 md:pt-16">
        {children}
      </main>

      {/* Mobile Bottom Navigation - Only show when logged in */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 shadow-lg">
          <div className="grid grid-cols-7 gap-1 py-2 px-1 safe-area-bottom">
            <Link to={createPageUrl('Home')} className={`flex flex-col items-center py-2 rounded-lg transition-all ${currentPageName === 'Home' ? 'text-orange-600 bg-orange-50' : 'text-gray-600'}`}>
              <Home className="w-5 h-5" />
              <span className="text-[9px] mt-1 font-medium">{t('Home')}</span>
            </Link>
            <Link to={createPageUrl('Temples')} className={`flex flex-col items-center py-2 rounded-lg transition-all ${currentPageName === 'Temples' ? 'text-orange-600 bg-orange-50' : 'text-gray-600'}`}>
              <Building2 className="w-5 h-5" />
              <span className="text-[9px] mt-1 font-medium">{t('Mandir')}</span>
            </Link>
            <Link to={createPageUrl('Pooja')} className={`flex flex-col items-center py-2 rounded-lg transition-all ${currentPageName === 'Pooja' ? 'text-orange-600 bg-orange-50' : 'text-gray-600'}`}>
              <Flame className="w-5 h-5" />
              <span className="text-[9px] mt-1 font-medium">{t('Pooja')}</span>
            </Link>
            <Link to={createPageUrl('Yatra')} className={`flex flex-col items-center py-2 rounded-lg transition-all ${currentPageName === 'Yatra' ? 'text-orange-600 bg-orange-50' : 'text-gray-600'}`}>
              <Compass className="w-5 h-5" />
              <span className="text-[9px] mt-1 font-medium">{t('Yatra')}</span>
            </Link>
            <Link to={createPageUrl('PriestPandit')} className={`flex flex-col items-center py-2 rounded-lg transition-all ${currentPageName === 'PriestPandit' ? 'text-orange-600 bg-orange-50' : 'text-gray-600'}`}>
              <Users className="w-5 h-5" />
              <span className="text-[9px] mt-1 font-medium">{t('Pandit')}</span>
            </Link>
            <Link to={createPageUrl('Astrology')} className={`flex flex-col items-center py-2 rounded-lg transition-all ${currentPageName === 'Astrology' ? 'text-orange-600 bg-orange-50' : 'text-gray-600'}`}>
              <Stars className="w-5 h-5" />
              <span className="text-[9px] mt-1 font-medium">{t('Jyotish')}</span>
            </Link>
            <Link to={createPageUrl('Donate')} className={`flex flex-col items-center py-2 rounded-lg transition-all ${currentPageName === 'Donate' ? 'text-orange-600 bg-orange-50' : 'text-gray-600'}`}>
              <Heart className="w-5 h-5" />
              <span className="text-[9px] mt-1 font-medium">{t('Daan')}</span>
            </Link>
          </div>
        </nav>
        )}

        {/* Global Agent Assist Chat */}
        <AgentAssistChat />
        </div>
        );
        }

        export default function Layout({ children, currentPageName }) {
          return (
            <LanguageProvider>
              <TranslationProvider>
                <LayoutContent children={children} currentPageName={currentPageName} />
              </TranslationProvider>
            </LanguageProvider>
          );
        }