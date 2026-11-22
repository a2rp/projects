import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Spinner from "./components/spinner";

const Home = lazy(() => import("./pages/home"));
const NotFound = lazy(() => import("./pages/notFound"));

const AppRoutes = () => {
    const location = useLocation();

    return (
        <Suspense key={location.pathname} fallback={<Spinner />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
