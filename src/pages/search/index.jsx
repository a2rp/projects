import { useEffect, useMemo, useRef, useState } from "react";
import {
    FiArrowUpRight,
    FiChevronDown,
    FiCode,
    FiExternalLink,
    FiFilter,
    FiGithub,
    FiSearch,
    FiX,
} from "react-icons/fi";
import defaultProjectImage from "../../assets/default-project-hero.webp";
import { projectCollections, projects } from "../../data/projects";
import {
    getProjectRepoName,
    getRepoTimestamp,
} from "../../data/githubPortfolio";
import useGitHubPortfolio from "../../hooks/useGitHubPortfolio";
import styles from "./style.module.css";

const projectCategoryByName = new Map(
    projectCollections.flatMap((collection) =>
        collection.projects.map((projectName) => [projectName, collection]),
    ),
);

const featuredProjectByRepoName = new Map(
    projects.map((project) => [getProjectRepoName(project), project]),
);

const toUniqueList = (values) => [...new Set(values.filter(Boolean))];

const Search = () => {
    const [query, setQuery] = useState("");
    const [techStack, setTechStack] = useState("all");
    const [topicFilter, setTopicFilter] = useState("all");
    const [topicMenuOpen, setTopicMenuOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState("recent");
    const [failedScreenshots, setFailedScreenshots] = useState(() => new Set());
    const topicDropdownRef = useRef(null);
    const topicTriggerRef = useRef(null);
    const topicOptionRefs = useRef([]);
    const { repos: githubRepos, screenshots, publicRepoCount } = useGitHubPortfolio();

    const repositories = useMemo(() => {
        const repoNames = new Set();
        const liveRepositories = githubRepos.map((repo, index) => {
            const repoName = repo.name.toLowerCase();
            const featured = featuredProjectByRepoName.get(repoName);
            repoNames.add(repoName);

            return {
                name: featured?.name || repo.name,
                desc: featured?.desc || repo.description || "Public repository by Ashish Ranjan.",
                tech: toUniqueList([repo.language, ...(featured?.tech || [])]),
                topics: toUniqueList(repo.topics || []).map((topic) => topic.toLowerCase()),
                live: repo.homepage || featured?.live || "",
                code: [{ label: "Repo", url: repo.htmlUrl }],
                repoName,
                repo,
                category: featured ? projectCategoryByName.get(featured.name) : undefined,
                originalIndex: index,
            };
        });

        const featuredFallbacks = projects
            .filter((project) => !repoNames.has(getProjectRepoName(project)))
            .map((project, index) => ({
                ...project,
                topics: [],
                repoName: getProjectRepoName(project),
                repo: null,
                category: projectCategoryByName.get(project.name),
                originalIndex: liveRepositories.length + index,
            }));

        return [...liveRepositories, ...featuredFallbacks];
    }, [githubRepos]);

    const topics = useMemo(() => {
        const counts = new Map();
        githubRepos.forEach((repo) => {
            const seenTopics = new Set();
            (repo.topics || []).forEach((topic) => {
                const normalizedTopic = topic.toLowerCase();
                if (seenTopics.has(normalizedTopic)) return;
                seenTopics.add(normalizedTopic);

                const current = counts.get(normalizedTopic);
                if (current) {
                    current.count += 1;
                } else {
                    counts.set(normalizedTopic, { topic: normalizedTopic, label: topic, count: 1 });
                }
            });
        });

        return [...counts.values()]
            .sort((first, second) => first.label.localeCompare(second.label));
    }, [githubRepos]);

    const techStacks = useMemo(() => toUniqueList(
        repositories.flatMap((repository) => repository.tech || []),
    ).sort((first, second) => first.localeCompare(second)), [repositories]);

    const selectedTopicCount = topicFilter === "all"
        ? publicRepoCount
        : topics.find(({ topic }) => topic === topicFilter)?.count || 0;
    const topicOptions = [{ topic: "all", label: "All topics" }, ...topics];
    const selectedTopicIndex = Math.max(0, topicOptions.findIndex(({ topic }) => topic === topicFilter));
    const selectedTopic = topicOptions[selectedTopicIndex];

    useEffect(() => {
        if (!topicMenuOpen) return undefined;

        topicOptionRefs.current[selectedTopicIndex]?.focus();

        const closeOnOutsidePointer = (event) => {
            if (!topicDropdownRef.current?.contains(event.target)) setTopicMenuOpen(false);
        };
        const closeOnEscape = (event) => {
            if (event.key !== "Escape") return;
            setTopicMenuOpen(false);
            topicTriggerRef.current?.focus();
        };

        document.addEventListener("pointerdown", closeOnOutsidePointer);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsidePointer);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [selectedTopicIndex, topicMenuOpen]);

    const handleTopicOptionKeyDown = (event, optionIndex) => {
        let nextIndex = optionIndex;
        if (event.key === "ArrowDown") nextIndex = Math.min(optionIndex + 1, topicOptions.length - 1);
        else if (event.key === "ArrowUp") nextIndex = Math.max(optionIndex - 1, 0);
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = topicOptions.length - 1;
        else return;

        event.preventDefault();
        topicOptionRefs.current[nextIndex]?.focus();
    };

    const results = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return repositories
            .filter((repository) => {
                const searchableContent = [
                    repository.name,
                    repository.desc,
                    ...(repository.tech || []),
                    ...(repository.topics || []),
                    ...(repository.code || []).map((source) => source.label),
                ].join(" ").toLowerCase();

                const matchesQuery = !normalizedQuery || searchableContent.includes(normalizedQuery);
                const matchesTechStack = techStack === "all" || repository.tech?.includes(techStack);
                const matchesTopic = topicFilter === "all" || repository.topics?.includes(topicFilter);

                return matchesQuery && matchesTechStack && matchesTopic;
            })
            .sort((first, second) => {
                if (sortOrder === "name-asc") return first.name.localeCompare(second.name);
                if (sortOrder === "name-desc") return second.name.localeCompare(first.name);
                return getRepoTimestamp(second.repo) - getRepoTimestamp(first.repo)
                    || first.originalIndex - second.originalIndex;
            });
    }, [query, repositories, sortOrder, techStack, topicFilter]);

    const clearFilters = () => {
        setQuery("");
        setTechStack("all");
        setTopicFilter("all");
        setSortOrder("recent");
    };

    return (
        <div className={styles.wrapper}>
            <header className={styles.pageIntro}>
                <div className={styles.introHeading}>
                    <h1><span aria-hidden="true" />Repositories</h1>
                    <span className={styles.introCount}>
                        {publicRepoCount.toLocaleString()} PUBLIC REPOSITORIES
                    </span>
                </div>
                <p className={styles.introCopy}>
                    Browse public repositories by topic, name, description, or technology.
                </p>
            </header>

            <section className={styles.topicSection} aria-label="Filter by repository topic">
                <div className={styles.topicLabel}>
                    <span id="topic-filter-label">Filter by topic</span>
                    <small>{topics.length} repository topics</small>
                </div>
                <div className={styles.topicSelectControl}>
                    <div
                        className={styles.topicDropdown}
                        ref={topicDropdownRef}
                        onBlur={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) setTopicMenuOpen(false);
                        }}
                    >
                        <button
                            className={styles.topicTrigger}
                            type="button"
                            ref={topicTriggerRef}
                            aria-haspopup="listbox"
                            aria-expanded={topicMenuOpen}
                            aria-controls="repository-topic-options"
                            aria-label={`Filter by topic: ${selectedTopic.label}`}
                            onClick={() => setTopicMenuOpen((open) => !open)}
                            onKeyDown={(event) => {
                                if (event.key === "ArrowDown") {
                                    event.preventDefault();
                                    setTopicMenuOpen(true);
                                }
                            }}
                        >
                            <span>{selectedTopic.label}</span>
                            <FiChevronDown aria-hidden="true" />
                        </button>
                        {topicMenuOpen && (
                            <div
                                className={styles.topicOptions}
                                id="repository-topic-options"
                                role="listbox"
                                aria-label="Repository topics"
                            >
                                {topicOptions.map(({ topic, label, count }, index) => (
                                    <button
                                        className={styles.topicOption}
                                        key={topic}
                                        type="button"
                                        role="option"
                                        aria-selected={topicFilter === topic}
                                        tabIndex={-1}
                                        ref={(element) => {
                                            topicOptionRefs.current[index] = element;
                                        }}
                                        onClick={() => {
                                            setTopicFilter(topic);
                                            setTopicMenuOpen(false);
                                            topicTriggerRef.current?.focus();
                                        }}
                                        onKeyDown={(event) => handleTopicOptionKeyDown(event, index)}
                                    >
                                        <span>{label}</span>
                                        {count != null && (
                                            <span className={styles.topicOptionCount}>
                                                {count.toLocaleString()}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <span className={styles.topicSelectedCount} aria-live="polite">
                        {selectedTopicCount.toLocaleString()} {selectedTopicCount === 1 ? "repo" : "repos"}
                    </span>
                </div>
            </section>

            <section className={styles.searchPanel} aria-label="Repository search and filters">
                <div className={styles.searchControls}>
                    <div className={styles.searchBox}>
                        <FiSearch aria-hidden="true" />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Escape") setQuery("");
                            }}
                            placeholder="Search repositories, technologies, or keywords..."
                            aria-label="Search repositories, technologies, or keywords"
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
                                <option value="recent">Recently updated</option>
                                <option value="name-asc">Name: A to Z</option>
                                <option value="name-desc">Name: Z to A</option>
                            </select>
                        </label>

                        <button className={styles.resetButton} type="button" onClick={clearFilters}>
                            <FiX aria-hidden="true" /> Reset
                        </button>
                    </div>
                </div>
            </section>

            <section className={styles.resultsSection} aria-labelledby="results-heading">
                <div className={styles.resultsHeading}>
                    <div>
                        <h2 id="results-heading">Repositories</h2>
                        <p aria-live="polite">
                            {results.length.toLocaleString()} {results.length === 1 ? "repository" : "repositories"} found
                        </p>
                    </div>
                    <span className={styles.resultsCount}>{results.length.toLocaleString()}</span>
                </div>

                {results.length ? (
                    <div className={styles.resultsGrid}>
                        {results.map((repository, index) => {
                            const source = repository.code?.find((item) => item.url);
                            const repoName = repository.repoName || getProjectRepoName(repository);
                            const screenshotUrl = screenshots[repoName];
                            const imageUrl = screenshotUrl && !failedScreenshots.has(repoName)
                                ? screenshotUrl
                                : defaultProjectImage;

                            return (
                                <article className={styles.projectCard} key={repoName || repository.name}>
                                    <img
                                        className={styles.projectBackdrop}
                                        src={imageUrl}
                                        alt=""
                                        aria-hidden="true"
                                        loading="lazy"
                                        onError={() => {
                                            if (!screenshotUrl || failedScreenshots.has(repoName)) return;
                                            setFailedScreenshots((current) => new Set(current).add(repoName));
                                        }}
                                    />
                                    <div className={styles.cardMeta}>
                                        <span>{repository.category?.title || "Public repository"}</span>
                                        <span>{String(index + 1).padStart(2, "0")}</span>
                                    </div>
                                    <h3>{repository.name}</h3>
                                    <p className={styles.projectDescription}>{repository.desc}</p>

                                    <div className={styles.techTags} aria-label="Technologies">
                                        {(repository.tech || []).slice(0, 4).map((stack) => (
                                            <span key={stack}>{stack}</span>
                                        ))}
                                        {repository.tech?.length > 4 && (
                                            <span className={styles.moreTag}>+{repository.tech.length - 4}</span>
                                        )}
                                    </div>

                                    <div className={styles.cardActions}>
                                        {repository.live && (
                                            <a className={styles.primaryAction} href={repository.live} target="_blank" rel="noopener noreferrer">
                                                Live project <FiExternalLink aria-hidden="true" />
                                            </a>
                                        )}
                                        {source && (
                                            <a className={styles.sourceAction} href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${repository.name} source code`}>
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
                        <h3>No matching repositories</h3>
                        <p>Try another keyword or clear a filter to see more repositories.</p>
                        <button className={styles.resetButton} type="button" onClick={clearFilters}>Clear all filters</button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Search;
