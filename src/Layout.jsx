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
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  LogOut, 
  Home, 
  Building2, 
  Flame, 
  Stars, 
  Users, 
  Heart,
  Settings,
  Compass,
  Edit
} from 'lucide-react';

function LayoutContent({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isHotelAdmin, setIsHotelAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const { t } = useTranslation();

  const navLinks = [
    { name: t('Mandir'), icon: Building2, page: 'Temples' },
    { name: t('Pooja'), icon: Flame, page: 'Pooja' },
    { name: t('Yatra'), icon: Compass, page: 'Yatra' },
    { name: t('Pandit'), icon: Users, page: 'PriestPandit' },
    { name: t('Jyotish'), icon: Stars, page: 'Astrology' },
    { name: t('Daan'), icon: Heart, page: 'Donate' },
  ];

  // Lotus SVG for branding
  const LotusIcon = () => (
    <svg viewBox="0 0 32 32" className="w-7 h-7 md:w-8 md:h-8" fill="none">
      <path d="M16 4c0 4-4 8-4 12s4 8 4 8 4-4 4-8-4-8-4-12z" fill="#D4A84B" opacity="0.9"/>
      <path d="M8 10c2 3 2 8 4 10s4 4 4 4-2-4-2-8-4-6-6-6z" fill="#C17B54" opacity="0.8"/>
      <path d="M24 10c-2 3-2 8-4 10s-4 4-4 4 2-4 2-8 4-6 6-6z" fill="#C17B54" opacity="0.8"/>
      <path d="M4 16c3 1 6 4 8 6s4 4 4 4-2-3-4-6-6-5-8-4z" fill="#D4A84B" opacity="0.6"/>
      <path d="M28 16c-3 1-6 4-8 6s-4 4-4 4 2-3 4-6 6-5 8-4z" fill="#D4A84B" opacity="0.6"/>
    </svg>
  );

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const authenticated = await base44.auth.isAuthenticated();
        
        if (!authenticated) {
          setUser(null);
          setUserRole(null);
          setIsHotelAdmin(false);
          setIsLoading(false);
          return;
        }

        const userData = await base44.auth.me();
        setUser(userData);
        
        // Fetch provider profile separately with error handling
        try {
          const profiles = await base44.entities.ProviderProfile.filter({ 
            user_id: userData.id, 
            is_deleted: false,
            profile_status: 'approved'
          });
          if (profiles && profiles.length > 0) {
            setUserRole(profiles[0].provider_type);
          }
        } catch (e) {
          // Silently fail - user may not have a provider profile
        }

        // Fetch hotel admin status separately
        try {
          const hotels = await base44.entities.Hotel.filter({
            admin_user_id: userData.id,
            is_deleted: false
          });
          if (hotels && hotels.length > 0) {
            setIsHotelAdmin(true);
          }
        } catch (e) {
          // Silently fail - user may not be a hotel admin
        }

      } catch (error) {
        setUser(null);
        setUserRole(null);
        setIsHotelAdmin(false);
      }
      setIsLoading(false);
    };
    
    loadUser();
  }, []);

  const handleSignIn = () => {
    base44.auth.redirectToLogin();
  };

  const handleSignOut = () => {
    base44.auth.logout(createPageUrl('Home'));
  };

  return (
    <div className="min-h-screen relative">
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-burnt-sienna">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <LotusIcon />
              <span className="text-base md:text-xl font-serif text-deep-brown font-semibold tracking-wide">
                Mandir<span className="text-gold">Sutra</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <Link key={link.name} to={createPageUrl(link.page)}>
                  <span className={`text-xs lg:text-sm transition-all cursor-pointer uppercase tracking-wider font-medium pb-1 border-b-2 ${
                    currentPageName === link.page 
                      ? 'text-burnt-sienna border-burnt-sienna font-semibold' 
                      : 'text-deep-brown border-transparent hover:text-burnt-sienna hover:border-gold'
                  }`}>
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* Right Side - Auth Buttons */}
            <div className="flex items-center gap-2 md:gap-3">
              {isLoading ? (
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#EDE5D8] animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#C17B54] to-[#A66B48] hover:from-[#A66B48] hover:to-[#8B5A3C] text-[#F5F0E8] shadow-lg shadow-[#C17B54]/30"
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
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('Sign Out')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={handleSignIn}
                  className="h-9 md:h-10 px-4 md:px-6 btn-spiritual text-xs md:text-sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  {t('Sign In')}
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

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-card-strong border-t border-burnt-sienna z-50">
        <div className="grid grid-cols-7 gap-1 py-2 px-1 safe-area-bottom">
          <Link to={createPageUrl('Home')} className={`flex flex-col items-center py-2 rounded-2xl transition-all ${currentPageName === 'Home' ? 'text-[#C17B54] bg-[#C17B54]/10' : 'text-[#5D3A1A]/70'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-medium">{t('Home')}</span>
          </Link>
          <Link to={createPageUrl('Temples')} className={`flex flex-col items-center py-2 rounded-2xl transition-all ${currentPageName === 'Temples' ? 'text-[#C17B54] bg-[#C17B54]/10' : 'text-[#5D3A1A]/70'}`}>
            <Building2 className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-medium">{t('Mandir')}</span>
          </Link>
          <Link to={createPageUrl('Pooja')} className={`flex flex-col items-center py-2 rounded-2xl transition-all ${currentPageName === 'Pooja' ? 'text-[#C17B54] bg-[#C17B54]/10' : 'text-[#5D3A1A]/70'}`}>
            <Flame className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-medium">{t('Pooja')}</span>
          </Link>
          <Link to={createPageUrl('Yatra')} className={`flex flex-col items-center py-2 rounded-2xl transition-all ${currentPageName === 'Yatra' ? 'text-[#C17B54] bg-[#C17B54]/10' : 'text-[#5D3A1A]/70'}`}>
            <Compass className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-medium">{t('Yatra')}</span>
          </Link>
          <Link to={createPageUrl('PriestPandit')} className={`flex flex-col items-center py-2 rounded-2xl transition-all ${currentPageName === 'PriestPandit' ? 'text-[#C17B54] bg-[#C17B54]/10' : 'text-[#5D3A1A]/70'}`}>
            <Users className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-medium">{t('Pandit')}</span>
          </Link>
          <Link to={createPageUrl('Astrology')} className={`flex flex-col items-center py-2 rounded-2xl transition-all ${currentPageName === 'Astrology' ? 'text-[#C17B54] bg-[#C17B54]/10' : 'text-[#5D3A1A]/70'}`}>
            <Stars className="w-5 h-5" />
            <span className="text-[9px] mt-1 font-medium">{t('Jyotish')}</span>
          </Link>
          {user ? (
            <Link to={createPageUrl('Profile')} className={`flex flex-col items-center py-2 rounded-2xl transition-all ${currentPageName === 'Profile' ? 'text-[#C17B54] bg-[#C17B54]/10' : 'text-[#5D3A1A]/70'}`}>
              <User className="w-5 h-5" />
              <span className="text-[9px] mt-1 font-medium">{t('Profile')}</span>
            </Link>
          ) : (
            <button onClick={handleSignIn} className="flex flex-col items-center py-2 rounded-2xl transition-all text-[#C17B54]">
              <User className="w-5 h-5" />
              <span className="text-[9px] mt-1 font-medium">{t('Sign In')}</span>
            </button>
          )}
        </div>
      </nav>

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