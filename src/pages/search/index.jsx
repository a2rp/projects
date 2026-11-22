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
const TECH_STACK_OPTIONS = [
    "MERN",
    "MongoDB",
    "Express.js",
    "ReactJS",
    "Node.js",
    "JavaScript",
    "Angular",
    "HTML",
    "CSS",
    "SCSS",
    "Material UI",
    "Chakra UI",
    "GSAP",
    "Framer Motion",
    "DataTables",
    "Nest.js",
    "Java",
    "Spring Boot",
    "PHP",
    "Laravel",
    "CodeIgniter",
    "ASP.NET",
    "PostgreSQL",
    "Microsoft SQL Server",
    "Oracle",
    "Apache Derby",
    "AWS",
    "Linux",
    "Android",
    "Docker",
    "FileZilla",
    "C",
    "C++",
];
const normalizeTechnology = (value) => value.toLowerCase().replace(/[^a-z0-9+#]/g, "");
const technologyAliases = {
    "expressjs": ["expressjs", "express"],
    "reactjs": ["reactjs", "react"],
    "nodejs": ["nodejs", "node"],
    "nestjs": ["nestjs", "nest"],
    "microsoftsqlserver": ["microsoftsqlserver", "sqlserver", "mssqlserver", "mssql"],
};
const getTechnologyTerms = (technology) => {
    const normalized = normalizeTechnology(technology);
    return technologyAliases[normalized] || [normalized];
};
const formatRepositoryDate = (value) => {
    if (!value || !Number.isFinite(Date.parse(value))) return "Not available";
    return new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
};

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
    const [techMenuOpen, setTechMenuOpen] = useState(false);
    const [topicFilter, setTopicFilter] = useState("all");
    const [topicMenuOpen, setTopicMenuOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState("recent");
    const [pageSize, setPageSize] = useState(12);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRepositoryName, setSelectedRepositoryName] = useState("");
    const [failedScreenshots, setFailedScreenshots] = useState(() => new Set());
    const techDropdownRef = useRef(null);
    const techTriggerRef = useRef(null);
    const techOptionRefs = useRef([]);
    const topicDropdownRef = useRef(null);
    const topicTriggerRef = useRef(null);
    const topicOptionRefs = useRef([]);
    const resultsSectionRef = useRef(null);
    const modalRef = useRef(null);
    const modalCloseButtonRef = useRef(null);
    const repositoryCardRefs = useRef(new Map());
    const selectedIndexRef = useRef(-1);
    const resultsRef = useRef([]);
    const selectedRepositoryNameRef = useRef("");
    const modalWasOpenedRef = useRef(false);
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

    const techStacks = useMemo(() => {
        const repositoryStacks = toUniqueList(
            repositories.flatMap((repository) => repository.tech || []),
        );
        const additionalStacks = repositoryStacks
            .filter((stack) => !TECH_STACK_OPTIONS.some((technology) => (
                getTechnologyTerms(technology).includes(normalizeTechnology(stack))
            )))
            .sort((first, second) => first.localeCompare(second));

        return [...TECH_STACK_OPTIONS, ...additionalStacks];
    }, [repositories]);
    const techOptions = [
        { value: "all", label: "All technologies" },
        ...techStacks.map((stack) => ({ value: stack, label: stack })),
    ];
    const selectedTechIndex = Math.max(0, techOptions.findIndex(({ value }) => value === techStack));
    const selectedTech = techOptions[selectedTechIndex];

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

    useEffect(() => {
        if (!techMenuOpen) return undefined;

        techOptionRefs.current[selectedTechIndex]?.focus();

        const closeOnOutsidePointer = (event) => {
            if (!techDropdownRef.current?.contains(event.target)) setTechMenuOpen(false);
        };
        const closeOnEscape = (event) => {
            if (event.key !== "Escape") return;
            setTechMenuOpen(false);
            techTriggerRef.current?.focus();
        };

        document.addEventListener("pointerdown", closeOnOutsidePointer);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsidePointer);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [selectedTechIndex, techMenuOpen]);

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

    const handleTechOptionKeyDown = (event, optionIndex) => {
        let nextIndex = optionIndex;
        if (event.key === "ArrowDown") nextIndex = Math.min(optionIndex + 1, techOptions.length - 1);
        else if (event.key === "ArrowUp") nextIndex = Math.max(optionIndex - 1, 0);
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = techOptions.length - 1;
        else return;

        event.preventDefault();
        techOptionRefs.current[nextIndex]?.focus();
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
                const normalizedRepositoryTech = (repository.tech || []).map(normalizeTechnology);
                const technologyTerms = getTechnologyTerms(techStack);
                const matchesTechStack = techStack === "all"
                    || technologyTerms.some((term) => normalizedRepositoryTech.includes(term))
                    || (techStack === "MERN" && normalizeTechnology(repository.desc || "").includes("mern"));
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
    const selectedRepositoryIndex = results.findIndex((repository) => (
        (repository.repoName || getProjectRepoName(repository)) === selectedRepositoryName
    ));
    const selectedRepository = selectedRepositoryIndex >= 0 ? results[selectedRepositoryIndex] : null;
    const isModalOpen = Boolean(selectedRepositoryName);

    const selectRepositoryAtIndex = (index) => {
        const repository = results[index];
        if (!repository) return;

        setSelectedRepositoryName(repository.repoName || getProjectRepoName(repository));
        setCurrentPage(Math.floor(index / itemsPerPage) + 1);
    };

    const closeRepositoryDetails = () => {
        const repositoryName = selectedRepositoryNameRef.current;
        modalWasOpenedRef.current = false;
        setSelectedRepositoryName("");
        window.requestAnimationFrame(() => repositoryCardRefs.current.get(repositoryName)?.focus());
    };

    const moveRepositoryDetails = (offset) => {
        selectRepositoryAtIndex(selectedRepositoryIndex + offset);
    };

    useEffect(() => {
        selectedIndexRef.current = selectedRepositoryIndex;
        resultsRef.current = results;
        selectedRepositoryNameRef.current = selectedRepositoryName;
    }, [results, selectedRepositoryIndex, selectedRepositoryName]);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    useEffect(() => {
        if (selectedRepositoryName && selectedRepositoryIndex < 0) {
            modalWasOpenedRef.current = false;
            setSelectedRepositoryName("");
        }
    }, [selectedRepositoryIndex, selectedRepositoryName]);

    useEffect(() => {
        if (!isModalOpen) return undefined;

        const pageScrollArea = document.getElementById("page-scroll-area");
        const previousOverflowY = pageScrollArea?.style.overflowY;
        if (pageScrollArea) pageScrollArea.style.overflowY = "hidden";
        if (!modalWasOpenedRef.current) modalCloseButtonRef.current?.focus();
        modalWasOpenedRef.current = true;

        const handleModalKeys = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                closeRepositoryDetails();
                return;
            }

            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                const offset = event.key === "ArrowLeft" ? -1 : 1;
                const index = selectedIndexRef.current + offset;
                const repository = resultsRef.current[index];
                if (repository) {
                    setSelectedRepositoryName(repository.repoName || getProjectRepoName(repository));
                    setCurrentPage(Math.floor(index / itemsPerPage) + 1);
                }
                return;
            }

            if (event.key === "Tab") {
                const focusable = modalRef.current?.querySelectorAll(
                    'button:not(:disabled), a[href]',
                );
                if (!focusable?.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener("keydown", handleModalKeys);
        return () => {
            document.removeEventListener("keydown", handleModalKeys);
            if (pageScrollArea) pageScrollArea.style.overflowY = previousOverflowY || "auto";
        };
    }, [isModalOpen]);

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

    const selectedRepositoryNameForDisplay = selectedRepository?.repoName
        || (selectedRepository && getProjectRepoName(selectedRepository));
    const selectedRepositoryScreenshot = selectedRepositoryNameForDisplay
        ? screenshots[selectedRepositoryNameForDisplay]
        : "";
    const selectedRepositoryImage = selectedRepositoryScreenshot
        && !failedScreenshots.has(selectedRepositoryNameForDisplay)
        ? selectedRepositoryScreenshot
        : defaultProjectImage;
    const selectedRepositorySource = selectedRepository?.code?.find((item) => item.url);
    const selectedRepositoryTopics = selectedRepository
        ? toUniqueList([...(selectedRepository.topics || []), ...(selectedRepository.tech || [])])
        : [];

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
                        <div className={styles.selectControl}>
                            <span><FiCode aria-hidden="true" /> Technology</span>
                            <div
                                className={styles.techDropdown}
                                ref={techDropdownRef}
                                onBlur={(event) => {
                                    if (!event.currentTarget.contains(event.relatedTarget)) setTechMenuOpen(false);
                                }}
                            >
                                <button
                                    className={styles.techTrigger}
                                    type="button"
                                    ref={techTriggerRef}
                                    aria-haspopup="listbox"
                                    aria-expanded={techMenuOpen}
                                    aria-controls="repository-technology-options"
                                    aria-label={`Filter by technology: ${selectedTech.label}`}
                                    onClick={() => setTechMenuOpen((open) => !open)}
                                    onKeyDown={(event) => {
                                        if (event.key === "ArrowDown") {
                                            event.preventDefault();
                                            setTechMenuOpen(true);
                                        }
                                    }}
                                >
                                    <span>{selectedTech.label}</span>
                                    <FiChevronDown aria-hidden="true" />
                                </button>
                                {techMenuOpen && (
                                    <div
                                        className={styles.techOptions}
                                        id="repository-technology-options"
                                        role="listbox"
                                        aria-label="Repository technologies"
                                    >
                                        {techOptions.map(({ value, label }, index) => (
                                            <button
                                                className={styles.techOption}
                                                key={value}
                                                type="button"
                                                role="option"
                                                aria-selected={techStack === value}
                                                tabIndex={-1}
                                                ref={(element) => {
                                                    techOptionRefs.current[index] = element;
                                                }}
                                                onClick={() => {
                                                    setTechStack(value);
                                                    setCurrentPage(1);
                                                    setTechMenuOpen(false);
                                                    techTriggerRef.current?.focus();
                                                }}
                                                onKeyDown={(event) => handleTechOptionKeyDown(event, index)}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

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
                            const repoName = repository.repoName || getProjectRepoName(repository);
                            const sourceUrl = repository.code?.find((item) => item.url)?.url || "";
                            const exactRepositoryName = repository.repo?.name
                                || sourceUrl.match(/github\.com\/[^/]+\/([^/?#]+)/i)?.[1]?.replace(/\.git$/i, "")
                                || repository.name;
                            const screenshotUrl = screenshots[repoName];
                            const imageUrl = screenshotUrl && !failedScreenshots.has(repoName)
                                ? screenshotUrl
                                : defaultProjectImage;

                            return (
                                <article
                                    className={styles.projectCard}
                                    tabIndex={0}
                                    key={repoName || repository.name}
                                    ref={(element) => {
                                        if (element) repositoryCardRefs.current.set(repoName, element);
                                        else repositoryCardRefs.current.delete(repoName);
                                    }}
                                    aria-label={`${exactRepositoryName} repository`}
                                    onClick={(event) => {
                                        if (event.target.closest("a, button")) return;
                                        setSelectedRepositoryName(repoName);
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.target !== event.currentTarget) return;
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            setSelectedRepositoryName(repoName);
                                        }
                                    }}
                                >
                                    <span className={styles.projectPoster}>
                                        <img
                                            className={styles.projectPosterImage}
                                            src={imageUrl}
                                            alt=""
                                            aria-hidden="true"
                                            loading="lazy"
                                            onError={() => {
                                                if (!screenshotUrl || failedScreenshots.has(repoName)) return;
                                                setFailedScreenshots((current) => new Set(current).add(repoName));
                                            }}
                                        />
                                        <span className={styles.posterIndex}>
                                            {String(pageStart + index).padStart(2, "0")}
                                        </span>
                                    </span>
                                    <span className={styles.cardInfo}>
                                        <button
                                            className={styles.projectName}
                                            type="button"
                                            onClick={() => setSelectedRepositoryName(repoName)}
                                            title={exactRepositoryName}
                                        >
                                            {exactRepositoryName}
                                        </button>
                                        <span className={styles.projectDescription} title={repository.desc}>
                                            {repository.desc}
                                        </span>
                                        <span className={styles.repoDates}>
                                            <span className={styles.repoDate}>
                                                <span className={styles.repoDateLabel}>Created</span>
                                                <time
                                                    className={styles.repoDateValue}
                                                    dateTime={repository.repo?.createdAt || undefined}
                                                >
                                                    {formatRepositoryDate(repository.repo?.createdAt)}
                                                </time>
                                            </span>
                                            <span className={styles.repoDate}>
                                                <span className={styles.repoDateLabel}>Updated</span>
                                                <time
                                                    className={styles.repoDateValue}
                                                    dateTime={repository.repo?.updatedAt || repository.repo?.pushedAt || undefined}
                                                >
                                                    {formatRepositoryDate(repository.repo?.updatedAt || repository.repo?.pushedAt)}
                                                </time>
                                            </span>
                                        </span>
                                        <span className={styles.cardLinks}>
                                            {sourceUrl && (
                                                <a
                                                    href={sourceUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(event) => event.stopPropagation()}
                                                >
                                                    <FiGithub aria-hidden="true" /> Repo <FiArrowUpRight aria-hidden="true" />
                                                </a>
                                            )}
                                            {repository.live && (
                                                <a
                                                    href={repository.live}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(event) => event.stopPropagation()}
                                                >
                                                    <FiExternalLink aria-hidden="true" /> Live
                                                </a>
                                            )}
                                        </span>
                                    </span>
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

            {selectedRepository && (
                <div
                    className={styles.modalBackdrop}
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeRepositoryDetails();
                    }}
                >
                    <section
                        className={styles.repositoryModal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="repository-modal-title"
                        aria-describedby="repository-modal-description"
                        ref={modalRef}
                    >
                        <header className={styles.modalHeader}>
                            <span>{selectedRepository.category?.title || "Public repository"}</span>
                            <button
                                className={styles.modalClose}
                                type="button"
                                ref={modalCloseButtonRef}
                                onClick={closeRepositoryDetails}
                                aria-label="Close repository details"
                            >
                                <FiX aria-hidden="true" />
                            </button>
                        </header>

                        <div className={styles.modalBody}>
                            <div className={styles.modalPoster}>
                                <img
                                    src={selectedRepositoryImage}
                                    alt=""
                                    aria-hidden="true"
                                    onError={() => {
                                        if (!selectedRepositoryScreenshot || failedScreenshots.has(selectedRepositoryNameForDisplay)) return;
                                        setFailedScreenshots((current) => new Set(current).add(selectedRepositoryNameForDisplay));
                                    }}
                                />
                                <span>{selectedRepositoryNameForDisplay}</span>
                            </div>

                            <div className={styles.modalContent}>
                                <h2 id="repository-modal-title">{selectedRepository.name}</h2>
                                <p className={styles.modalDescription} id="repository-modal-description">
                                    {selectedRepository.desc}
                                </p>

                                <dl className={styles.repositoryFacts}>
                                    <div>
                                        <dt>Repository</dt>
                                        <dd>{selectedRepositoryNameForDisplay}</dd>
                                    </div>
                                    <div>
                                        <dt>Created</dt>
                                        <dd>{formatRepositoryDate(selectedRepository.repo?.createdAt)}</dd>
                                    </div>
                                    <div>
                                        <dt>Last updated</dt>
                                        <dd>{formatRepositoryDate(selectedRepository.repo?.pushedAt || selectedRepository.repo?.updatedAt)}</dd>
                                    </div>
                                    <div>
                                        <dt>Primary language</dt>
                                        <dd>{selectedRepository.repo?.language || selectedRepository.tech?.[0] || "Not specified"}</dd>
                                    </div>
                                </dl>

                                {selectedRepositoryTopics.length > 0 && (
                                    <div className={styles.modalTopicSection}>
                                        <h3>Technologies and topics</h3>
                                        <div className={styles.modalTags}>
                                            {selectedRepositoryTopics.map((topic) => (
                                                <span key={topic}>{topic}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className={styles.modalActions}>
                                    {selectedRepository.live && (
                                        <a
                                            className={styles.primaryAction}
                                            href={selectedRepository.live}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Open live project <FiExternalLink aria-hidden="true" />
                                        </a>
                                    )}
                                    {selectedRepositorySource && (
                                        <a
                                            className={styles.sourceAction}
                                            href={selectedRepositorySource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <FiGithub aria-hidden="true" /> View source code <FiArrowUpRight aria-hidden="true" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        <footer className={styles.modalNavigation}>
                            <button
                                className={styles.modalNavButton}
                                type="button"
                                disabled={selectedRepositoryIndex === 0}
                                onClick={() => moveRepositoryDetails(-1)}
                            >
                                <FiChevronLeft aria-hidden="true" /> Previous
                            </button>
                            <span aria-live="polite">
                                {selectedRepositoryIndex + 1} of {results.length}
                            </span>
                            <button
                                className={styles.modalNavButton}
                                type="button"
                                disabled={selectedRepositoryIndex === results.length - 1}
                                onClick={() => moveRepositoryDetails(1)}
                            >
                                Next <FiChevronRight aria-hidden="true" />
                            </button>
                        </footer>
                    </section>
                </div>
            )}
        </div>
    );
};

export default Search;
