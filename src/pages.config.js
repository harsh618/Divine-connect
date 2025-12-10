import Home from './pages/Home';
import Temples from './pages/Temples';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Temples": Temples,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};