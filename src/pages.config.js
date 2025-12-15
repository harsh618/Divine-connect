import Home from './pages/Home';
import Temples from './pages/Temples';
import TempleDetail from './pages/TempleDetail';
import Poojas from './pages/Poojas';
import Donate from './pages/Donate';
import Astrology from './pages/Astrology';
import Priests from './pages/Priests';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import MyJourney from './pages/MyJourney';
import PoojaDetail from './pages/PoojaDetail';
import BecomeProvider from './pages/BecomeProvider';
import KundliGenerator from './pages/KundliGenerator';
import AstrologyProfile from './pages/AstrologyProfile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Temples": Temples,
    "TempleDetail": TempleDetail,
    "Poojas": Poojas,
    "Donate": Donate,
    "Astrology": Astrology,
    "Priests": Priests,
    "MyBookings": MyBookings,
    "Profile": Profile,
    "AdminDashboard": AdminDashboard,
    "MyJourney": MyJourney,
    "PoojaDetail": PoojaDetail,
    "BecomeProvider": BecomeProvider,
    "KundliGenerator": KundliGenerator,
    "AstrologyProfile": AstrologyProfile,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};