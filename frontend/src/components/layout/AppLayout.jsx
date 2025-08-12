import { Outlet } from 'react-router-dom';
import styles from './AppLayout.module.css';
import Header from '../shared/header';

const AppLayout = () => {
    return (
        <div className={styles.appLayout}>
            <Header />
            <main className={styles.mainContent}>
                <Outlet />
            </main>
        </div>

    );
};
export default AppLayout;