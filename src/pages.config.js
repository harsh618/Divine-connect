import AdminDashboard from './pages/AdminDashboard';
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
import Home from './pages/Home';
import KundliGenerator from './pages/KundliGenerator';
import MatchMaking from './pages/MatchMaking';
import MyBookings from './pages/MyBookings';
import MyJourney from './pages/MyJourney';
import MyKundalis from './pages/MyKundalis';
import OnboardAstrologer from './pages/OnboardAstrologer';
import OnboardPriest from './pages/OnboardPriest';
import PoojaBooking from './pages/PoojaBooking';
import PoojaDetail from './pages/PoojaDetail';
import Poojas from './pages/Poojas';
import PriestDashboard from './pages/PriestDashboard';
import PriestProfile from './pages/PriestProfile';
import Priests from './pages/Priests';
import Profile from './pages/Profile';
import TempleDetail from './pages/TempleDetail';
import Temples from './pages/Temples';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
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
    "Home": Home,
    "KundliGenerator": KundliGenerator,
    "MatchMaking": MatchMaking,
    "MyBookings": MyBookings,
    "MyJourney": MyJourney,
    "MyKundalis": MyKundalis,
    "OnboardAstrologer": OnboardAstrologer,
    "OnboardPriest": OnboardPriest,
    "PoojaBooking": PoojaBooking,
    "PoojaDetail": PoojaDetail,
    "Poojas": Poojas,
    "PriestDashboard": PriestDashboard,
    "PriestProfile": PriestProfile,
    "Priests": Priests,
    "Profile": Profile,
    "TempleDetail": TempleDetail,
    "Temples": Temples,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};