import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Spinner from "./components/spinner";

const Home = lazy(() => import("./pages/home"));
const Search = lazy(() => import("./pages/search"));
const About = lazy(() => import("./pages/about"));
const NotFound = lazy(() => import("./pages/notFound"));

const AppRoutes = () => {
    const location = useLocation();

    return (
        <Suspense key={location.pathname} fallback={<Spinner />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
