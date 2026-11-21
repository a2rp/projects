import { useRef } from "react";
import styles from "./style.module.css";
import ScrollToTop from "./components/scrollToTop";
import AppRoutes from "./AppRoutes";
import Header from "./components/header";
import Footer from "./components/footer";

const App = () => {
    const pageScrollRef = useRef(null);

    return (
        <div className={styles.wrapper}>
            <Header />
            <div
                className={styles.pageScrollArea}
                id="page-scroll-area"
                ref={pageScrollRef}
            >
                <main className={styles.main}>
                    <ScrollToTop scrollContainerRef={pageScrollRef} />
                    <AppRoutes />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default App;
