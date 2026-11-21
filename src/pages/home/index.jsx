import React, { useMemo, useState } from "react";
import styles from "./style.module.css";

const projects = [
    {
        name: "Projects Index",
        desc: "Directory of all my projects with search and quick links.",
        tech: ["React", "Vite", "CSS Modules"],
        live: "https://a2rp.github.io/projects",
        code: [{ label: "Repo", url: "https://github.com/a2rp/projects" }],
    },
    {
        name: "Public Resume (Releases)",
        desc: "Versioned resume with a permanent download link.",
        tech: ["React", "Vite", "Styled Components", "GitHub Releases"],
        live: "https://a2rp.github.io/resume/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/resume" }],
    },
    {
        name: "Modal/Drawer Pro",
        desc: "Accessible modal & drawer with nesting (z-stack), ESC/backdrop close, scroll-lock, localStorage, confirm dialog, and toasts.",
        tech: ["React", "Vite", "Styled Components", "React Toastify"],
        live: "https://a2rp.github.io/modal-pro/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/modal-pro" }],
    },
    {
        name: "Tooltip Pro",
        desc: "Dependency-free tooltips & popovers with smart positioning (flip/shift/arrow), hover/focus/click triggers, and accessible ARIA wiring.",
        tech: ["React", "Vite", "Styled Components"],
        live: "https://a2rp.github.io/tooltip-pro/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/tooltip-pro" }],
    },
    {
        name: "Tabs Pro",
        desc: "Accessible tabs with add/close and localStorage persistence (no keyboard shortcuts).",
        tech: ["React", "Vite", "Styled Components"],
        live: "https://a2rp.github.io/tabs-pro/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/tabs-pro" }],
    },
    {
        name: "Accordion Pro",
        desc: "Click-only accordion (no keyboard controls) with localStorage persistence and expand/collapse helpers.",
        tech: ["React", "Vite", "Styled Components"],
        live: "https://a2rp.github.io/accordion-pro/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/accordion-pro" }],
    },
    {
        name: "Dropdown/Menu Pro",
        desc: "Click-only dropdown with one-level submenu, smart placement (flip & clamp), outside-click close. No portals used.",
        tech: ["React", "Vite", "Styled Components"],
        live: "https://a2rp.github.io/dropdown-pro/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/dropdown-pro" }],
    }, {
        name: "KYC Verification",
        desc: "React KYC verification UI with styled-components, RHF+Yup validation, image preview & clear, header actions, toasts, and localStorage draft save.",
        tech: ["React", "Vite", "Styled Components", "React Hook Form", "Yup", "React Toastify"],
        live: "https://a2rp.github.io/kyc-verification/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/kyc-verification" }],
    }, {
        name: "Blob Generator",
        desc: "CSS blob generator with size controls, 4-corner radii, gradient angle & colors, live preview, Copy CSS, and Randomize/Reset.",
        tech: ["React", "Vite", "Styled Components"],
        live: "https://a2rp.github.io/blob-generator/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/blob-generator" }],
    }, {
        name: "Blood Bank",
        desc: "Frontend-only blood bank app: donor search/filters, register form (RHF + Zod), contact messages with confirm modal, donor details modal with edit, dark/light theme, localStorage persistence.",
        tech: ["React", "Vite", "Styled Components", "React Router", "React Hook Form", "Zod"],
        live: "https://a2rp.github.io/blood-bank/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/blood-bank" }],
    }, {
        name: "HealthPro - BMI",
        desc: "Advanced BMI calculator with unit conversions (kg/lb, cm or ft+in), WHO categories (incl. Class I-III), healthy weight range, i18n (EN/HI), history & CSV export. Self-made confirm modals, accessible form, and localStorage persistence.",
        tech: ["React", "Vite", "Styled Components", "React Router", "Tolgee (i18n)"],
        live: "https://a2rp.github.io/bmi-calculator/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/bmi-calculator" }],
    },
];




const featuredProject = projects[projects.length - 1];

