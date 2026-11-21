import { useEffect, useMemo, useState } from "react";
import {
    FiArrowUpRight,
    FiCode,
    FiExternalLink,
    FiFilter,
    FiGithub,
    FiSearch,
    FiX,
} from "react-icons/fi";
import defaultProjectImage from "../../assets/default-project-hero.webp";
import {
    FALLBACK_PUBLIC_REPO_COUNT,
    fetchAndCachePublicRepoCount,
    readCachedPublicRepoCount,
} from "../../data/githubProfile";
import { projectCollections, projects } from "../../data/projects";
import {
    getProjectRepoName,
    readCachedProjectScreenshots,
    syncProjectScreenshots,
} from "../../data/repositoryScreenshots";
import styles from "./style.module.css";

const categories = [
    { id: "all", label: "All projects" },
    ...projectCollections.map(({ id, title }) => ({ id, label: title })),
];

const projectCategoryByName = new Map(
    projectCollections.flatMap((collection) =>
        collection.projects.map((projectName) => [projectName, collection]),
    ),
);

const techStacks = [...new Set(projects.flatMap((project) => project.tech || []))]
    .sort((first, second) => first.localeCompare(second));

const Search = () => {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("all");
    const [techStack, setTechStack] = useState("all");
    const [sortOrder, setSortOrder] = useState("recent");
    const [screenshots, setScreenshots] = useState(readCachedProjectScreenshots);
    const [failedScreenshots, setFailedScreenshots] = useState(() => new Set());
    const [publicRepoCount, setPublicRepoCount] = useState(
        () => readCachedPublicRepoCount() ?? FALLBACK_PUBLIC_REPO_COUNT,
    );

    useEffect(() => {
        const controller = new AbortController();

        fetchAndCachePublicRepoCount(controller.signal)
            .then((count) => {
                if (!controller.signal.aborted) setPublicRepoCount(count);
            })
            .catch(() => {
                // Keep the cached or supplied profile count when GitHub is unavailable.
            });

        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        syncProjectScreenshots(projects, controller.signal)
            .then((nextScreenshots) => {
                if (!controller.signal.aborted) setScreenshots(nextScreenshots);
            })
            .catch(() => {
                // Keep cached screenshots when GitHub is unavailable.
            });

        return () => controller.abort();
    }, []);

    const results = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return projects
            .map((project, index) => ({
                ...project,
                originalIndex: index,
                category: projectCategoryByName.get(project.name),
            }))
            .filter((project) => {
                const searchableContent = [
                    project.name,
                    project.desc,
                    ...(project.tech || []),
                    ...(project.code || []).map((source) => source.label),
                ].join(" ").toLowerCase();

                const matchesQuery = !normalizedQuery || searchableContent.includes(normalizedQuery);
                const matchesCategory = category === "all" || project.category?.id === category;
                const matchesTechStack = techStack === "all" || project.tech?.includes(techStack);

                return matchesQuery && matchesCategory && matchesTechStack;
            })
            .sort((first, second) => {
                if (sortOrder === "name-asc") return first.name.localeCompare(second.name);
                if (sortOrder === "name-desc") return second.name.localeCompare(first.name);
                return second.originalIndex - first.originalIndex;
            });
    }, [category, query, sortOrder, techStack]);

    const clearFilters = () => {
        setQuery("");
        setCategory("all");
        setTechStack("all");
        setSortOrder("recent");
    };

    return (
        <div className={styles.wrapper}>
            <header className={styles.pageIntro}>
                <div className={styles.introHeading}>
                    <h1><span aria-hidden="true" />Projects</h1>
                    <span className={styles.introCount}>
                        {publicRepoCount.toLocaleString()} PUBLIC REPOSITORIES
                    </span>
                </div>
                <p className={styles.introCopy}>
                    Explore {publicRepoCount.toLocaleString()} public repositories by Ashish Ranjan.
                    Search the featured portfolio projects below by name, description, or technology.
                </p>
            </header>

            <section className={styles.searchPanel} aria-label="Project search and filters">
                <div className={styles.searchBox}>
                    <FiSearch aria-hidden="true" />
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Escape") setQuery("");
                        }}
                        placeholder="Search projects, technologies, or keywords..."
                        aria-label="Search projects, technologies, or keywords"
                    />
                    {query && (
                        <button
                            className={styles.clearSearch}
                            type="button"
                            onClick={() => setQuery("")}
                            aria-label="Clear search"
                        >
                            <FiX aria-hidden="true" />
                        </button>
                    )}
                </div>

                <div className={styles.filterRow}>
                    <div className={styles.categoryFilters} role="group" aria-label="Project category">
                        {categories.map((item) => (
                            <button
                                className={category === item.id ? styles.categoryActive : styles.categoryButton}
                                key={item.id}
                                type="button"
                                aria-pressed={category === item.id}
                                onClick={() => setCategory(item.id)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <label className={styles.selectControl}>
                        <span><FiCode aria-hidden="true" /> Technology</span>
                        <select value={techStack} onChange={(event) => setTechStack(event.target.value)}>
                            <option value="all">All technologies</option>
                            {techStacks.map((stack) => (
                                <option key={stack} value={stack}>{stack}</option>
                            ))}
                        </select>
                    </label>

                    <label className={styles.selectControl}>
                        <span><FiFilter aria-hidden="true" /> Sort by</span>
                        <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                            <option value="recent">Recently added</option>
                            <option value="name-asc">Name: A to Z</option>
                            <option value="name-desc">Name: Z to A</option>
                        </select>
                    </label>

                    <button className={styles.resetButton} type="button" onClick={clearFilters}>
                        <FiX aria-hidden="true" /> Reset
                    </button>
                </div>
            </section>

            <section className={styles.resultsSection} aria-labelledby="results-heading">
                <div className={styles.resultsHeading}>
                    <div>
                        <h2 id="results-heading">Featured projects</h2>
                        <p aria-live="polite">
                            {results.length} featured {results.length === 1 ? "project" : "projects"} found
                        </p>
                    </div>
                    <span className={styles.resultsCount}>{String(results.length).padStart(2, "0")}</span>
                </div>

                {results.length ? (
                    <div className={styles.resultsGrid}>
                        {results.map((project, index) => {
                            const repository = project.code?.find((source) => source.url);
                            const repoName = getProjectRepoName(project);
                            const screenshotUrl = screenshots[repoName];
                            const imageUrl = screenshotUrl && !failedScreenshots.has(repoName)
                                ? screenshotUrl
                                : defaultProjectImage;

                            return (
                                <article className={styles.projectCard} key={project.name}>
                                    <img
                                        className={styles.projectBackdrop}
                                        src={imageUrl}
                                        alt=""
                                        aria-hidden="true"
                                        onError={() => {
                                            if (!screenshotUrl || failedScreenshots.has(repoName)) return;
                                            setFailedScreenshots((current) => new Set(current).add(repoName));
                                        }}
                                    />
                                    <div className={styles.cardMeta}>
                                        <span>{project.category?.title || "Project"}</span>
                                        <span>{String(index + 1).padStart(2, "0")}</span>
                                    </div>
                                    <h3>{project.name}</h3>
                                    <p className={styles.projectDescription}>{project.desc}</p>

                                    <div className={styles.techTags} aria-label="Technologies">
                                        {(project.tech || []).slice(0, 4).map((stack) => (
                                            <span key={stack}>{stack}</span>
                                        ))}
                                        {project.tech?.length > 4 && (
                                            <span className={styles.moreTag}>+{project.tech.length - 4}</span>
                                        )}
                                    </div>

                                    <div className={styles.cardActions}>
                                        {project.live && (
                                            <a className={styles.primaryAction} href={project.live} target="_blank" rel="noopener noreferrer">
                                                Live project <FiExternalLink aria-hidden="true" />
                                            </a>
                                        )}
                                        {repository && (
                                            <a className={styles.sourceAction} href={repository.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.name} source code`}>
                                                <FiGithub aria-hidden="true" /> Source <FiArrowUpRight aria-hidden="true" />
                                            </a>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}><FiSearch aria-hidden="true" /></span>
                        <h3>No matching projects</h3>
                        <p>Try another keyword or clear a filter to see more projects.</p>
                        <button className={styles.resetButton} type="button" onClick={clearFilters}>Clear all filters</button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Search;
