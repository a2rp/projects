import { FaGithub } from "react-icons/fa";
import styles from "./style.module.css";

const connectLinks = [
    {
        label: "Portfolio",
        href: "https://www.ashishranjan.net/",
        icon: "portfolio",
    },
    { label: "GitHub", href: "https://github.com/a2rp", icon: "github" },
    { label: "CodePen", href: "https://codepen.io/ash1198", icon: "codepen" },
    {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/aashishranjan",
        icon: "linkedin",
    },
    {
        label: "Facebook",
        href: "https://www.facebook.com/theash.ashish/",
        icon: "facebook",
    },
    {
        label: "YouTube",
        href: "https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1",
        icon: "youtube",
    },
    { label: "Email", href: "mailto:ash.ranjan09@gmail.com", icon: "mail" },
];

const supportLinks = [
    {
        label: "Support",
        href: "https://a2rp-donation-page.netlify.app/",
        icon: "support",
    },
    {
        label: "Buy Me a Coffee",
        href: "https://buymeacoffee.com/a2rp",
        icon: "coffee",
    },
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

    return icons[type] ?? null;
}

function FooterLinks({ links }) {
    return (
        <div className={styles.iconLinks}>
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

const Footer = () => (
    <footer className={styles.footer}>
        <div className={styles.footerMain}>
            <div className={styles.footerCol}>
                <span>
                    Copyright {"©"} {new Date().getFullYear()}{" "}
                </span>
                <a
                    href="https://www.ashishranjan.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Ashish Ranjan
                </a>
            </div>
            <div className={styles.footerCol}>
                <small>Connect</small>
                <FooterLinks links={connectLinks} />
            </div>
            <div className={styles.footerCol}>
                <small>Support</small>
                <FooterLinks links={supportLinks} />
            </div>
        </div>
    </footer>
);

export default Footer;
