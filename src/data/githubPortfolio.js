import { projects } from "./projects";

export const GITHUB_OWNER = "a2rp";
const CACHE_KEY = "projects-portfolio:github-data:v1";
const LEGACY_REPOS_KEY = "projects-portfolio:github-repos:v1";
const LEGACY_PROFILE_KEY = "projects-portfolio:github-profile:v1";
const LEGACY_SCREENSHOTS_KEY = "projects-portfolio:repository-screenshots:v1";
const REFRESH_AFTER = 6 * 60 * 60 * 1000;
const HERO_EXCLUDED_REPOS = new Set(["a2rp", "projects"]);
export const FALLBACK_PUBLIC_REPO_COUNT = 477;

let refreshInFlight;

export const getProjectRepoName = (project) => {
    const repoUrl = project.code?.find((item) => item.url)?.url || "";
    const match = repoUrl.match(/github\.com\/[^/]+\/([^/?#]+)/i);
    return match?.[1]?.replace(/\.git$/i, "").toLowerCase() || "";
};

export const getRepoTimestamp = (repo) => Date.parse(repo?.pushedAt || repo?.updatedAt || "") || 0;

const parseLocalStorage = (key) => {
    if (typeof window === "undefined") return null;

    try {
        return JSON.parse(window.localStorage.getItem(key) || "null");
    } catch {
        return null;
    }
};

const normalizeRepo = (repo) => ({
    name: repo.name,
    pushedAt: repo.pushedAt || repo.pushed_at || "",
    updatedAt: repo.updatedAt || repo.updated_at || "",
    createdAt: repo.createdAt || repo.created_at || "",
    language: repo.language || "",
    description: repo.description || "",
    htmlUrl: repo.htmlUrl || repo.html_url || `https://github.com/${GITHUB_OWNER}/${repo.name}`,
    homepage: repo.homepage || "",
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    defaultBranch: repo.defaultBranch || repo.default_branch || "",
});

const readLegacyData = () => {
    const oldRepos = parseLocalStorage(LEGACY_REPOS_KEY);
    const oldProfile = parseLocalStorage(LEGACY_PROFILE_KEY);
    const oldScreenshots = parseLocalStorage(LEGACY_SCREENSHOTS_KEY);
    const screenshotChecks = oldScreenshots?.repositories || {};
    const repoScreenshots = Object.fromEntries(
        (oldRepos?.repos || [])
            .filter((repo) => repo?.name && typeof repo.screenshotUrl === "string" && repo.screenshotUrl)
            .map((repo) => [repo.name.toLowerCase(), {
                screenshotUrl: repo.screenshotUrl,
                checkedFor: repo.screenshotCheckedFor || "",
                defaultBranch: repo.defaultBranch || "",
                checkedAt: repo.screenshotCheckedAt || "",
            }]),
    );

    return {
        publicRepoCount: oldProfile?.publicRepos ?? FALLBACK_PUBLIC_REPO_COUNT,
        repos: (oldRepos?.repos || []).filter((repo) => repo?.name).map(normalizeRepo),
        screenshotChecks: { ...screenshotChecks, ...repoScreenshots },
        syncedAt: "",
    };
};

const readStoredData = () => {
    const cached = parseLocalStorage(CACHE_KEY);
    if (cached && Array.isArray(cached.repos) && cached.screenshotChecks) {
        return {
            publicRepoCount: Number.isInteger(cached.publicRepoCount)
                ? cached.publicRepoCount
                : FALLBACK_PUBLIC_REPO_COUNT,
            repos: cached.repos.filter((repo) => repo?.name).map(normalizeRepo),
            screenshotChecks: cached.screenshotChecks,
            syncedAt: cached.syncedAt || "",
        };
    }

    return readLegacyData();
};

export const readCachedGitHubPortfolio = () => {
    const cached = readStoredData();
    const screenshots = Object.fromEntries(
        Object.entries(cached.screenshotChecks)
            .filter(([, entry]) => typeof entry?.screenshotUrl === "string" && entry.screenshotUrl)
            .map(([repoName, entry]) => [repoName, entry.screenshotUrl]),
    );

    return {
        publicRepoCount: cached.publicRepoCount,
        repos: cached.repos,
        screenshots,
        syncedAt: cached.syncedAt,
    };
};

const requestGitHubJson = async (url) => {
    const response = await fetch(url, {
        headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error(`GitHub request failed (${response.status})`);
    return response.json();
};

const fetchRelevantRepos = async (cachedRepos) => {
    const desiredNames = new Set(projects.map(getProjectRepoName).filter(Boolean));
    const reposByName = new Map();
    let page = 1;

    for (; page <= 10; page += 1) {
        const pageRepos = await requestGitHubJson(
            `https://api.github.com/users/${GITHUB_OWNER}/repos?sort=updated&per_page=100&page=${page}`,
        );

        pageRepos
            .filter((repo) => repo?.name)
            .map(normalizeRepo)
            .forEach((repo) => reposByName.set(repo.name.toLowerCase(), repo));

        const hasAllFeaturedRepos = [...desiredNames].every((repoName) => reposByName.has(repoName));
        if (hasAllFeaturedRepos || pageRepos.length < 100) break;
    }

    if (reposByName.size === 0 && cachedRepos.length) return cachedRepos;
    return [...reposByName.values()];
};

const isHeroRepo = (repo) => !HERO_EXCLUDED_REPOS.has(repo?.name?.toLowerCase());

const findScreenshotUrl = async (repo) => {
    if (!repo?.defaultBranch) return "";

    try {
        const tree = await requestGitHubJson(
            `https://api.github.com/repos/${GITHUB_OWNER}/${repo.name}/git/trees/${encodeURIComponent(repo.defaultBranch)}?recursive=1`,
        );
        const screenshot = (tree.tree || [])
            .filter((item) => {
                if (item.type !== "blob" || !/\.(png|jpe?g|webp|avif|gif)$/i.test(item.path)) return false;
                const path = item.path.toLowerCase();
                const isPortfolioLogo = repo.name.toLowerCase() === "projects"
                    && /(^|\/)public\/preview\.png$/.test(path);
                if (isPortfolioLogo || /logo|icon|favicon/.test(path)) return false;

                return /screenshot|screen-shot/.test(path)
                    || /(^|\/)screenshots?\//.test(path)
                    || /(^|[._/-])(preview|hero|banner|cover|og-image)([._/-]|$)/.test(path);
            })
            .sort((first, second) => {
                const score = (path) => (
                    (/screenshots?\//i.test(path) ? 4 : 0)
                    + (/screenshot|screen-shot/i.test(path) ? 3 : 0)
                    + (/preview|hero|banner|cover|og-image/i.test(path) ? 1 : 0)
                );
                return score(second.path) - score(first.path);
            })[0];

        if (!screenshot) return "";
        const encodedPath = screenshot.path.split("/").map(encodeURIComponent).join("/");
        return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${repo.name}/${encodeURIComponent(repo.defaultBranch)}/${encodedPath}`;
    } catch {
        return "";
    }
};

const refreshPortfolioData = async (cached) => {
    const [profileResult, reposResult] = await Promise.allSettled([
        requestGitHubJson(`https://api.github.com/users/${GITHUB_OWNER}`),
        fetchRelevantRepos(cached.repos),
    ]);

    const repos = reposResult.status === "fulfilled" ? reposResult.value : cached.repos;
    const publicRepoCount = profileResult.status === "fulfilled"
        && Number.isInteger(profileResult.value.public_repos)
        ? profileResult.value.public_repos
        : cached.publicRepoCount;

    if (reposResult.status === "rejected" && cached.repos.length === 0) {
        throw reposResult.reason;
    }

    const previousChecks = cached.screenshotChecks || {};
    const latestRepo = repos
        .filter(isHeroRepo)
        .sort((first, second) => getRepoTimestamp(second) - getRepoTimestamp(first))[0];
    const screenshotRepos = new Map(
        projects
            .map((project) => repos.find((repo) => repo.name.toLowerCase() === getProjectRepoName(project)))
            .filter(Boolean)
            .map((repo) => [repo.name.toLowerCase(), repo]),
    );
    if (latestRepo) screenshotRepos.set(latestRepo.name.toLowerCase(), latestRepo);

    const checkEntries = await Promise.all([...screenshotRepos].map(async ([repoName, repo]) => {
        const previous = previousChecks[repoName];
        const checkedFor = repo.pushedAt || repo.updatedAt || "";
        const screenshotIsCurrent = previous
            && previous.checkedFor === checkedFor
            && previous.defaultBranch === repo.defaultBranch;

        if (screenshotIsCurrent) return [repoName, previous];

        const screenshotUrl = await findScreenshotUrl(repo);
        return [repoName, {
            screenshotUrl: screenshotUrl || previous?.screenshotUrl || "",
            checkedFor,
            defaultBranch: repo.defaultBranch,
            checkedAt: new Date().toISOString(),
        }];
    }));

    const next = {
        publicRepoCount,
        repos,
        screenshotChecks: { ...previousChecks, ...Object.fromEntries(checkEntries) },
        syncedAt: new Date().toISOString(),
    };

    try {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(next));
    } catch {
        // Keep refreshed data in this page session when browser storage is unavailable.
    }

    return {
        publicRepoCount: next.publicRepoCount,
        repos: next.repos,
        screenshots: Object.fromEntries(
            Object.entries(next.screenshotChecks)
                .filter(([, entry]) => typeof entry?.screenshotUrl === "string" && entry.screenshotUrl)
                .map(([repoName, entry]) => [repoName, entry.screenshotUrl]),
        ),
        syncedAt: next.syncedAt,
    };
};

export const syncGitHubPortfolio = () => {
    const cached = readStoredData();
    const syncedAt = Date.parse(cached.syncedAt || "");
    const cacheIsFresh = Number.isFinite(syncedAt) && Date.now() - syncedAt < REFRESH_AFTER;

    if (cacheIsFresh) return Promise.resolve(readCachedGitHubPortfolio());
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = refreshPortfolioData(cached).finally(() => {
        refreshInFlight = null;
    });
    return refreshInFlight;
};
