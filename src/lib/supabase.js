import { createClient } from '@supabase/supabase-js'

// Log environment variables for debugging (remove in production)
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing')

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Test connection on startup
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('matches').select('count')
    if (error) throw error
    console.log('Supabase connection successful')
    return true
  } catch (error) {
    console.error('Supabase connection failed:', error)
    return false
  }
}

// Enhanced helper functions with better error handling
export const supabaseHelpers = {
  // Auth functions
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error }
    }
  },

  // Data functions with proper error handling
  async getMatches() {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true })
      
      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching matches:', error)
      return { data: [], error }
    }
  },

  async getMatchById(id) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', id)
        .single()
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async getTicketsByMatch(matchId) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('match_id', matchId)
      
      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  },

  async getUserTickets(userId) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          matches (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  },

  async createTicket(ticketData) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert([ticketData])
        .select()
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async updateMatchSeats(matchId, newAvailableSeats) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update({ available_seats: newAvailableSeats })
        .eq('id', matchId)
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Admin functions
  async createMatch(matchData) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([matchData])
        .select()
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async updateMatch(matchId, updateData) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId)
        .select()
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async deleteMatch(matchId) {
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)
      
      return { error }
    } catch (error) {
      return { error }
    }
  },

  // Ticket management functions
  async getAllTicketsWithMatches() {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          matches (*)
        `)
        .order('created_at', { ascending: false })
      
      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  },

  async getAllTickets() {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
      
      return { data: data || [], error }
    } catch (error) {
      return { data: [], error }
    }
  },

  async updateTicketStatus(ticketId, status) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', ticketId)
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Additional utility functions
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    } catch (error) {
      return { user: null, error }
    }
  },

  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email)
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async updateUserProfile(updates) {
    try {
      const { data, error } = await supabase.auth.updateUser(updates)
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}