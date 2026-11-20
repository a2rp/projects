import { Box, CircularProgress } from "@mui/material";
import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

const Home = lazy(() => import("./pages/home"));
const About = lazy(() => import("./pages/about"));
const NotFound = lazy(() => import("./pages/notFound"));

function RouteFallback() {
    return (
        <Box
            role="status"
            aria-label="Loading page"
            sx={{
                minHeight: "60vh",
                display: "grid",
                placeItems: "center",
            }}
        >
            <CircularProgress aria-hidden="true" />
        </Box>
    );
}

const AppRoutes = () => {
    const location = useLocation();

    return (
        <Suspense key={location.pathname} fallback={<RouteFallback />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
