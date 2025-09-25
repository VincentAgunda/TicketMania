import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  SportsSoccer,
  CalendarToday,
  LocationOn,
  EventSeat,
  ArrowBack,
  Warning
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { supabaseHelpers } from '../../lib/supabase'
import SeatMap from '../../components/SeatMap'
import { PageLoader } from '../../components/LoadingSpinner'
import { 
  formatDate, 
  formatCurrency, 
  validatePhoneNumber, 
  formatPhoneNumber, 
  calculateTicketPrice 
} from '../../utils/helpers'

const Booking = () => {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSeats, setSelectedSeats] = useState([])
  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [processing, setProcessing] = useState(false)
  const [bookedSeats, setBookedSeats] = useState([])

  useEffect(() => {
    const fetchMatchAndTickets = async () => {
      try {
        const { data: matchData, error: matchError } = await supabaseHelpers.getMatchById(matchId)
        if (matchError) throw matchError
        setMatch(matchData)

        const { data: ticketsData, error: ticketsError } = await supabaseHelpers.getTicketsByMatch(matchId)
        if (ticketsError) throw ticketsError
        
        const booked = ticketsData.map(ticket => ticket.seat_number)
        setBookedSeats(booked)
      } catch (err) {
        setError('Failed to load match details')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (matchId) fetchMatchAndTickets()
  }, [matchId])

  const handleSeatSelect = (seat) => {
    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.number === seat.number)
      if (isSelected) {
        return prev.filter(s => s.number !== seat.number)
      } else {
        return [...prev, seat]
      }
    })
  }

  const handleProceedToPayment = () => {
    if (!user) {
      alert('Please sign in to book tickets')
      navigate('/admin/login', { state: { from: `/booking/${matchId}` } })
      return
    }
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat')
      return
    }
    setStep(2)
  }

  const handlePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      alert('Please enter a valid Kenyan phone number (e.g., 0712345678)')
      return
    }

    if (selectedSeats.length === 0) {
      alert('Please select at least one seat')
      return
    }

    setProcessing(true)
    try {
      const normalizedPhone = formatPhoneNumber(phoneNumber, false)

      for (const seat of selectedSeats) {
        const ticketData = {
          match_id: matchId,
          user_id: user.id,
          seat_number: seat.number,
          price: calculateTicketPrice(match.ticket_price, seat.type),
          status: 'active',
          phone_number: normalizedPhone
        }

        const { error: ticketError } = await supabaseHelpers.createTicket(ticketData)
        if (ticketError) throw ticketError
      }

      const newAvailableSeats = match.available_seats - selectedSeats.length
      const { error: updateError } = await supabaseHelpers.updateMatchSeats(matchId, newAvailableSeats)
      if (updateError) throw updateError

      setStep(3)
    } catch (err) {
      console.error('Payment error:', err)
      setError('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const totalAmount = selectedSeats.reduce(
    (total, seat) => total + calculateTicketPrice(match?.ticket_price || 0, seat.type), 
    0
  )

  if (loading) return <PageLoader />
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>
  if (!match) return <div className="text-center p-8">Match not found</div>

  return (
    <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-white mb-6 hover:underline"
        >
          <ArrowBack className="h-5 w-5" />
          <span>Back to Matches</span>
        </button>

        {/* Progress Steps */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full font-semibold 
                  ${step >= stepNumber 
                    ? 'bg-[#0B1B32] text-white' 
                    : 'bg-white/40 text-[#0B1B32]'}`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 rounded-full 
                    ${step > stepNumber ? 'bg-[#0B1B32]' : 'bg-white/40'}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Match Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 sticky top-6 border border-white/30">
              <h2 className="text-xl font-bold text-[#0B1B32] mb-4">Match Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <SportsSoccer className="h-6 w-6 text-[#0B1B32]" />
                  <div className="font-semibold text-lg">
                    {match.home_team} vs {match.away_team}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CalendarToday className="h-6 w-6 text-[#26415E]" />
                  <div className="font-medium">{formatDate(match.match_date)}</div>
                </div>

                <div className="flex items-center space-x-3">
                  <LocationOn className="h-6 w-6 text-[#26415E]" />
                  <div className="font-medium">{match.venue}</div>
                </div>

                <div className="border-t border-white/30 pt-4">
                  <div className="flex justify-between text-sm text-[#0B1B32]/80 mb-1">
                    <span>Base Ticket Price:</span>
                    <span>{formatCurrency(match.ticket_price)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#0B1B32]/80">
                    <span>Available Seats:</span>
                    <span>{match.available_seats.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Selected Seats */}
              {selectedSeats.length > 0 && (
                <div className="border-t border-white/30 pt-4 mt-4">
                  <h3 className="font-semibold mb-2 flex items-center text-[#0B1B32]">
                    <EventSeat className="h-5 w-5 mr-2" />
                    Selected Seats ({selectedSeats.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedSeats.map(seat => (
                      <div key={seat.number} className="flex justify-between text-sm">
                        <span>Seat {seat.number} ({seat.type})</span>
                        <span>{formatCurrency(calculateTicketPrice(match.ticket_price, seat.type))}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/30 mt-2 pt-2 font-semibold flex justify-between">
                    <span>Total:</span>
                    <span className="text-lg text-[#0B1B32]">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Steps */}
          <div className="lg:col-span-2 space-y-8">
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Select Your Seats</h2>
                <SeatMap 
                  match={match}
                  selectedSeats={selectedSeats}
                  onSeatSelect={handleSeatSelect}
                  bookedSeats={bookedSeats}
                />
                {selectedSeats.length > 0 && (
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={handleProceedToPayment} 
                      className="bg-[#0B1B32] text-white px-10 py-3 rounded-2xl font-medium hover:opacity-90 transition"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30">
                <h2 className="text-2xl font-bold text-[#0B1B32] mb-6">Payment Details</h2>
                
                <div className="space-y-6">
                  {/* Payment Summary */}
                  <div className="bg-[#EBF0F6]/70 rounded-2xl p-4">
                    <h3 className="font-semibold mb-3 text-[#0B1B32]">Order Summary</h3>
                    {selectedSeats.map(seat => (
                      <div key={seat.number} className="flex justify-between text-sm mb-2">
                        <span>Seat {seat.number} ({seat.type})</span>
                        <span>{formatCurrency(calculateTicketPrice(match.ticket_price, seat.type))}</span>
                      </div>
                    ))}
                    <div className="border-t border-white/30 mt-3 pt-3 font-semibold flex justify-between">
                      <span>Total Amount:</span>
                      <span className="text-lg text-[#0B1B32]">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>

                  {/* M-Pesa Payment */}
                  <div>
                    <h3 className="font-semibold mb-3 text-[#0B1B32]">M-Pesa Payment</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#0B1B32] mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g., 0712345678"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full rounded-xl border border-white/30 px-4 py-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-[#0B1B32]"
                        />
                        <p className="text-sm text-[#0B1B32]/70 mt-1">
                          Enter your M-Pesa registered phone number
                        </p>
                      </div>

                      <div className="bg-[#F4F3EF]/80 border border-white/30 rounded-2xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Warning className="h-5 w-5 text-[#0B1B32]" />
                          <span className="font-semibold text-[#0B1B32]">Payment Instructions</span>
                        </div>
                        <p className="text-sm text-[#0B1B32]/80">
                          You will receive an M-Pesa prompt on your phone to complete the payment. 
                          Please have your M-Pesa PIN ready.
                        </p>
                      </div>

                      <button 
                        onClick={handlePayment}
                        disabled={processing || !phoneNumber}
                        className="w-full bg-[#0B1B32] text-white py-3 rounded-2xl font-medium hover:opacity-90 disabled:opacity-50 transition"
                      >
                        {processing ? 'Processing Payment...' : `Pay ${formatCurrency(totalAmount)}`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-white/30 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">✓</span>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-[#0B1B32] mb-4">Payment Successful!</h2>
                <p className="text-[#0B1B32]/70 mb-6">
                  Your tickets have been booked successfully. You will receive a confirmation SMS shortly.
                </p>

                <div className="bg-[#EBF0F6]/60 rounded-2xl p-4 mb-6">
                  <h3 className="font-semibold mb-2 text-[#0B1B32]">Booking Details</h3>
                  <div className="space-y-2 text-sm text-[#0B1B32]/80">
                    <div className="flex justify-between">
                      <span>Match:</span>
                      <span>{match.home_team} vs {match.away_team}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Seats:</span>
                      <span>{selectedSeats.map(s => s.number).join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount Paid:</span>
                      <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => navigate('/my-tickets')}
                    className="bg-[#0B1B32] text-white px-6 py-3 rounded-2xl font-medium hover:opacity-90 transition"
                  >
                    View My Tickets
                  </button>
                  <button 
                    onClick={() => navigate('/matches')}
                    className="bg-white/80 border border-[#0B1B32] text-[#0B1B32] px-6 py-3 rounded-2xl font-medium hover:bg-[#EBF0F6] transition"
                  >
                    Book More Tickets
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Booking
