import { APP_CONFIG } from './constants'

// Format currency for Kenya Shillings
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(amount)
}

// Format date and time
export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString)
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  
  return date.toLocaleDateString('en-KE', { ...defaultOptions, ...options })
}

// Generate seat map data
export const generateSeatMap = (totalSeats, bookedSeats = []) => {
  const { rows, seatsPerRow, vipRows, premiumRows } = APP_CONFIG.stadium
  const seats = []

  for (let row = 1; row <= rows; row++) {
    for (let seat = 1; seat <= seatsPerRow; seat++) {
      const seatNumber = `${String.fromCharCode(64 + row)}${seat}`
      let type = 'STANDARD'
      
      if (vipRows.includes(row)) type = 'VIP'
      if (premiumRows.includes(row)) type = 'PREMIUM'

      const isBooked = bookedSeats.includes(seatNumber)

      seats.push({
        number: seatNumber,
        row,
        seat,
        type,
        priceMultiplier: APP_CONFIG.seatTypes[type].priceMultiplier,
        color: APP_CONFIG.seatTypes[type].color,
        available: !isBooked
      })
    }
  }

  return seats
}

// Calculate ticket price based on seat type and base price
export const calculateTicketPrice = (basePrice, seatType) => {
  const multiplier = APP_CONFIG.seatTypes[seatType]?.priceMultiplier || 1
  return Math.round(basePrice * multiplier)
}

// Generate QR code data for tickets
export const generateQRData = (ticketId, matchId, seatNumber) => {
  return JSON.stringify({
    ticketId,
    matchId,
    seatNumber,
    timestamp: Date.now()
  })
}

// Validate phone number for M-Pesa
export const validatePhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  // Kenyan phone number validation (starts with 254, 10 digits)
  return /^254\d{9}$/.test(cleaned)
}

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 12 && cleaned.startsWith('254')) {
    return `+${cleaned}`
  }
  if (cleaned.length === 9 && cleaned.startsWith('7')) {
    return `+254${cleaned}`
  }
  return phone
}

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Check if user is admin (simple email-based check)
export const isAdminUser = (email) => {
  const adminDomains = ['@admin.com', '@footballtickets.com']
  return adminDomains.some(domain => email?.endsWith(domain))
}

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key))
    } catch {
      return null
    }
  },
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
  },
  remove: (key) => {
    localStorage.removeItem(key)
  }
}