import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar/Navbar';
import Footer from '../components/layout/Footer/Footer';
import BottomNav from '../components/layout/BottomNav/BottomNav';

function MainLayout() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-layout-content">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}

export default MainLayout;
