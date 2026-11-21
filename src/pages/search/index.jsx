import { useMemo, useState } from "react";
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
import { projectCollections, projects } from "../../data/projects";
import {
    getProjectRepoName,
    getRepoTimestamp,
} from "../../data/githubPortfolio";
import useGitHubPortfolio from "../../hooks/useGitHubPortfolio";
import styles from "./style.module.css";

const categories = [
    { id: "all", label: "All repositories" },
    ...projectCollections.map(({ id, title }) => ({ id, label: title })),
];

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
    const [category, setCategory] = useState("all");
    const [techStack, setTechStack] = useState("all");
    const [topicFilter, setTopicFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("recent");
    const [failedScreenshots, setFailedScreenshots] = useState(() => new Set());
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
                const matchesCategory = category === "all" || repository.category?.id === category;
                const matchesTechStack = techStack === "all" || repository.tech?.includes(techStack);
                const matchesTopic = topicFilter === "all" || repository.topics?.includes(topicFilter);

                return matchesQuery && matchesCategory && matchesTechStack && matchesTopic;
            })
            .sort((first, second) => {
                if (sortOrder === "name-asc") return first.name.localeCompare(second.name);
                if (sortOrder === "name-desc") return second.name.localeCompare(first.name);
                return getRepoTimestamp(second.repo) - getRepoTimestamp(first.repo)
                    || first.originalIndex - second.originalIndex;
            });
    }, [category, query, repositories, sortOrder, techStack, topicFilter]);

    const clearFilters = () => {
        setQuery("");
        setCategory("all");
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

            <section className={styles.searchPanel} aria-label="Repository search and filters">
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

                <div className={styles.topicSection}>
                    <label className={styles.topicLabel} htmlFor="repository-topic-filter">
                        <span>Filter by topic</span>
                        <small>{topics.length} repository topics</small>
                    </label>
                    <div className={styles.topicSelectControl}>
                        <select
                            id="repository-topic-filter"
                            value={topicFilter}
                            onChange={(event) => setTopicFilter(event.target.value)}
                        >
                            <option value="all">All topics</option>
                            {topics.map(({ topic, label, count }) => (
                                <option key={topic} value={topic}>
                                    {label} ({count.toLocaleString()})
                                </option>
                            ))}
                        </select>
                        <span className={styles.topicSelectedCount} aria-live="polite">
                            {selectedTopicCount.toLocaleString()} {selectedTopicCount === 1 ? "repo" : "repos"}
                        </span>
                    </div>
                </div>

                <div className={styles.filterRow}>
                    <div className={styles.categoryFilters} role="group" aria-label="Repository category">
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
                            <option value="recent">Recently updated</option>
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
