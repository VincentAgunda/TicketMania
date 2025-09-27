import React, { useState, useEffect } from "react"
import { Add, SportsSoccer, Edit, Delete } from "@mui/icons-material"
import { supabaseHelpers } from "../../../lib/supabase"
import { PageLoader } from "../../../components/LoadingSpinner"
import { formatDate } from "../../../utils/helpers"
import MatchModal from "../../../components/MatchModal"

const MatchManager = () => {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState(null) // ✅ notification

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [deletingMatch, setDeletingMatch] = useState(null) // ✅ for delete modal

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
    const params = new URLSearchParams(window.location.search)
    if (params.get("add") === "new") openAddModal()
  }, [])

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabaseHelpers.getMatches()
      if (error) throw error
      setMatches(data || [])
    } catch (err) {
      setError("Failed to load matches")
      console.error("Error fetching matches:", err)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (text, type = "success") => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
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
        showMessage("Match updated successfully ✅")
      } else {
        const { error } = await supabaseHelpers.createMatch(matchData)
        if (error) throw error
        showMessage("Match created successfully 🎉")
      }

      await fetchMatches()
      closeModal()
    } catch (err) {
      setError(`Failed to ${editingMatch ? "update" : "create"} match`)
      console.error("Error saving match:", err)
    }
  }

  const confirmDelete = (match) => {
    setDeletingMatch(match)
  }

  const handleDelete = async () => {
    if (!deletingMatch) return
    try {
      const { error } = await supabaseHelpers.deleteMatch(deletingMatch.id)
      if (error) throw error
      setMatches(matches.filter((m) => m.id !== deletingMatch.id))
      showMessage("Match deleted 🗑️", "error")
    } catch (err) {
      setError("Failed to delete match")
      console.error("Error deleting match:", err)
    } finally {
      setDeletingMatch(null)
    }
  }

  const openAddModal = () => {
    setEditingMatch(null)
    setFormData({
      home_team: "",
      away_team: "",
      match_date: new Date().toISOString().slice(0, 16),
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

  if (loading) return <PageLoader />
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>

  return (
    <div className="min-h-screen bg-[#d6d8e0] p-6 space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1b32]">Match Manager</h1>
          <p className="text-[#5a5f6d]">Create, edit and manage football matches</p>
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
          <div className="space-y-3">
            {matches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-3 bg-[#eeedf2] rounded-lg border border-[#c9ced8]"
              >
                <div className="flex items-center space-x-3">
                  <SportsSoccer className="h-8 w-8 text-[#0b1b32]" />
                  <div>
                    <div className="font-semibold text-[#0b1b32]">
                      {match.home_team} vs {match.away_team}
                    </div>
                    <div className="text-sm text-[#5a5f6d]">
                      {formatDate(match.match_date, {
                        hour: "2-digit",
                        minute: "2-digit",
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                      })}{" "}
                      • {match.venue}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="font-semibold text-[#0b1b32]">KES {match.ticket_price}</div>
                  <button
                    onClick={() => openEditModal(match)}
                    className="p-2 rounded-full hover:bg-[#eeedf2] text-[#0b1b32]"
                    title="Edit Match"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => confirmDelete(match)}
                    className="p-2 rounded-full hover:bg-red-100 text-red-600"
                    title="Delete Match"
                  >
                    <Delete className="h-5 w-5" />
                  </button>
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

      {/* Match Form Modal */}
      <MatchModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingMatch={editingMatch}
      />

      {/* ✅ Glassmorphism Notification */}
      {message && (
        <div
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-2xl shadow-lg backdrop-blur-md border
          ${message.type === "error" ? "bg-red-500/30 text-red-800 border-red-400/50" : "bg-green-500/30 text-green-900 border-green-400/50"}
        `}
        >
          {message.text}
        </div>
      )}

      {/* ✅ Glassmorphism Delete Confirm Modal */}
      {deletingMatch && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg p-6 w-full max-w-md text-center">
            <h2 className="text-lg font-semibold text-[#0b1b32] mb-4">
              Delete Match?
            </h2>
            <p className="text-[#5a5f6d] mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold">{deletingMatch.home_team} vs {deletingMatch.away_team}</span>?  
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeletingMatch(null)}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-[#0b1b32] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-500/80 hover:bg-red-600 text-white font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchManager
