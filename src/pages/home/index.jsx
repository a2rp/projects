import React, { useEffect, useMemo, useState } from "react";
import heroImage from "../../assets/default-project-hero.webp";
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




const GITHUB_OWNER = "a2rp";
const REPO_CACHE_KEY = "projects-portfolio:github-repos:v1";
const SCREENSHOT_CACHE_TTL = 24 * 60 * 60 * 1000;
const defaultFeaturedProject = projects[projects.length - 1];

const getProjectRepoName = (project) => {
    const repoUrl = project.code?.find((item) => item.url)?.url || "";
    const match = repoUrl.match(/github\.com\/[^/]+\/([^/?#]+)/i);
    return match?.[1]?.replace(/\.git$/i, "").toLowerCase() || "";
};

const readCachedRepos = () => {
    if (typeof window === "undefined") return [];

    try {
        const cached = JSON.parse(window.localStorage.getItem(REPO_CACHE_KEY) || "null");
        const portfolioRepoNames = new Set(projects.map(getProjectRepoName).filter(Boolean));
        return Array.isArray(cached?.repos)
            ? cached.repos
                .filter((repo) => repo?.name && portfolioRepoNames.has(repo.name.toLowerCase()))
                .map((repo) => ({
                    ...repo,
                    topics: Array.isArray(repo.topics) ? repo.topics : [],
                    screenshotUrl: typeof repo.screenshotUrl === "string" ? repo.screenshotUrl : "",
                }))
            : [];
    } catch {
        return [];
    }
};

const getRepoTimestamp = (repo) => Date.parse(repo?.updatedAt || repo?.pushedAt || "") || 0;

const getRepositoryScreenshot = async (repo, signal) => {
    if (!repo?.defaultBranch) return "";

    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${repo.name}/git/trees/${encodeURIComponent(repo.defaultBranch)}?recursive=1`,
            { headers: { Accept: "application/vnd.github+json" }, signal },
        );
        if (!response.ok) return "";

        const tree = await response.json();
        const screenshot = (tree.tree || [])
            .filter((item) => {
                if (item.type !== "blob" || !/\.(png|jpe?g|webp|avif|gif)$/i.test(item.path)) return false;
                const path = item.path.toLowerCase();
                const isKnownPortfolioLogo = repo.name.toLowerCase() === "projects"
                    && /(^|\/)public\/preview\.png$/.test(path);
                if (isKnownPortfolioLogo || /logo|icon|favicon/.test(path)) return false;

                return /screenshot|screen-shot/.test(path)
                    || /(^|\/)screenshots?\//.test(path)
                    || /(^|[._/-])(preview|hero|banner|cover|og-image)([._/-]|$)/.test(path);
            })
            .sort((a, b) => {
                const score = (path) => (
                    (/screenshots?\//i.test(path) ? 4 : 0)
                    + (/screenshot|screen-shot/i.test(path) ? 3 : 0)
                    + (/preview|hero|banner|cover|og-image/i.test(path) ? 1 : 0)
                );
                return score(b.path) - score(a.path);
            })[0];

        if (!screenshot) return "";
        const encodedPath = screenshot.path.split("/").map(encodeURIComponent).join("/");
        return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${repo.name}/${encodeURIComponent(repo.defaultBranch)}/${encodedPath}`;
    } catch {
        return "";
    }
};

const fetchPortfolioRepos = async (signal, cachedRepos) => {
    const response = await fetch(
        `https://api.github.com/users/${GITHUB_OWNER}/repos?sort=updated&per_page=100`,
        { headers: { Accept: "application/vnd.github+json" }, signal },
    );
    if (!response.ok) throw new Error("Unable to load GitHub repositories");

    const githubRepos = await response.json();
    const portfolioRepoNames = new Set(projects.map(getProjectRepoName).filter(Boolean));
    const repos = githubRepos
        .filter((repo) => portfolioRepoNames.has(repo.name.toLowerCase()))
        .map((repo) => ({
            name: repo.name,
            pushedAt: repo.pushed_at,
            updatedAt: repo.updated_at,
            createdAt: repo.created_at,
            language: repo.language,
            topics: Array.isArray(repo.topics) ? repo.topics : [],
            defaultBranch: repo.default_branch,
        }));

    if (!repos.length) throw new Error("No portfolio repositories found");
    const latestRepo = [...repos].sort((a, b) => getRepoTimestamp(b) - getRepoTimestamp(a))[0];
    const screenshotCheckedFor = latestRepo.updatedAt || latestRepo.pushedAt || "";
    const cachedLatestRepo = cachedRepos.find(
        (repo) => repo.name.toLowerCase() === latestRepo.name.toLowerCase(),
    );
    const screenshotCheckedAt = Date.parse(cachedLatestRepo?.screenshotCheckedAt || "");
    const screenshotCheckIsFresh = Date.now() - screenshotCheckedAt < SCREENSHOT_CACHE_TTL;
    const cachedScreenshotIsCurrent = cachedLatestRepo?.defaultBranch === latestRepo.defaultBranch
        && cachedLatestRepo?.screenshotCheckedFor === screenshotCheckedFor
        && screenshotCheckIsFresh;
    const screenshotUrl = cachedScreenshotIsCurrent
        ? cachedLatestRepo.screenshotUrl
        : await getRepositoryScreenshot(latestRepo, signal);
    const nextScreenshotCheckedAt = cachedScreenshotIsCurrent
        ? cachedLatestRepo.screenshotCheckedAt
        : new Date().toISOString();

    return repos.map((repo) => ({
        ...repo,
        screenshotUrl: repo.name === latestRepo.name ? screenshotUrl : "",
        screenshotCheckedFor: repo.name === latestRepo.name ? screenshotCheckedFor : "",
        screenshotCheckedAt: repo.name === latestRepo.name ? nextScreenshotCheckedAt : "",
    }));
};

const formatRepoDate = (value) => {
    if (!value || !Number.isFinite(Date.parse(value))) return "Not synced";
    return new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
};

const Home = () => {
    const [q, setQ] = useState("");
    const [repoUpdates, setRepoUpdates] = useState(readCachedRepos);
    const [failedScreenshot, setFailedScreenshot] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const syncRepos = async () => {
            try {
                const repos = await fetchPortfolioRepos(controller.signal, readCachedRepos());
                if (controller.signal.aborted) return;

                setRepoUpdates(repos);
                try {
                    window.localStorage.setItem(
                        REPO_CACHE_KEY,
                        JSON.stringify({ fetchedAt: new Date().toISOString(), repos }),
                    );
                } catch {
                    // Keep the live GitHub data available even if storage is disabled.
                }
            } catch {
                // Cached repository metadata keeps the hero useful while offline.
            }
        };

        syncRepos();
        const handleOnline = () => {
            setFailedScreenshot("");
            syncRepos();
        };
        window.addEventListener("online", handleOnline);
        return () => {
            controller.abort();
            window.removeEventListener("online", handleOnline);
        };
    }, []);

    const latestRepo = useMemo(
        () => [...repoUpdates].sort((a, b) => getRepoTimestamp(b) - getRepoTimestamp(a))[0] || null,
        [repoUpdates],
    );
    const featuredProject = useMemo(
        () => projects.find((project) => getProjectRepoName(project) === latestRepo?.name.toLowerCase()) || defaultFeaturedProject,
        [latestRepo],
    );
    const heroScreenshot = latestRepo?.screenshotUrl;
    const visibleHeroImage = heroScreenshot && failedScreenshot !== heroScreenshot
        ? heroScreenshot
        : heroImage;
    const updatedDate = formatRepoDate(latestRepo?.updatedAt || latestRepo?.pushedAt);

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
                <section className={styles.hero} aria-labelledby="featured-project-title">
                    <img
                        className={styles.heroImage}
                        src={visibleHeroImage}
                        alt=""
                        aria-hidden="true"
                        onError={() => heroScreenshot && setFailedScreenshot(heroScreenshot)}
                    />
                    <div className={styles.heroContent}>
                        <p className={styles.heroEyebrow}>
                            <span className={styles.eyebrowLine} />
                            <span>Latest updated repository</span>
                            <span className={styles.eyebrowDivider}>|</span>
                            <span>{latestRepo ? `Updated ${updatedDate}` : "Portfolio project"}</span>
                        </p>
                        <h1 className={styles.heroTitle} id="featured-project-title">
                            {featuredProject.name}
                        </h1>
                        <p className={styles.heroTagline}>
                            {latestRepo?.language || featuredProject.tech[0]} project, recently updated.
                        </p>
                        <p className={styles.heroDescription}>{featuredProject.desc}</p>

                        <div className={styles.heroFacts} aria-label="Project highlights" role="list">
                            {latestRepo ? (
                                <>
                                    <div className={styles.heroFact} role="listitem">
                                        <strong>{updatedDate}</strong>
                                        <span>Repository updated</span>
                                    </div>
                                    <div className={styles.heroFact} role="listitem">
                                        <strong>{latestRepo.language || "Multi-stack"}</strong>
                                        <span>Primary language</span>
                                    </div>
                                    <div className={styles.heroFact} role="listitem">
                                        <strong>{formatRepoDate(latestRepo.createdAt)}</strong>
                                        <span>Repository created</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={styles.heroFact} role="listitem">
                                        <strong>Live</strong>
                                        <span>Project demo</span>
                                    </div>
                                    <div className={styles.heroFact} role="listitem">
                                        <strong>Open source</strong>
                                        <span>GitHub repository</span>
                                    </div>
                                    <div className={styles.heroFact} role="listitem">
                                        <strong>{featuredProject.tech[0]}</strong>
                                        <span>Primary stack</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {latestRepo?.topics?.length > 0 && (
                            <div className={styles.heroHighlights} aria-label="Repository topics" role="list">
                                {latestRepo.topics.slice(0, 5).map((topic) => (
                                    <span role="listitem" key={topic}>{topic}</span>
                                ))}
                            </div>
                        )}

                        <div className={styles.heroActions}>
                            <a
                                className={styles.primaryAction}
                                href={featuredProject.live}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open live project <span aria-hidden="true">&rarr;</span>
                            </a>
                            <a
                                className={styles.secondaryAction}
                                href={featuredProject.code[0].url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View source code
                            </a>
                        </div>

                        <div className={styles.heroTech} role="group" aria-label="Project technology stack">
                            <span className={styles.heroTechLabel}>Built with</span>
                            {featuredProject.tech.map((tech) => (
                                <span className={styles.heroTechTag} key={tech}>
                                    {tech}
                                </span>
                            ))}
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

