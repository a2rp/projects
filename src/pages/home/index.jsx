import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import heroImage from "../../assets/default-project-hero.webp";
import {
    GITHUB_OWNER,
    getProjectRepoName,
    getRepoTimestamp,
} from "../../data/githubPortfolio";
import { projects } from "../../data/projects";
import useGitHubPortfolio from "../../hooks/useGitHubPortfolio";
import AboutContact from "../../components/aboutContact";
import Search from "../search";
import styles from "./style.module.css";
const HERO_EXCLUDED_REPOS = new Set(["a2rp", "projects"]);
const defaultFeaturedProject = projects[projects.length - 1];

const isEligibleHeroRepo = (repo) => !HERO_EXCLUDED_REPOS.has(repo?.name?.toLowerCase());

const formatRepoDate = (value) => {
    if (!value || !Number.isFinite(Date.parse(value))) return "Not synced";
    return new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
};

const Home = () => {
    const [failedScreenshot, setFailedScreenshot] = useState("");
    const location = useLocation();
    const {
        repos: repoUpdates,
        screenshots,
        isFetching,
        refreshError,
        refreshNow,
    } = useGitHubPortfolio();

    const latestRepo = useMemo(
        () => repoUpdates
            .filter(isEligibleHeroRepo)
            .sort((a, b) => getRepoTimestamp(b) - getRepoTimestamp(a))[0] || null,
        [repoUpdates],
    );
    const featuredProject = useMemo(
        () => {
            const listedProject = projects.find(
                (project) => getProjectRepoName(project) === latestRepo?.name.toLowerCase(),
            );
            if (listedProject) return listedProject;
            if (!latestRepo) return defaultFeaturedProject;

            const tech = [...new Set([latestRepo.language, ...latestRepo.topics].filter(Boolean))].slice(0, 5);
            return {
                name: latestRepo.name,
                desc: latestRepo.description || "A recently updated project from my GitHub profile.",
                tech: tech.length ? tech : ["Open source"],
                live: latestRepo.homepage || latestRepo.htmlUrl || `https://github.com/${GITHUB_OWNER}/${latestRepo.name}`,
                code: [{ label: "Repo", url: latestRepo.htmlUrl || `https://github.com/${GITHUB_OWNER}/${latestRepo.name}` }],
            };
        },
        [latestRepo],
    );
    const heroScreenshot = latestRepo ? screenshots[latestRepo.name.toLowerCase()] : "";
    const visibleHeroImage = heroScreenshot && failedScreenshot !== heroScreenshot
        ? heroScreenshot
        : heroImage;
    const updatedDate = formatRepoDate(latestRepo?.pushedAt || latestRepo?.updatedAt);

    useEffect(() => {
        if (location.hash !== "#search") return;

        window.requestAnimationFrame(() => {
            document.getElementById("search")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }, [location.hash]);

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
                                        <strong>{formatRepoDate(latestRepo.createdAt)}</strong>
                                        <span>Repository created</span>
                                    </div>
                                    <div className={styles.heroFact} role="listitem">
                                        <strong>{updatedDate}</strong>
                                        <span>Repository updated</span>
                                    </div>
                                    <div className={styles.heroFact} role="listitem">
                                        <strong>{latestRepo.language || "Multi-stack"}</strong>
                                        <span>Primary language</span>
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
                            <button
                                className={styles.refreshAction}
                                type="button"
                                onClick={refreshNow}
                                disabled={isFetching}
                                aria-busy={isFetching}
                                aria-label={isFetching ? "Fetching GitHub projects" : "Refresh GitHub projects"}
                            >
                                {isFetching ? (
                                    <span className={styles.refreshSpinner} aria-hidden="true" />
                                ) : (
                                    <FiRefreshCw aria-hidden="true" />
                                )}
                                <span>{isFetching ? "Fetching…" : "Refresh GitHub data"}</span>
                            </button>
                        </div>
                        {refreshError && <p className={styles.refreshError} role="status">{refreshError}</p>}

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

                <Search />
                <AboutContact />
            </div>
        </>
    );
};

export default Home;

