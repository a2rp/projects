const GITHUB_OWNER = "a2rp";
const SCREENSHOT_CACHE_KEY = "projects-portfolio:repository-screenshots:v1";
const SCREENSHOT_CACHE_TTL = 24 * 60 * 60 * 1000;

const getProjectRepoName = (project) => {
    const repoUrl = project.code?.find((item) => item.url)?.url || "";
    const match = repoUrl.match(/github\.com\/[^/]+\/([^/?#]+)/i);
    return match?.[1]?.replace(/\.git$/i, "").toLowerCase() || "";
};

const readScreenshotCache = () => {
    if (typeof window === "undefined") return {};

    try {
        const cache = JSON.parse(window.localStorage.getItem(SCREENSHOT_CACHE_KEY) || "null");
        return cache?.repositories && typeof cache.repositories === "object"
            ? cache.repositories
            : {};
    } catch {
        return {};
    }
};

export const readCachedProjectScreenshots = () => Object.fromEntries(
    Object.entries(readScreenshotCache())
        .filter(([, entry]) => typeof entry?.screenshotUrl === "string")
        .map(([repoName, entry]) => [repoName, entry.screenshotUrl]),
);

const findRepositoryScreenshot = async (repo, signal) => {
    if (!repo?.default_branch) return "";

    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${repo.name}/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1`,
            { headers: { Accept: "application/vnd.github+json" }, signal },
        );
        if (!response.ok) return "";

        const tree = await response.json();
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
        return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${repo.name}/${encodeURIComponent(repo.default_branch)}/${encodedPath}`;
    } catch {
        return "";
    }
};

export const syncProjectScreenshots = async (projects, signal) => {
    const cachedRepositories = readScreenshotCache();
    const repoNames = [...new Set(projects.map(getProjectRepoName).filter(Boolean))];
    const cacheIsFresh = repoNames.every((repoName) => {
        const entry = cachedRepositories[repoName];
        const checkedAt = Date.parse(entry?.checkedAt || "");
        return entry
            && Number.isFinite(checkedAt)
            && Date.now() - checkedAt < SCREENSHOT_CACHE_TTL;
    });

    if (cacheIsFresh) return readCachedProjectScreenshots();

    const desiredRepos = new Set(repoNames);
    const reposByName = new Map();

    for (let page = 1; page <= 10 && reposByName.size < desiredRepos.size; page += 1) {
        const response = await fetch(
            `https://api.github.com/users/${GITHUB_OWNER}/repos?sort=updated&per_page=100&page=${page}`,
            { headers: { Accept: "application/vnd.github+json" }, signal },
        );
        if (!response.ok) throw new Error("Unable to load GitHub repository screenshots");

        const pageRepos = await response.json();
        pageRepos.forEach((repo) => {
            const repoName = repo.name.toLowerCase();
            if (desiredRepos.has(repoName)) reposByName.set(repoName, repo);
        });
        if (pageRepos.length < 100) break;
    }

    const entries = await Promise.all(repoNames.map(async (repoName) => {
        const repo = reposByName.get(repoName);
        const cached = cachedRepositories[repoName];
        if (!repo) return cached ? [repoName, cached] : null;

        const checkedFor = repo.pushed_at || repo.updated_at || "";
        const checkedAt = Date.parse(cached?.checkedAt || "");
        const cacheIsCurrent = cached?.checkedFor === checkedFor
            && Number.isFinite(checkedAt)
            && Date.now() - checkedAt < SCREENSHOT_CACHE_TTL;
        if (cacheIsCurrent) return [repoName, cached];

        const screenshotUrl = await findRepositoryScreenshot(repo, signal);
        return [repoName, {
            screenshotUrl,
            checkedFor,
            checkedAt: new Date().toISOString(),
        }];
    }));

    if (signal?.aborted) return readCachedProjectScreenshots();

    const nextRepositories = {
        ...cachedRepositories,
        ...Object.fromEntries(entries.filter(Boolean)),
    };

    try {
        window.localStorage.setItem(
            SCREENSHOT_CACHE_KEY,
            JSON.stringify({ fetchedAt: new Date().toISOString(), repositories: nextRepositories }),
        );
    } catch {
        // Keep screenshots available in memory even if storage is disabled.
    }

    return Object.fromEntries(
        Object.entries(nextRepositories)
            .filter(([, entry]) => typeof entry?.screenshotUrl === "string")
            .map(([repoName, entry]) => [repoName, entry.screenshotUrl]),
    );
};

export { getProjectRepoName };
