import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";
import styles from "./style.module.css";

export default function ScrollToTop({ scrollContainerRef }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return undefined;

        const update = () => setVisible(scrollContainer.scrollTop > 280);
        update();
        scrollContainer.addEventListener("scroll", update, { passive: true });
        return () => scrollContainer.removeEventListener("scroll", update);
    }, [scrollContainerRef]);

    if (!visible) return null;

    return (
        <button className={styles.button} type="button" aria-label="Scroll to top" title="Scroll to top" onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}>
            <FiArrowUp aria-hidden="true" />
        </button>
    );
}
