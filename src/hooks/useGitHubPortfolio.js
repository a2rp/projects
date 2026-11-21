import { useEffect, useState } from "react";
import {
    readCachedGitHubPortfolio,
    syncGitHubPortfolio,
} from "../data/githubPortfolio";

const CACHE_KEY = "projects-portfolio:github-data:v1";
const CHECK_INTERVAL = 15 * 60 * 1000;

const useGitHubPortfolio = () => {
    const [portfolio, setPortfolio] = useState(readCachedGitHubPortfolio);

    useEffect(() => {
        let isMounted = true;

        const sync = () => {
            syncGitHubPortfolio()
                .then((nextPortfolio) => {
                    if (isMounted) setPortfolio(nextPortfolio);
                })
                .catch(() => {
                    // Keep the locally cached snapshot when GitHub is unavailable.
                });
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
            isMounted = false;
            window.clearInterval(refreshCheck);
            window.removeEventListener("focus", sync);
            window.removeEventListener("online", sync);
            window.removeEventListener("storage", readStorageUpdate);
            document.removeEventListener("visibilitychange", sync);
        };
    }, []);

    return portfolio;
};

export default useGitHubPortfolio;
