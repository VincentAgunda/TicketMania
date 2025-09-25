import React, { useState, useEffect } from 'react' 
import { 
  Search,
  FilterList,
  ConfirmationNumber,
  CheckCircle,
  Cancel,
  QrCode,
  Download,
  Refresh
} from '@mui/icons-material'
import { formatDate, formatCurrency, formatPhoneNumber } from '../../../utils/helpers'
import { CompactTicketQR } from '../../../components/TicketQR'
import { supabaseHelpers } from '../../../lib/supabase'
import { PageLoader } from '../../../components/LoadingSpinner'

const TicketManager = () => {
  const [tickets, setTickets] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      // You'll need to create a function to get all tickets with match details
      const { data, error } = await supabaseHelpers.getAllTicketsWithMatches()
      if (error) throw error
      setTickets(data || [])
    } catch (err) {
      setError('Failed to load tickets')
      console.error('Error fetching tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const { error } = await supabaseHelpers.updateTicketStatus(ticketId, newStatus)
      if (error) throw error
      
      // Update local state
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      ))
    } catch (err) {
      setError('Failed to update ticket status')
      console.error('Error updating ticket:', err)
    }
  }

  const exportTickets = () => {
    const headers = ['Ticket ID', 'Match', 'Seat', 'Price', 'Status', 'Customer', 'Phone', 'Purchase Date']
    const csvData = filteredTickets.map(ticket => [
      ticket.id,
      `${ticket.matches?.home_team} vs ${ticket.matches?.away_team}`,
      ticket.seat_number,
      ticket.price,
      ticket.status,
      ticket.user_email,
      formatPhoneNumber(ticket.phone_number),
      formatDate(ticket.created_at)
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tickets-export-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.matches?.home_team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.matches?.away_team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.seat_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.mpesa_receipt?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': 
        return 'bg-green-100 text-green-800'
      case 'used': 
        return 'bg-blue-100 text-blue-800'
      case 'cancelled': 
        return 'bg-red-100 text-red-800'
      default: 
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) return <PageLoader />
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#6e3640]">Ticket Management</h1>
          <p className="text-gray-600">Manage and track all ticket sales</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={fetchTickets}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 flex items-center space-x-2"
          >
            <Refresh className="h-5 w-5" />
            <span>Refresh</span>
          </button>
          <button 
            onClick={exportTickets}
            className="bg-[#6e3640] text-white px-4 py-2 rounded-lg shadow hover:bg-[#6e3640]/90 flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-[#6e3640]">{tickets.length}</div>
          <div className="text-sm text-gray-600">Total Tickets</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {tickets.filter(t => t.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {tickets.filter(t => t.status === 'used').length}
          </div>
          <div className="text-sm text-gray-600">Used</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {tickets.filter(t => t.status === 'cancelled').length}
          </div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search tickets by match, seat, email, or receipt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#6e3640] focus:outline-none"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#6e3640] focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="used">Used</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-[#6e3640]">Ticket</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6e3640]">Match</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6e3640]">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6e3640]">Price</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6e3640]">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-[#6e3640]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <CompactTicketQR ticket={ticket} />
                      <div>
                        <div className="font-medium text-[#6e3640]">
                          {ticket.seat_number}
                        </div>
                        <div className="text-sm text-gray-600">
                          {ticket.mpesa_receipt || 'No receipt'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {ticket.matches?.home_team} vs {ticket.matches?.away_team}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(ticket.matches?.match_date)}
                      </div>
                      <div className="text-xs text-gray-500">{ticket.matches?.venue}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-[#6e3640]">{ticket.user_email}</div>
                      <div className="text-sm text-gray-600">
                        {formatPhoneNumber(ticket.phone_number)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(ticket.created_at)}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(ticket.price)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      className={`text-xs px-3 py-1 rounded-full ${getStatusColor(ticket.status)} border-0 focus:ring-0`}
                    >
                      <option value="active">Active</option>
                      <option value="used">Used</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {ticket.status === 'active' && (
                        <button 
                          title="Mark as Used"
                          onClick={() => handleStatusChange(ticket.id, 'used')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button 
                        title="Cancel Ticket"
                        onClick={() => handleStatusChange(ticket.id, 'cancelled')}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Cancel className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ConfirmationNumber className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No tickets found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketManager