import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/layout/AdminNavbar/AdminNavbar';

function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminNavbar />
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
