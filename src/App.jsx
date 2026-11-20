import styles from "./style.module.css";
import ScrollToTop from "./components/ScrollToTop";
import AppRoutes from "./AppRoutes";
import Header from "./components/header";
import Footer from "./components/footer";

const App = () => (
    <div className={styles.wrapper}>
        <Header />
        <main className={styles.main}>
            <ScrollToTop />
            <AppRoutes />
        </main>
        <Footer />
    </div>
);

export default App;
