import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";
import styles from "./style.module.css";

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const update = () => setVisible(window.scrollY > 280);
        update();
        window.addEventListener("scroll", update, { passive: true });
        return () => window.removeEventListener("scroll", update);
    }, []);

    if (!visible) return null;

    return (
        <button className={styles.button} type="button" aria-label="Scroll to top" title="Scroll to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <FiArrowUp aria-hidden="true" />
        </button>
    );
}
