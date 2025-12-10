import Home from './pages/Home';
import Temples from './pages/Temples';
import TempleDetail from './pages/TempleDetail';
import Poojas from './pages/Poojas';
import Donate from './pages/Donate';
import Astrology from './pages/Astrology';
import Priests from './pages/Priests';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
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
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};