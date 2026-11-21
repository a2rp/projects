import { useEffect, useRef, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";
import styles from "./style.module.css";

const navItems = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/about#contact" },
];

const repositoryUrl = "https://github.com/a2rp/projects";

const Header = () => {
    const location = useLocation();
    const headerRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (!menuOpen) return undefined;

        const scrollArea = document.getElementById("page-scroll-area");
        const header = headerRef.current;
        const previousScrollbarGap = header?.style.getPropertyValue("--menu-scrollbar-gap") || "";
        const scrollbarGap = scrollArea ? scrollArea.offsetWidth - scrollArea.clientWidth : 0;
        const closeOnEscape = (event) => {
            if (event.key === "Escape") setMenuOpen(false);
        };

        if (header) header.style.setProperty("--menu-scrollbar-gap", `${scrollbarGap}px`);
        document.addEventListener("keydown", closeOnEscape);

        return () => {
            if (header) {
                if (previousScrollbarGap) {
                    header.style.setProperty("--menu-scrollbar-gap", previousScrollbarGap);
                } else {
                    header.style.removeProperty("--menu-scrollbar-gap");
                }
            }
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [menuOpen]);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    return (
        <header className={styles.header} ref={headerRef}>
            <div className={styles.headerMain}>
                <NavLink
                    className={styles.brandLink}
                    to="/"
                    aria-label="Ashish Ranjan Project Portfolio home"
                >
                    <img src="/projects/logo.png" alt="Ashish Ranjan logo" />
                    <span>
                        <small>Ashish Ranjan</small>
                        <strong>Project Portfolio</strong>
                    </span>
                </NavLink>

                <nav
                    className={styles.headerNav}
                    aria-label="Primary navigation"
                >
                    {navItems.map((item) => (
                        <NavLink
                            className={({ isActive }) =>
                                isActive
                                    ? styles.activeNavLink
                                    : styles.navLink
                            }
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.headerActions}>
                    <div
                        className={styles.menuLink}
                        role="button"
                        tabIndex={0}
                        onClick={() => setMenuOpen((current) => !current)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setMenuOpen((current) => !current);
                            }
                        }}
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        aria-controls="header-menu"
                    >
                        {menuOpen ? (
                            <FiX aria-hidden="true" />
                        ) : (
                            <FiMenu aria-hidden="true" />
                        )}
                    </div>
                </div>
            </div>

            {menuOpen && (
                <div
                    className={styles.menuBackdrop}
                    aria-hidden="true"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            <nav
                className={`${styles.menuSlider} ${menuOpen ? styles.menuSliderOpen : ""}`}
                id="header-menu"
                aria-label="Menu navigation"
                aria-hidden={!menuOpen}
            >
                {navItems.map((item) => (
                    <NavLink
                        className={({ isActive }) =>
                            isActive
                                ? styles.activeMobileNavLink
                                : styles.mobileNavLink
                        }
                        key={item.to}
                        to={item.to}
                        end={item.to === "/"}
                        onClick={() => setMenuOpen(false)}
                    >
                        {item.label}
                    </NavLink>
                ))}
                <a
                    className={styles.mobileNavLink}
                    href={repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                >
                    <FaGithub aria-hidden="true" /> Repository
                </a>
            </nav>
        </header>
    );
};

export default Header;
