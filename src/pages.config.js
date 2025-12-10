import Home from './pages/Home';
import Temples from './pages/Temples';
import TempleDetail from './pages/TempleDetail';
import Poojas from './pages/Poojas';
import Donate from './pages/Donate';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Temples": Temples,
    "TempleDetail": TempleDetail,
    "Poojas": Poojas,
    "Donate": Donate,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};