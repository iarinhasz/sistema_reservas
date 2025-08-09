import { Outlet } from 'react-router-dom';
import '../css/AppLayout.module.css';
import Header from '../shared/header';

const AppLayout = () => {
    return (
        <div className="page-container">
            <Header />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};
export default AppLayout;