import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  Settings
} from 'lucide-react';

function LayoutContent({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Temples', icon: Building2, page: 'Temples' },
    { name: 'Poojas', icon: Flame, page: 'Poojas' },
    { name: 'Astrology', icon: Stars, page: 'Astrology' },
    { name: 'Priests', icon: Users, page: 'Priests' },
    { name: 'Donate', icon: Heart, page: 'Donate' },
  ];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        if (authenticated) {
          const userData = await base44.auth.me();
          setUser(userData);
          
          // Check if user has a provider profile
          const profiles = await base44.entities.ProviderProfile.filter({ 
            user_id: userData.id, 
            is_deleted: false,
            profile_status: 'approved'
          });
          if (profiles && profiles.length > 0) {
            setUserRole(profiles[0].provider_type);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (e) {
        setUser(null);
        setUserRole(null);
      }
    };
    loadUser();
  }, []);

  const isHomePage = currentPageName === 'Home';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <span className="text-2xl font-serif font-bold text-orange-500">
                Divine
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.name} to={createPageUrl(link.page)}>
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {link.name}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="rounded-full"
                    >
                      <User className="w-5 h-5" />
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
                        Profile
                      </DropdownMenuItem>
                    </Link>

                    {userRole === 'priest' && (
                      <Link to={createPageUrl('PriestDashboard')}>
                        <DropdownMenuItem>
                          <Flame className="w-4 h-4 mr-2" />
                          Priest Dashboard
                        </DropdownMenuItem>
                      </Link>
                    )}

                    {userRole === 'astrologer' && (
                      <Link to={createPageUrl('AstrologerDashboard')}>
                        <DropdownMenuItem>
                          <Stars className="w-4 h-4 mr-2" />
                          Astrologer Dashboard
                        </DropdownMenuItem>
                      </Link>
                    )}

                    {!userRole && (
                      <>
                        <Link to={createPageUrl('AstrologyProfile')}>
                          <DropdownMenuItem>
                            <Stars className="w-4 h-4 mr-2" />
                            Astrology Profile
                          </DropdownMenuItem>
                        </Link>
                        <Link to={createPageUrl('MyBookings')}>
                          <DropdownMenuItem>
                            <Flame className="w-4 h-4 mr-2" />
                            My Bookings
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <Link to={createPageUrl('AdminDashboard')}>
                        <DropdownMenuItem>
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Panel
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => base44.auth.logout(createPageUrl('Home'))}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button 
                    variant="ghost" 
                    size="icon"
                  >
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col gap-2 mt-8">
                    <Link to={createPageUrl('Home')} onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Home className="w-5 h-5 mr-3" />
                        Home
                      </Button>
                    </Link>
                    {navLinks.map((link) => (
                      <Link key={link.name} to={createPageUrl(link.page)} onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <link.icon className="w-5 h-5 mr-3" />
                          {link.name}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Mobile Bottom Navigation - Only show when logged in */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex items-center justify-around py-2">
            <Link to={createPageUrl('Home')} className="flex flex-col items-center p-2 text-gray-600 hover:text-orange-500">
              <Home className="w-5 h-5" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link to={createPageUrl('MyJourney')} className="flex flex-col items-center p-2 text-gray-600 hover:text-orange-500">
              <Stars className="w-5 h-5" />
              <span className="text-xs mt-1">Journey</span>
            </Link>
            <Link to={createPageUrl('MyBookings')} className="flex flex-col items-center p-2 text-gray-600 hover:text-orange-500">
              <Flame className="w-5 h-5" />
              <span className="text-xs mt-1">Bookings</span>
            </Link>
            <Link to={createPageUrl('Donate')} className="flex flex-col items-center p-2 text-gray-600 hover:text-orange-500">
              <Heart className="w-5 h-5" />
              <span className="text-xs mt-1">Donate</span>
            </Link>
            <Link to={createPageUrl('Profile')} className="flex flex-col items-center p-2 text-gray-600 hover:text-orange-500">
              <User className="w-5 h-5" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return <LayoutContent children={children} currentPageName={currentPageName} />;
}