import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";
import styles from "./style.module.css";

const navItems = [
    { label: "Projects", to: "/" },
    { label: "About", to: "/about" },
];

const repositoryUrl = "https://github.com/a2rp/projects";

const Header = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (!menuOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event) => {
            if (event.key === "Escape") setMenuOpen(false);
        };

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", closeOnEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [menuOpen]);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    return (
        <header className={styles.header}>
            <div className={styles.headerMain}>
                <NavLink
                    className={styles.brandLink}
                    to="/"
                    aria-label="Projects Index home"
                >
                    <img src="/projects/logo.png" alt="Ashish Ranjan logo" />
                    <span>
                        <small>ASHISH RANJAN</small>
                        <strong>Projects Index</strong>
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
                    <a
                        className={styles.sourceLink}
                        href={repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaGithub aria-hidden="true" />
                        <span>Repository</span>
                    </a>
                    <button
                        className={styles.menuButton}
                        type="button"
                        onClick={() => setMenuOpen((current) => !current)}
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-navigation"
                    >
                        {menuOpen ? (
                            <FiX aria-hidden="true" />
                        ) : (
                            <FiMenu aria-hidden="true" />
                        )}
                    </button>
                </div>
            </div>

            {menuOpen && (
                <nav
                    className={styles.mobileMenu}
                    id="mobile-navigation"
                    aria-label="Mobile navigation"
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
            )}
        </header>
    );
};

export default Header;
