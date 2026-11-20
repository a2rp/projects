import { CircularProgress } from "@mui/material";
import styles from "./style.module.css";

const Spinner = () => (
    <div className={styles.spinner} role="status" aria-label="Loading page">
        <CircularProgress aria-hidden="true" />
    </div>
);

export default Spinner;
