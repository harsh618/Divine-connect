/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminDashboard from './pages/AdminDashboard';
import AdminProviderOnboarding from './pages/AdminProviderOnboarding';
import AdminUserAnalytics from './pages/AdminUserAnalytics';
import AdminUserDetail from './pages/AdminUserDetail';
import ArticleDetail from './pages/ArticleDetail';
import Articles from './pages/Articles';
import AstrologerDashboard from './pages/AstrologerDashboard';
import AstrologerProfile from './pages/AstrologerProfile';
import Astrology from './pages/Astrology';
import AstrologyProfile from './pages/AstrologyProfile';
import BecomeProvider from './pages/BecomeProvider';
import CampaignDetail from './pages/CampaignDetail';
import Dashboard from './pages/Dashboard';
import Donate from './pages/Donate';
import EditorDashboard from './pages/EditorDashboard';
import EnhancedPoojaBooking from './pages/EnhancedPoojaBooking';
import Home from './pages/Home';
import HotelDashboard from './pages/HotelDashboard';
import HotelDetail from './pages/HotelDetail';
import HotelOnboarding from './pages/HotelOnboarding';
import KundliGenerator from './pages/KundliGenerator';
import MatchMaking from './pages/MatchMaking';
import MyBookings from './pages/MyBookings';
import MyJourney from './pages/MyJourney';
import MyKundalis from './pages/MyKundalis';
import OnboardAstrologer from './pages/OnboardAstrologer';
import OnboardPriest from './pages/OnboardPriest';
import Pooja from './pages/Pooja';
import PoojaBooking from './pages/PoojaBooking';
import PoojaDetail from './pages/PoojaDetail';
import Poojas from './pages/Poojas';
import PriestDashboard from './pages/PriestDashboard';
import PriestPandit from './pages/PriestPandit';
import PriestProfile from './pages/PriestProfile';
import Priests from './pages/Priests';
import Profile from './pages/Profile';
import ProviderOnboarding from './pages/ProviderOnboarding';
import TempleDetails from './pages/TempleDetails';
import Temples from './pages/Temples';
import Yatra from './pages/Yatra';
import TempleDetail from './pages/TempleDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "AdminProviderOnboarding": AdminProviderOnboarding,
    "AdminUserAnalytics": AdminUserAnalytics,
    "AdminUserDetail": AdminUserDetail,
    "ArticleDetail": ArticleDetail,
    "Articles": Articles,
    "AstrologerDashboard": AstrologerDashboard,
    "AstrologerProfile": AstrologerProfile,
    "Astrology": Astrology,
    "AstrologyProfile": AstrologyProfile,
    "BecomeProvider": BecomeProvider,
    "CampaignDetail": CampaignDetail,
    "Dashboard": Dashboard,
    "Donate": Donate,
    "EditorDashboard": EditorDashboard,
    "EnhancedPoojaBooking": EnhancedPoojaBooking,
    "Home": Home,
    "HotelDashboard": HotelDashboard,
    "HotelDetail": HotelDetail,
    "HotelOnboarding": HotelOnboarding,
    "KundliGenerator": KundliGenerator,
    "MatchMaking": MatchMaking,
    "MyBookings": MyBookings,
    "MyJourney": MyJourney,
    "MyKundalis": MyKundalis,
    "OnboardAstrologer": OnboardAstrologer,
    "OnboardPriest": OnboardPriest,
    "Pooja": Pooja,
    "PoojaBooking": PoojaBooking,
    "PoojaDetail": PoojaDetail,
    "Poojas": Poojas,
    "PriestDashboard": PriestDashboard,
    "PriestPandit": PriestPandit,
    "PriestProfile": PriestProfile,
    "Priests": Priests,
    "Profile": Profile,
    "ProviderOnboarding": ProviderOnboarding,
    "TempleDetails": TempleDetails,
    "Temples": Temples,
    "Yatra": Yatra,
    "TempleDetail": TempleDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};