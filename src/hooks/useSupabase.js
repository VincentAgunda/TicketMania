import { useState, useEffect } from 'react'
import { supabase, supabaseHelpers } from '../lib/supabase'

// Custom hook for matches
export const useMatches = () => {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseHelpers.getMatches()
      if (error) throw error
      setMatches(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { matches, loading, error, refetch: fetchMatches }
}

// Custom hook for user tickets
export const useUserTickets = (userId) => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userId) {
      fetchTickets()
    }
  }, [userId])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseHelpers.getUserTickets(userId)
      if (error) throw error
      setTickets(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { tickets, loading, error, refetch: fetchTickets }
}

// Custom hook for real-time subscriptions
export const useRealtime = (table, filter = {}) => {
  const [data, setData] = useState([])

  useEffect(() => {
    const subscription = supabase
      .channel('public:' + table)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          ...filter
        },
        (payload) => {
          setData(currentData => {
            // Handle real-time updates based on event type
            switch (payload.eventType) {
              case 'INSERT':
                return [...currentData, payload.new]
              case 'UPDATE':
                return currentData.map(item => 
                  item.id === payload.new.id ? payload.new : item
                )
              case 'DELETE':
                return currentData.filter(item => item.id !== payload.old.id)
              default:
                return currentData
            }
          })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [table, filter])

  return data
}