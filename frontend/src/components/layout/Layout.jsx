import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout() {
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

export default Layout;
