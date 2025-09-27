import React, { useState, useEffect } from "react"
import { Add, SportsSoccer, Edit, Delete } from "@mui/icons-material"
import { supabaseHelpers } from "../../../lib/supabase"
import { PageLoader } from "../../../components/LoadingSpinner"
import { formatDate } from "../../../utils/helpers"
import MatchModal from "../../../components/MatchModal"

// Glassmorphism Toast
const Toast = ({ message, onClose }) => {
  if (!message) return null
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg text-white px-6 py-3 rounded-2xl animate-fade-in-up">
        <p className="font-medium">{message}</p>
        <button
          className="ml-4 text-sm underline hover:text-yellow-300"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  )
}

const MatchManager = () => {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [toastMessage, setToastMessage] = useState("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [formData, setFormData] = useState({
    home_team: "",
    away_team: "",
    match_date: "",
    venue: "",
    ticket_price: "",
    total_seats: ""
  })

  useEffect(() => {
    fetchMatches()

    // ✅ auto-open modal if redirected with ?add=new
    const params = new URLSearchParams(window.location.search)
    if (params.get("add") === "new") {
      openAddModal()
    }
  }, [])

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabaseHelpers.getMatches()
      if (error) throw error

      // ✅ Sort matches chronologically
      const sortedMatches = (data || []).sort(
        (a, b) => new Date(a.match_date) - new Date(b.match_date)
      )

      setMatches(sortedMatches)
    } catch (err) {
      setError("Failed to load matches")
      console.error("Error fetching matches:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const matchData = {
        ...formData,
        ticket_price: parseInt(formData.ticket_price),
        total_seats: parseInt(formData.total_seats),
        available_seats: parseInt(formData.total_seats),
        match_date: new Date(formData.match_date).toISOString()
      }

      if (editingMatch) {
        const { error } = await supabaseHelpers.updateMatch(editingMatch.id, matchData)
        if (error) throw error
        showToast("✅ Match updated successfully!")
      } else {
        const { error } = await supabaseHelpers.createMatch(matchData)
        if (error) throw error
        showToast("✅ Match created successfully!")
      }

      await fetchMatches()
      closeModal()
    } catch (err) {
      setError(`Failed to ${editingMatch ? "update" : "create"} match`)
      console.error("Error saving match:", err)
    }
  }

  const handleDelete = async (matchId) => {
    try {
      const { error } = await supabaseHelpers.deleteMatch(matchId)
      if (error) throw error
      showToast("🗑️ Match deleted successfully!")
      await fetchMatches()
    } catch (err) {
      setError("Failed to delete match")
      console.error("Error deleting match:", err)
    }
  }

  const openAddModal = () => {
    setEditingMatch(null)
    setFormData({
      home_team: "",
      away_team: "",
      match_date: new Date().toISOString().slice(0, 16), // ✅ default to now
      venue: "",
      ticket_price: "",
      total_seats: ""
    })
    setIsModalOpen(true)
  }

  const openEditModal = (match) => {
    setEditingMatch(match)
    setFormData({
      home_team: match.home_team,
      away_team: match.away_team,
      match_date: new Date(match.match_date).toISOString().slice(0, 16),
      venue: match.venue,
      ticket_price: match.ticket_price,
      total_seats: match.total_seats
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingMatch(null)
    setFormData({
      home_team: "",
      away_team: "",
      match_date: "",
      venue: "",
      ticket_price: "",
      total_seats: ""
    })
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(""), 3000)
  }

  const getDateLabel = (dateStr) => {
    const today = new Date()
    const matchDate = new Date(dateStr)
    const diff = Math.floor((matchDate - today) / (1000 * 60 * 60 * 24))

    if (diff === 0) return "Today"
    if (diff === 1) return "Tomorrow"
    return formatDate(dateStr, { weekday: "long", month: "short", day: "numeric" })
  }

  if (loading) return <PageLoader />
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>

  return (
    <div className="min-h-screen bg-[#d6d8e0] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1b32]">Match Manager</h1>
          <p className="text-[#5a5f6d]">Create, edit, and manage football matches</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#FFD600] hover:bg-yellow-400 text-[#0b1b32] font-medium px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Add className="h-4 w-4" />
          <span>Add Match</span>
        </button>
      </div>

      {/* Matches List */}
      <div className="admin-card bg-white rounded-2xl shadow border border-[#c9ced8] p-6">
        {matches.length > 0 ? (
          <div className="space-y-6">
            {matches.map((match, idx) => (
              <div key={match.id}>
                {/* Group by date */}
                {idx === 0 ||
                new Date(matches[idx - 1].match_date).toDateString() !==
                  new Date(match.match_date).toDateString() ? (
                  <h2 className="text-lg font-semibold text-[#0b1b32] mb-2">
                    {getDateLabel(match.match_date)}
                  </h2>
                ) : null}

                <div className="flex items-center justify-between p-3 bg-[#eeedf2] rounded-lg border border-[#c9ced8]">
                  <div className="flex items-center space-x-3">
                    <SportsSoccer className="h-8 w-8 text-[#0b1b32]" />
                    <div>
                      <div className="font-semibold text-[#0b1b32]">
                        {match.home_team} vs {match.away_team}
                      </div>
                      <div className="text-sm text-[#5a5f6d]">
                        {formatDate(match.match_date, {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}{" "}
                        • {match.venue}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="font-semibold text-[#0b1b32]">
                      KES {match.ticket_price}
                    </div>
                    <button
                      onClick={() => openEditModal(match)}
                      className="p-2 rounded-full hover:bg-[#eeedf2] text-[#0b1b32]"
                      title="Edit Match"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(match.id)}
                      className="p-2 rounded-full hover:bg-red-100 text-red-600"
                      title="Delete Match"
                    >
                      <Delete className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[#5a5f6d]">
            <SportsSoccer className="h-12 w-12 mx-auto mb-4 text-[#c8cdd7]" />
            <p>No matches scheduled yet</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <MatchModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingMatch={editingMatch}
      />

      {/* Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
    </div>
  )
}

export default MatchManager
