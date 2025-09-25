import React from 'react'
import { Link } from 'react-router-dom'
import {
  SportsSoccer,
  CalendarToday,
  LocationOn,
  ConfirmationNumber,
} from '@mui/icons-material'
import { formatDate, formatCurrency } from '../utils/helpers'

// Pastel shades with transparency for glassmorphism
const shades = [
  '#f5f5f7cc', // light gray
  '#eaf6fbcc', // soft blue
  '#fdf2f8cc', // soft pink
  '#f0fdf4cc', // soft green
  '#fefce8cc', // soft yellow
]

const MatchCard = ({ match, onBookClick, shadeIndex = 0 }) => {
  const {
    id,
    home_team,
    away_team,
    match_date,
    venue,
    ticket_price,
    available_seats,
    total_seats,
  } = match

  const availabilityPercentage = (available_seats / total_seats) * 100
  const isSoldOut = available_seats === 0

  return (
    <div
      className="rounded-3xl shadow-md hover:shadow-lg 
                 border border-white/40 p-6 
                 transition-all duration-300"
      style={{
        background: shades[shadeIndex % shades.length],
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      {/* Date & Venue */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-[#26415E] text-sm space-x-2">
          <CalendarToday fontSize="small" />
          <span>
            {formatDate(match_date, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center text-[#26415E] text-sm space-x-1">
          <LocationOn fontSize="small" />
          <span>{venue}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-center flex-1">
          <SportsSoccer className="mx-auto text-[#0B1B32]" fontSize="large" />
          <h3 className="mt-2 font-semibold text-[#0B1B32]">{home_team}</h3>
        </div>
        <div className="px-4 text-[#26415E] font-medium">vs</div>
        <div className="text-center flex-1">
          <SportsSoccer className="mx-auto text-[#0B1B32]" fontSize="large" />
          <h3 className="mt-2 font-semibold text-[#0B1B32]">{away_team}</h3>
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        {!isSoldOut ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#26415E]">
              <span>Seats Left</span>
              <span>{available_seats}</span>
            </div>
            <div className="w-full bg-gray-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-[#0B1B32] transition-all"
                style={{ width: `${availabilityPercentage}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center text-red-600 font-medium">Sold Out</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-[#26415E] text-sm">
          <ConfirmationNumber fontSize="small" />
          <span className="ml-1">From {formatCurrency(ticket_price)}</span>
        </div>
        {!isSoldOut && (
          <Link
            to={`/booking/${id}`}
            onClick={() => onBookClick && onBookClick(match)}
            className="px-4 py-2 rounded-full text-sm font-medium
                       bg-white/40 text-[#0B1B32] backdrop-blur-md border border-white/50
                       hover:bg-white/60 transition"
          >
            Book
          </Link>
        )}
      </div>
    </div>
  )
}

export default MatchCard
