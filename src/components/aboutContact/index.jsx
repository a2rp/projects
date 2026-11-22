import styles from "./style.module.css";

const skills = [
    "Frontend: React, Vite, React Router, styled-components, AOS/GSAP",
    "Backend: Node.js, Express.js, REST APIs, JWT auth, validation",
    "Database/Infra: MongoDB, Mongoose, Cloudinary",
    "Payments: Stripe, Razorpay",
    "DevOps/CI/CD: Git/GitHub, GitHub Actions, Netlify, Render, GitHub Pages",
    "Quality: Performance budgets, accessibility checks",
];

const highlights = [
    "Ships SEO-friendly, mobile-first interfaces",
    "Sets up GitHub Actions for automatic deploys",
    "Integrates Stripe/Razorpay with real-world flows",
];

const contactLinks = [
    { label: "Email", value: "ash.ranjan09@gmail.com", href: "mailto:ash.ranjan09@gmail.com" },
    { label: "Portfolio", value: "ashishranjan.net", href: "https://www.ashishranjan.net" },
    { label: "GitHub", value: "github.com/a2rp", href: "https://github.com/a2rp" },
    { label: "LinkedIn", value: "linkedin.com/in/aashishranjan", href: "https://www.linkedin.com/in/aashishranjan/" },
    { label: "Phone", value: "+91 8123747965", href: "tel:+918123747965" },
];

const AboutContact = () => (
    <section className={styles.section} aria-labelledby="about-heading">
        <header className={styles.sectionHeader}>
            <div>
                <p className={styles.eyebrow}>A little about me</p>
                <h2 id="about-heading">About &amp; contact</h2>
            </div>
            <p className={styles.sectionSummary}>
                Full-stack JavaScript developer based in Bengaluru, India.
            </p>
        </header>

        <div className={styles.contentGrid}>
            <article className={styles.aboutCard}>
                <h3>Building useful digital products</h3>
                <p>
                    I’m Ashish Ranjan, a full-stack JavaScript developer based in Bengaluru,
                    India. I design and build web products that feel effortless - fast
                    frontends, dependable APIs, and clean DevOps - so teams can ship more
                    in less time.
                </p>
                <p>
                    My core stack is React (Vite) + Node/Express + MongoDB, styled with
                    styled-components, integrated with Cloudinary and Stripe/Razorpay,
                    and deployed via GitHub Pages/Actions, Netlify, Render, or Firebase.
                </p>
                <p>
                    I work with a “ship → measure → iterate” mindset: get the essentials
                    live, watch real metrics, and improve quickly. I prioritize performance,
                    accessibility, security, predictable APIs, and straightforward code reviews.
                </p>

                <div className={styles.detailColumns}>
                    <div>
                        <h4>What I bring</h4>
                        <ul>
                            <li>Component systems that scale, with type-safety where it helps and docs where it counts</li>
                            <li>Backend routes that are clean, validated, and production-safe</li>
                            <li>CI/CD pipelines that make releases boring (the good kind)</li>
                        </ul>
                    </div>
                    <div>
                        <h4>Skills &amp; tools</h4>
                        <ul>
                            {skills.map((skill) => <li key={skill}>{skill}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4>Quick highlights</h4>
                        <ul>
                            {highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                        </ul>
                    </div>
                </div>

                <p className={styles.closingNote}>
                    When I’m not shipping, I experiment with digital/automation and share
                    notes to help devs move faster. If you value clarity, speed, and
                    maintainability, let’s build something great.
                </p>
                <h4>SEO Meta Description</h4>
                <p className={styles.availability}>
                    Full-stack dev in Bengaluru building fast, SEO-friendly React+Node apps
                    with secure APIs and CI/CD. <strong>Open to full-time roles and freelance.</strong>
                </p>
            </article>

            <aside className={styles.contactCard} id="contact" aria-labelledby="contact-heading">
                <p className={styles.eyebrow}>Get in touch</p>
                <h3 id="contact-heading">Contact</h3>
                <p className={styles.contactIntro}>
                    Have a project or opportunity in mind? Reach out through any of these.
                </p>
                <ul className={styles.contactList}>
                    {contactLinks.map(({ label, value, href }) => (
                        <li key={label}>
                            <span>{label}</span>
                            <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
                                {value}
                            </a>
                        </li>
                    ))}
                </ul>
            </aside>
        </div>
    </section>
);

export default AboutContact;
