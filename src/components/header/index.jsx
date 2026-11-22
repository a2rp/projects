import { useEffect, useState } from "react";
import { FaCodepen, FaGithub } from "react-icons/fa";
import { FiHome, FiMenu, FiX } from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";
import styles from "./style.module.css";

const navItems = [
    { label: "Home", to: "/", icon: FiHome },
];

const repositoryUrl = "https://github.com/a2rp/projects";
const codePenUrl = "https://codepen.io/ash1198";

const Header = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (!menuOpen) return undefined;

        const closeOnEscape = (event) => {
            if (event.key === "Escape") setMenuOpen(false);
        };

        document.addEventListener("keydown", closeOnEscape);

        return () => {
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
                    {navItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                className={({ isActive }) =>
                                    isActive ? styles.activeNavLink : styles.navLink
                                }
                                key={item.to}
                                to={item.to}
                                end={item.to === "/"}
                            >
                                <Icon aria-hidden="true" />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                    <a
                        className={styles.navLink}
                        href={repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaGithub aria-hidden="true" />
                        <span>Repository</span>
                    </a>
                    <a
                        className={styles.navLink}
                        href={codePenUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaCodepen aria-hidden="true" />
                        <span>CodePen</span>
                    </a>
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
            <div
                className={`${styles.menuBackdrop} ${menuOpen ? styles.menuBackdropOpen : ""}`}
                aria-hidden="true"
                onClick={() => setMenuOpen(false)}
            />
            <nav
                className={`${styles.menuSlider} ${menuOpen ? styles.menuSliderOpen : ""}`}
                id="header-menu"
                aria-label="Menu navigation"
                aria-hidden={!menuOpen}
            >
                {navItems.map((item) => {
                    const Icon = item.icon;

                    return (
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
                            <Icon aria-hidden="true" />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
                <a
                    className={styles.mobileNavLink}
                    href={repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                >
                    <FaGithub aria-hidden="true" /> Repository
                </a>
                <a
                    className={styles.mobileNavLink}
                    href={codePenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                >
                    <FaCodepen aria-hidden="true" /> CodePen
                </a>
            </nav>
        </header>
    );
};

export default Header;
