const GITHUB_OWNER = "a2rp";
const PROFILE_CACHE_KEY = "projects-portfolio:github-profile:v1";

// Last count shown on the supplied GitHub profile screenshot; used before the first online fetch.
export const FALLBACK_PUBLIC_REPO_COUNT = 623;

export const readCachedPublicRepoCount = () => {
    if (typeof window === "undefined") return null;

    try {
        const cachedProfile = JSON.parse(window.localStorage.getItem(PROFILE_CACHE_KEY) || "null");
        return Number.isInteger(cachedProfile?.publicRepos) && cachedProfile.publicRepos >= 0
            ? cachedProfile.publicRepos
            : null;
    } catch {
        return null;
    }
};

export const fetchAndCachePublicRepoCount = async (signal) => {
    const cachedCount = readCachedPublicRepoCount();
    if (cachedCount !== null) return cachedCount;

    const response = await fetch(`https://api.github.com/users/${GITHUB_OWNER}`, {
        headers: { Accept: "application/vnd.github+json" },
        signal,
    });

    if (!response.ok) throw new Error("Unable to load the GitHub repository count");

    const profile = await response.json();
    if (!Number.isInteger(profile.public_repos)) {
        throw new Error("GitHub did not return a public repository count");
    }

    try {
        window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({
            publicRepos: profile.public_repos,
            cachedAt: new Date().toISOString(),
        }));
    } catch {
        // Return the live count even when browser storage is unavailable.
    }

    return profile.public_repos;
};
