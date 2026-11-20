import { NavLink, useNavigate } from "react-router-dom";
import styles from "./style.module.css";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.wrapper} role="main" aria-labelledby="nf-title">
            <div className={styles.inner}>

                <div className={styles.code}>404</div>
                <h1 className={styles.title} id="nf-title">Page not found</h1>
                <p className={styles.subtitle}>
                    The page you're looking for may have moved, been renamed, or never existed.
                </p>

                <div className={styles.actions}>
                    <button className={styles.button}
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                    >Go back</button>
                    <NavLink
                        to="/"
                    ><span className={styles.button}>Go home</span></NavLink>
                </div>

                <p className={styles.small}>
                    Availability: Open to full-time roles (Bengaluru/remote) & select freelance projects.
                </p>
            </div>
        </div>
    );
};

export default NotFound;
