import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/public/Home'
import Matches from './pages/public/Matches'
import Booking from './pages/public/Booking'
import Tickets from './pages/public/Tickets'
import Login from './pages/public/Login'  // Moved to public
import Register from './pages/public/Register'  // Moved to public
import AdminLayout from './pages/admin/AdminLayout'
import './styles/globals.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-primary-light">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/booking/:matchId" element={<Booking />} />
              <Route path="/my-tickets" element={<Tickets />} />
              <Route path="/login" element={<Login />} />  {/* Updated path */}
              <Route path="/register" element={<Register />} />  {/* Added route */}
              <Route path="/admin/*" element={<AdminLayout />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App