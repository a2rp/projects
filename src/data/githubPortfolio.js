export const GITHUB_OWNER = "a2rp";
const CACHE_KEY = "projects-portfolio:github-data:v1";
const LEGACY_REPOS_KEY = "projects-portfolio:github-repos:v1";
const LEGACY_PROFILE_KEY = "projects-portfolio:github-profile:v1";
const LEGACY_SCREENSHOTS_KEY = "projects-portfolio:repository-screenshots:v1";
const REFRESH_AFTER = 6 * 60 * 60 * 1000;
const HIDDEN_REPO_NAMES = new Set(["a2rp"]);
const SCREENSHOT_SELECTION_MODE = "latest-root-image-v2";
const ROOT_IMAGE_PATTERN = /\.(png|jpe?g|webp|avif|gif|bmp|tiff?|svg)$/i;
export const FALLBACK_PUBLIC_REPO_COUNT = 477;

let refreshInFlight;
const screenshotRequestsInFlight = new Map();

export const getProjectRepoName = (project) => {
    const repoUrl = project.code?.find((item) => item.url)?.url || "";
    const match = repoUrl.match(/github\.com\/[^/]+\/([^/?#]+)/i);
    return match?.[1]?.replace(/\.git$/i, "").toLowerCase() || "";
};

export const isPortfolioRepo = (repo) => Boolean(repo?.name)
    && !HIDDEN_REPO_NAMES.has(repo.name.toLowerCase());

export const getRepoActivityDate = (repo) => repo?.pushedAt || repo?.updatedAt || "";

export const getRepoActivityLabel = (repo) => repo?.pushedAt ? "Last pushed" : "Last updated";

export const getRepoTimestamp = (repo) => Date.parse(getRepoActivityDate(repo)) || 0;

export const compareReposByActivity = (first, second) => (
    getRepoTimestamp(second) - getRepoTimestamp(first)
);

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

        if (pageRepos.length < 100) break;
    }

    if (reposByName.size === 0 && cachedRepos.length) return cachedRepos;
    return [...reposByName.values()];
};

const findScreenshotUrl = async (repo) => {
    if (!repo?.defaultBranch) return { screenshotUrl: "", checked: false };

    try {
        const tree = await requestGitHubJson(
            `https://api.github.com/repos/${GITHUB_OWNER}/${repo.name}/git/trees/${encodeURIComponent(repo.defaultBranch)}?recursive=1`,
        );
        const rootImages = (tree.tree || []).filter((item) => (
            item.type === "blob"
            && typeof item.path === "string"
            && !item.path.includes("/")
            && ROOT_IMAGE_PATTERN.test(item.path)
        ));

        if (rootImages.length === 0) return { screenshotUrl: "", checked: true };

        let latestImage = rootImages[0];
        if (rootImages.length > 1) {
            const imageCommits = [];
            for (let index = 0; index < rootImages.length; index += 4) {
                const batch = await Promise.all(rootImages.slice(index, index + 4).map(async (image) => {
                    try {
                        const commits = await requestGitHubJson(
                            `https://api.github.com/repos/${GITHUB_OWNER}/${repo.name}/commits?path=${encodeURIComponent(image.path)}&per_page=1`,
                        );
                        const commit = commits[0]?.commit;
                        const committedAt = Date.parse(commit?.committer?.date || commit?.author?.date || "");
                        return {
                            image,
                            committedAt: Number.isFinite(committedAt) ? committedAt : 0,
                            checked: Number.isFinite(committedAt),
                        };
                    } catch {
                        return { image, committedAt: 0, checked: false };
                    }
                }));
                imageCommits.push(...batch);
            }

            if (imageCommits.some((entry) => !entry.checked)) {
                return { screenshotUrl: "", checked: false };
            }

            latestImage = imageCommits.sort((first, second) => (
                second.committedAt - first.committedAt
                || first.image.path.localeCompare(second.image.path)
            ))[0].image;
        }

        const encodedPath = latestImage.path.split("/").map(encodeURIComponent).join("/");
        return {
            screenshotUrl: `https://raw.githubusercontent.com/${GITHUB_OWNER}/${repo.name}/${encodeURIComponent(repo.defaultBranch)}/${encodedPath}`,
            checked: true,
        };
    } catch {
        return { screenshotUrl: "", checked: false };
    }
};

const storePortfolioData = (data) => {
    if (typeof window === "undefined") return;

    try {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
        // Keep fetched data in this page session when browser storage is unavailable.
    }
};

export const ensureRepoScreenshot = (repo) => {
    const normalizedRepo = repo?.name ? normalizeRepo(repo) : null;
    if (!normalizedRepo) return Promise.resolve({ screenshotUrl: "", checked: true });

    const repoName = normalizedRepo.name.toLowerCase();
    const cached = readStoredData();
    const previous = cached.screenshotChecks[repoName];
    const checkedFor = normalizedRepo.pushedAt || normalizedRepo.updatedAt || "";
    const screenshotIsCurrent = previous
        && previous.checkedFor === checkedFor
        && previous.defaultBranch === normalizedRepo.defaultBranch
        && previous.selectionMode === SCREENSHOT_SELECTION_MODE;

    if (screenshotIsCurrent) {
        return Promise.resolve({ screenshotUrl: previous.screenshotUrl || "", checked: true });
    }

    if (screenshotRequestsInFlight.has(repoName)) {
        return screenshotRequestsInFlight.get(repoName);
    }

    const request = findScreenshotUrl(normalizedRepo)
        .then((result) => {
            if (!result.checked) {
                return { screenshotUrl: previous?.screenshotUrl || "", checked: false };
            }

            const latestCache = readStoredData();
            storePortfolioData({
                ...latestCache,
                screenshotChecks: {
                    ...latestCache.screenshotChecks,
                    [repoName]: {
                        screenshotUrl: result.screenshotUrl,
                        checkedFor,
                        defaultBranch: normalizedRepo.defaultBranch,
                        checkedAt: new Date().toISOString(),
                        selectionMode: SCREENSHOT_SELECTION_MODE,
                    },
                },
            });

            return result;
        })
        .finally(() => screenshotRequestsInFlight.delete(repoName));

    screenshotRequestsInFlight.set(repoName, request);
    return request;
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

    if (reposResult.status === "rejected") {
        throw reposResult.reason;
    }

    const latestCache = readStoredData();
    const next = {
        publicRepoCount,
        repos,
        screenshotChecks: latestCache.screenshotChecks || cached.screenshotChecks || {},
        syncedAt: new Date().toISOString(),
    };

    storePortfolioData(next);

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

export const syncGitHubPortfolio = ({ force = false } = {}) => {
    const cached = readStoredData();
    const syncedAt = Date.parse(cached.syncedAt || "");
    const cacheIsFresh = Number.isFinite(syncedAt)
        && Date.now() - syncedAt < REFRESH_AFTER;

    if (!force && cacheIsFresh) return Promise.resolve(readCachedGitHubPortfolio());
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = refreshPortfolioData(cached).finally(() => {
        refreshInFlight = null;
    });
    return refreshInFlight;
};
