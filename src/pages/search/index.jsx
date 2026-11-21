import { useEffect, useMemo, useRef, useState } from "react";
import {
    FiArrowUpRight,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
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
const excludedRepositoryNames = new Set(["a2rp"]);

const getPaginationItems = (currentPage, totalPages) => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

    const pages = new Set([1, totalPages]);
    for (let page = Math.max(1, currentPage - 1); page <= Math.min(totalPages, currentPage + 1); page += 1) {
        pages.add(page);
    }

    const sortedPages = [...pages].sort((first, second) => first - second);
    return sortedPages.reduce((items, page, index) => {
        if (index > 0 && page - sortedPages[index - 1] > 1) items.push("ellipsis");
        items.push(page);
        return items;
    }, []);
};

const Search = () => {
    const [query, setQuery] = useState("");
    const [techStack, setTechStack] = useState("all");
    const [topicFilter, setTopicFilter] = useState("all");
    const [topicMenuOpen, setTopicMenuOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState("recent");
    const [pageSize, setPageSize] = useState(12);
    const [currentPage, setCurrentPage] = useState(1);
    const [failedScreenshots, setFailedScreenshots] = useState(() => new Set());
    const topicDropdownRef = useRef(null);
    const topicTriggerRef = useRef(null);
    const topicOptionRefs = useRef([]);
    const resultsSectionRef = useRef(null);
    const { repos: githubRepos, screenshots } = useGitHubPortfolio();

    const visibleGithubRepos = useMemo(
        () => githubRepos.filter((repo) => !excludedRepositoryNames.has(repo.name.toLowerCase())),
        [githubRepos],
    );

    const repositories = useMemo(() => {
        const repoNames = new Set();
        const liveRepositories = visibleGithubRepos.map((repo, index) => {
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
            .filter((project) => {
                const repoName = getProjectRepoName(project);
                return !excludedRepositoryNames.has(repoName) && !repoNames.has(repoName);
            })
            .map((project, index) => ({
                ...project,
                topics: [],
                repoName: getProjectRepoName(project),
                repo: null,
                category: projectCategoryByName.get(project.name),
                originalIndex: liveRepositories.length + index,
            }));

        return [...liveRepositories, ...featuredFallbacks];
    }, [visibleGithubRepos]);

    const topics = useMemo(() => {
        const counts = new Map();
        visibleGithubRepos.forEach((repo) => {
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
    }, [visibleGithubRepos]);

    const techStacks = useMemo(() => toUniqueList(
        repositories.flatMap((repository) => repository.tech || []),
    ).sort((first, second) => first.localeCompare(second)), [repositories]);

    const selectedTopicCount = topicFilter === "all"
        ? visibleGithubRepos.length
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

    const itemsPerPage = pageSize ?? Math.max(results.length, 1);
    const totalPages = Math.max(1, Math.ceil(results.length / itemsPerPage));
    const activePage = Math.min(currentPage, totalPages);
    const pageStart = results.length ? (activePage - 1) * itemsPerPage + 1 : 0;
    const pageEnd = Math.min(activePage * itemsPerPage, results.length);
    const paginatedResults = results.slice(pageStart - 1, pageEnd);
    const paginationItems = getPaginationItems(activePage, totalPages);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const goToPage = (page) => {
        setCurrentPage(page);
        resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const clearFilters = () => {
        setQuery("");
        setTechStack("all");
        setTopicFilter("all");
        setSortOrder("recent");
        setCurrentPage(1);
    };

    return (
        <div className={styles.wrapper} id="search">
            <header className={styles.pageIntro}>
                <div className={styles.introHeading}>
                    <h1><span aria-hidden="true" />Repositories</h1>
                    <span className={styles.introCount}>
                        {visibleGithubRepos.length.toLocaleString()} PUBLIC REPOSITORIES
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
                                            setCurrentPage(1);
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
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setCurrentPage(1);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                    setQuery("");
                                    setCurrentPage(1);
                                }
                            }}
                            placeholder="Search repositories, technologies, or keywords..."
                            aria-label="Search repositories, technologies, or keywords"
                        />
                        {query && (
                            <button
                                className={styles.clearSearch}
                                type="button"
                                onClick={() => {
                                    setQuery("");
                                    setCurrentPage(1);
                                }}
                                aria-label="Clear search"
                            >
                                <FiX aria-hidden="true" />
                            </button>
                        )}
                    </div>

                    <div className={styles.filterRow}>
                        <label className={styles.selectControl}>
                            <span><FiCode aria-hidden="true" /> Technology</span>
                            <select value={techStack} onChange={(event) => {
                                setTechStack(event.target.value);
                                setCurrentPage(1);
                            }}>
                                <option value="all">All technologies</option>
                                {techStacks.map((stack) => (
                                    <option key={stack} value={stack}>{stack}</option>
                                ))}
                            </select>
                        </label>

                        <label className={styles.selectControl}>
                            <span><FiFilter aria-hidden="true" /> Sort by</span>
                            <select value={sortOrder} onChange={(event) => {
                                setSortOrder(event.target.value);
                                setCurrentPage(1);
                            }}>
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

            <section
                className={styles.resultsSection}
                aria-labelledby="results-heading"
                ref={resultsSectionRef}
            >
                <div className={styles.resultsHeading}>
                    <div>
                        <h2 id="results-heading">Repositories</h2>
                        <p aria-live="polite">
                            {results.length
                                ? `Showing ${pageStart.toLocaleString()}–${pageEnd.toLocaleString()} of ${results.length.toLocaleString()} repositories`
                                : "0 repositories found"}
                        </p>
                    </div>
                    <span className={styles.resultsCount}>{results.length.toLocaleString()}</span>
                </div>

                {results.length ? (
                    <>
                    <div className={styles.resultsGrid}>
                        {paginatedResults.map((repository, index) => {
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
                                        <span>{String(pageStart + index).padStart(2, "0")}</span>
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
                    <nav className={styles.pagination} aria-label="Repository result pages">
                        <label className={styles.pageSizeControl}>
                            <span>Repositories per page</span>
                            <select
                                value={pageSize ?? "all"}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setPageSize(value === "all" ? null : Number(value));
                                    setCurrentPage(1);
                                }}
                                aria-label="Repositories per page"
                            >
                                <option value="12">12</option>
                                <option value="24">24</option>
                                <option value="48">48</option>
                                <option value="96">96</option>
                                <option value="all">All</option>
                            </select>
                        </label>
                        <span className={styles.pageIndicator}>
                            Page {activePage} of {totalPages}
                        </span>
                        <div className={styles.paginationControls}>
                                <button
                                    className={styles.pageStep}
                                    type="button"
                                    disabled={activePage === 1}
                                    onClick={() => goToPage(activePage - 1)}
                                    aria-label="Previous page"
                                >
                                    <FiChevronLeft aria-hidden="true" />
                                    <span>Previous</span>
                                </button>
                                <div className={styles.pageNumbers}>
                                    {paginationItems.map((page, index) => page === "ellipsis" ? (
                                        <span className={styles.pageEllipsis} key={`ellipsis-${index}`} aria-hidden="true">
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            className={activePage === page ? styles.pageActive : styles.pageButton}
                                            type="button"
                                            key={page}
                                            aria-label={`Page ${page}`}
                                            aria-current={activePage === page ? "page" : undefined}
                                            onClick={() => goToPage(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className={styles.pageStep}
                                    type="button"
                                    disabled={activePage === totalPages}
                                    onClick={() => goToPage(activePage + 1)}
                                    aria-label="Next page"
                                >
                                    <span>Next</span>
                                    <FiChevronRight aria-hidden="true" />
                                </button>
                        </div>
                    </nav>
                    </>
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
