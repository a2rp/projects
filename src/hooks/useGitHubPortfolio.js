import { useCallback, useEffect, useRef, useState } from "react";
import {
    ensureRepoScreenshot,
    readCachedGitHubPortfolio,
    syncGitHubPortfolio,
} from "../data/githubPortfolio";

const CACHE_KEY = "projects-portfolio:github-data:v1";
const CHECK_INTERVAL = 15 * 60 * 1000;

const useGitHubPortfolio = () => {
    const [portfolio, setPortfolio] = useState(readCachedGitHubPortfolio);
    const [isFetching, setIsFetching] = useState(false);
    const [refreshError, setRefreshError] = useState("");
    const isMounted = useRef(false);

    const runSync = useCallback((force = false) => {
        setIsFetching(true);
        if (force) setRefreshError("");

        return syncGitHubPortfolio({ force })
            .then((nextPortfolio) => {
                if (isMounted.current) setPortfolio(nextPortfolio);
            })
            .catch(() => {
                if (force && isMounted.current) {
                    setRefreshError("Could not fetch fresh GitHub data. Please try again.");
                }
            })
            .finally(() => {
                if (isMounted.current) setIsFetching(false);
            });
    }, []);

    const refreshNow = useCallback(() => runSync(true), [runSync]);

    const ensureScreenshot = useCallback(async (repo) => {
        const result = await ensureRepoScreenshot(repo);
        if (!result.checked || !isMounted.current || !repo?.name) return result;

        const repoName = repo.name.toLowerCase();
        setPortfolio((current) => {
            if ((current.screenshots[repoName] || "") === result.screenshotUrl) return current;

            const screenshots = { ...current.screenshots };
            if (result.screenshotUrl) screenshots[repoName] = result.screenshotUrl;
            else delete screenshots[repoName];

            return { ...current, screenshots };
        });

        return result;
    }, []);

    useEffect(() => {
        isMounted.current = true;

        const sync = () => {
            runSync();
        };

        const readStorageUpdate = (event) => {
            if (event.key === CACHE_KEY) setPortfolio(readCachedGitHubPortfolio());
        };

        sync();
        const refreshCheck = window.setInterval(sync, CHECK_INTERVAL);
        window.addEventListener("focus", sync);
        window.addEventListener("online", sync);
        window.addEventListener("storage", readStorageUpdate);
        document.addEventListener("visibilitychange", sync);

        return () => {
            isMounted.current = false;
            window.clearInterval(refreshCheck);
            window.removeEventListener("focus", sync);
            window.removeEventListener("online", sync);
            window.removeEventListener("storage", readStorageUpdate);
            document.removeEventListener("visibilitychange", sync);
        };
    }, [runSync]);

    return {
        ...portfolio,
        isFetching,
        refreshError,
        refreshNow,
        ensureScreenshot,
    };
};

export default useGitHubPortfolio;