const Home = () => {
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const v = q.trim().toLowerCase();
        if (!v) return projects;
        return projects.filter((p) => {
            const hay =
                (p.name || "") +
                " " +
                (p.desc || "") +
                " " +
                (Array.isArray(p.tech) ? p.tech.join(" ") : "") +
                " " +
                (Array.isArray(p.code) ? p.code.map((c) => c.label).join(" ") : "");
            return hay.toLowerCase().includes(v);
        });
    }, [q]);

    const list = useMemo(() => [...filtered].reverse(), [filtered]);

    return (
        <>
            <div className={styles.wrapper}>
                <section
                    className={styles.hero}
                    aria-labelledby="featured-project-title"
                >
                    <div className={styles.heroContent}>
                        <p className={styles.heroEyebrow}>
                            <span className={styles.eyebrowLine} />
                            Latest project
                            <span className={styles.eyebrowDivider}>/</span>
                            Health &amp; wellness
                        </p>
                        <h1
                            className={styles.heroTitle}
                            id="featured-project-title"
                        >
                            {featuredProject.name}
                        </h1>
                        <p className={styles.heroDescription}>
                            A smarter BMI calculator with WHO categories,
                            healthy weight guidance, bilingual support, and
                            exportable history.
                        </p>

                        <div className={styles.heroActions}>
                            <a
                                className={styles.primaryAction}
                                href={featuredProject.live}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open live project <span aria-hidden="true">↗</span>
                            </a>
                            <a
                                className={styles.secondaryAction}
                                href={featuredProject.code[0].url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View source
                            </a>
                        </div>

                        <div
                            className={styles.heroTech}
                            aria-label="Project technologies"
                        >
                            {featuredProject.tech.slice(0, 4).map((tech) => (
                                <span className={styles.heroTechTag} key={tech}>
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className={styles.heroVisual} aria-hidden="true">
                        <div className={styles.visualOrbit} />
                        <div className={styles.resultCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardLabel}>
                                    HEALTH SNAPSHOT
                                </span>
                                <span className={styles.previewBadge}>
                                    SAMPLE
                                </span>
                            </div>

                            <div className={styles.cardMetric}>
                                <div className={styles.bmiGauge}>
                                    <div className={styles.gaugeContent}>
                                        <span>BMI</span>
                                        <strong>22.4</strong>
                                        <small>HEALTHY</small>
                                    </div>
                                </div>
                                <div className={styles.metricDetails}>
                                    <span>BODY MASS INDEX</span>
                                    <strong>Healthy range</strong>
                                    <small>WHO category</small>
                                </div>
                            </div>

                            <div className={styles.rangeSection}>
                                <div className={styles.rangeLabels}>
                                    <span>UNDER</span>
                                    <span>HEALTHY</span>
                                    <span>OVER</span>
                                </div>
                                <div className={styles.rangeTrack}>
                                    <span />
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <span>EN / हिंदी</span>
                                <span>History &amp; CSV export</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className={styles.head}>
                    <div>
                        <h2 className={styles.title}>Projects Index</h2>
                        <p className={styles.sub}>Search by name, description, or tech stack</p>
                    </div>
                    <input
                        className={styles.search}
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search projects…"
                    />
                </div>

                {filtered.length > 0 ? (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: 56 }}>#</th>
                                    <th>Project Name</th>
                                    <th>Project Description</th>
                                    <th>Tech Stack</th>
                                    <th>Live Link</th>
                                    <th>GitHub Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((p, i) => (
                                    <tr key={p.name + i}>
                                        <td>{String(list.length - i).padStart(3, "0")}</td>
                                        <td>{p.name}</td>
                                        <td>{p.desc}</td>
                                        <td>
                                            <div className={styles.tags}>
                                                {(p.tech || []).map((t) => (
                                                    <span className={styles.tag} key={t}>{t}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            {p.live ? (
                                                <a href={p.live} target="_blank" rel="noopener noreferrer">Open</a>
                                            ) : "-"}
                                        </td>
                                        <td>
                                            {(p.code || []).length
                                                ? p.code.map((c, idx) => (
                                                    <React.Fragment key={c.url}>
                                                        <a href={c.url} target="_blank" rel="noopener noreferrer">
                                                            {c.label || "Repo"}
                                                        </a>
                                                        {idx < p.code.length - 1 ? " · " : ""}
                                                    </React.Fragment>
                                                ))
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ width: "100%", padding: 15, textAlign: "center", backgroundColor: "#0f1320", borderRadius: 6 }}>
                        No project found
                    </div>
                )}

            </div>
        </>
    );
};

export default Home;

