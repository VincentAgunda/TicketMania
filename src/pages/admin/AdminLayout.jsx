import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/common/AdminSidebar';
import AdminDashboard from '../../components/admin/dashboard/AdminDashboard';
import MatchManager from '../../components/admin/matches/MatchManager';
import TicketManager from '../../components/admin/tickets/TicketManager';
import CalendarView from '../../components/admin/calendar/CalendarView';
import { PageLoader } from '../../components/LoadingSpinner';
import { Menu, Logout } from '@mui/icons-material';

const routeTitles = {
  '/admin': 'Dashboard',
  '/admin/matches': 'Match Manager',
  '/admin/tickets': 'Ticket Manager',
  '/admin/calendar': 'Calendar View',
};

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const location = useLocation();

  useEffect(() => {
    const currentPath =
      location.pathname.endsWith('/') && location.pathname.length > 1
        ? location.pathname.slice(0, -1)
        : location.pathname;

    const title = routeTitles[currentPath] || 'Admin';
    setPageTitle(title);
    document.title = `${title} | FootballTickets Admin`;
    setSidebarOpen(false); // auto-close on navigation (mobile only)
  }, [location.pathname]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex">
      {/* Sidebar */}
      <AdminSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Backdrop (mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between p-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-[#0D1E4C] hover:bg-gray-100 lg:hidden"
            >
              <span className="sr-only">Open menu</span>
              <Menu className="h-6 w-6" />
            </button>

            <h1 className="text-xl font-semibold text-[#0D1E4C] truncate">
              {pageTitle}
            </h1>

            <div className="flex items-center space-x-3">
              <span className="hidden sm:inline text-sm text-gray-600">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="p-2 rounded-full text-[#0D1E4C] hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Sign Out"
              >
                <Logout className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/matches" element={<MatchManager />} />
            <Route path="/tickets" element={<TicketManager />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
