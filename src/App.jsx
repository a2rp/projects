import { Box, CircularProgress } from "@mui/material";
import { lazy, Suspense, useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { Styled } from "./App.styled";
import ScrollToTop from "./components/ScrollToTop";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const Home = lazy(() => sleep(800).then(() => import("./pages/home")));
const About = lazy(() => sleep(800).then(() => import("./pages/about")));
const NotFound = lazy(() => sleep(800).then(() => import("./pages/notFound")));

const navItems = [
    { label: "Projects", to: "/" },
    { label: "About", to: "/about" },
];

const connectLinks = [
    { label: "Portfolio", href: "https://www.ashishranjan.net/", icon: "portfolio" },
    { label: "GitHub", href: "https://github.com/a2rp", icon: "github" },
    { label: "CodePen", href: "https://codepen.io/ash1198", icon: "codepen" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/aashishranjan", icon: "linkedin" },
    { label: "Facebook", href: "https://www.facebook.com/theash.ashish/", icon: "facebook" },
    { label: "YouTube", href: "https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1", icon: "youtube" },
    { label: "Email", href: "mailto:ash.ranjan09@gmail.com", icon: "mail" },
];

const supportLinks = [
    { label: "Support", href: "https://a2rp-donation-page.netlify.app/", icon: "support" },
    { label: "Buy Me a Coffee", href: "https://buymeacoffee.com/a2rp", icon: "coffee" },
    { label: "Patreon", href: "https://patreon.com/a2rp", icon: "patreon" },
];

function FooterIcon({ type }) {
    const icons = {
        portfolio: <span aria-hidden="true">◎</span>,
        github: <FaGithub aria-hidden="true" />,
        codepen: <span aria-hidden="true">◈</span>,
        linkedin: <span aria-hidden="true">in</span>,
        facebook: <span aria-hidden="true">f</span>,
        youtube: <span aria-hidden="true">▶</span>,
        mail: <span aria-hidden="true">@</span>,
        support: <span aria-hidden="true">♥</span>,
        coffee: <span aria-hidden="true">☕</span>,
        patreon: <span aria-hidden="true">P</span>,
    };
    return icons[type];
}

function FooterLinks({ links }) {
    return (
        <div className="iconLinks">
            {links.map((link) => (
                <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    title={link.label}
                >
                    <FooterIcon type={link.icon} />
                </a>
            ))}
        </div>
    );
}

const App = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    return (
        <Styled.Wrapper>
            <Styled.Header>
                <Styled.HeaderMain>
                    <Styled.BrandLink to="/" aria-label="Projects Index home">
                        <img src="/projects/logo.png" alt="Ashish Ranjan logo" />
                        <span>
                            <small>ASHISH RANJAN</small>
                            <strong>Projects Index</strong>
                        </span>
                    </Styled.BrandLink>

                    <Styled.HeaderNav aria-label="Primary navigation">
                        {navItems.map((item) => (
                            <Styled.NavLink key={item.to} to={item.to} end={item.to === "/"}>
                                {item.label}
                            </Styled.NavLink>
                        ))}
                    </Styled.HeaderNav>

                    <Styled.HeaderActions>
                        <a
                            className="sourceLink"
                            href="https://github.com/a2rp/projects"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaGithub aria-hidden="true" />
                            <span>Repository</span>
                        </a>
                        <Styled.MenuButton
                            type="button"
                            onClick={() => setMenuOpen((current) => !current)}
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
                        </Styled.MenuButton>
                    </Styled.HeaderActions>
                </Styled.HeaderMain>

                {menuOpen && (
                    <Styled.MobileMenu>
                        {navItems.map((item) => (
                            <Styled.NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={() => setMenuOpen(false)}>
                                {item.label}
                            </Styled.NavLink>
                        ))}
                        <a href="https://github.com/a2rp/projects" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
                            <FaGithub aria-hidden="true" /> Repository
                        </a>
                    </Styled.MobileMenu>
                )}
            </Styled.Header>

            <Styled.Main>
                <ScrollToTop />
                <Suspense
                    key={location.pathname}
                    fallback={
                        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
                            <CircularProgress aria-label="Loading page" />
                        </Box>
                    }
                >
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </Styled.Main>

            <Styled.Footer>
                <Styled.FooterMain>
                    <Styled.FooterCol>
                        <span>Copyright {"©"} {new Date().getFullYear()} </span>
                        <a href="https://www.ashishranjan.net/" target="_blank" rel="noopener noreferrer">
                            Ashish Ranjan
                        </a>
                    </Styled.FooterCol>
                    <Styled.FooterCol>
                        <small>Connect</small>
                        <FooterLinks links={connectLinks} />
                    </Styled.FooterCol>
                    <Styled.FooterCol>
                        <small>Support</small>
                        <FooterLinks links={supportLinks} />
                    </Styled.FooterCol>
                </Styled.FooterMain>
            </Styled.Footer>
        </Styled.Wrapper>
    );
};

export default App;
