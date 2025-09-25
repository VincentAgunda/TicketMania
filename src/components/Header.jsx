import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { NAVIGATION } from "../utils/constants"
import {
  SportsSoccer,
  Menu,
  Close,
  AccountCircle,
  ExitToApp,
  Dashboard,
  Login,
} from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, signOut, isAdmin } = useAuth()
  const location = useLocation()

  const navigation = user && isAdmin ? NAVIGATION.admin : NAVIGATION.public

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen)
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white text-brand-navy shadow-lg relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {/* Rotating football with framer-motion */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            >
              <SportsSoccer className="h-8 w-8 text-brand-navy" />
            </motion.div>
            <span className="text-xl font-bold">TicketCenter</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? "bg-brand-light text-brand-navy"
                    : "text-brand-navy hover:text-brand-teal hover:bg-brand-beige"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <AccountCircle className="h-6 w-6 text-brand-navy" />
                  <span className="text-sm text-brand-navy">{user.email}</span>
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                    >
                      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                        Signed in as <br />
                        <span className="font-medium text-sm text-gray-700">
                          {user.email}
                        </span>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Dashboard className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      {/* Sign Out with custom color */}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <ExitToApp className="h-4 w-4" style={{ color: "#6e3640" }} />
                        <span className="font-medium" style={{ color: "#6e3640" }}>
                          Sign Out
                        </span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Sign In"
              >
                <Login className="h-6 w-6 text-brand-navy" />
                <span className="text-sm text-brand-navy hidden lg:inline">
                  Sign In
                </span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-brand-navy"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <Close /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.href
                      ? "bg-brand-light text-brand-navy"
                      : "text-brand-navy hover:text-brand-teal hover:bg-brand-beige"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile User Section */}
              <div className="border-t border-gray-200 pt-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-brand-navy">
                      <div className="flex items-center space-x-2">
                        <AccountCircle />
                        <span>Signed in as: {user.email}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-brand-navy bg-brand-light hover:bg-brand-beige"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Dashboard className="h-5 w-5" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    {/* Mobile Sign Out */}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                    >
                      <ExitToApp className="h-5 w-5" style={{ color: "#6e3640" }} />
                      <span style={{ color: "#6e3640" }}>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-brand-navy hover:bg-brand-beige"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Login className="h-5 w-5 text-brand-navy" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close dropdown when clicking outside */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        ></div>
      )}
    </motion.header>
  )
}

export default Header
