import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Close, Dashboard, SportsSoccer, ConfirmationNumber, Event } from '@mui/icons-material';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: <Dashboard fontSize="small" /> },
  { path: '/admin/matches', label: 'Matches', icon: <SportsSoccer fontSize="small" /> },
  { path: '/admin/tickets', label: 'Tickets', icon: <ConfirmationNumber fontSize="small" /> },
  { path: '/admin/calendar', label: 'Calendar', icon: <Event fontSize="small" /> },
];

const AdminSidebar = ({ user, isOpen, onClose }) => {
  const location = useLocation();

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-bold text-[#0D1E4C]">Admin Panel</h2>
        <button
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={onClose}
        >
          <Close />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                location.pathname === item.path
                  ? 'bg-[#0D1E4C] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
