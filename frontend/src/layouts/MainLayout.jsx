import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar/Navbar';
import Footer from '../components/layout/Footer/Footer';

function MainLayout() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-layout-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
