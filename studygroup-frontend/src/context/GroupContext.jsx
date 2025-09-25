/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react'
import api from '../services/api'

const GroupContext = createContext()

export function GroupProvider({ children }) {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/groups')
      .then((res) => setGroups(res.data || []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false))
  }, [])

  const refresh = () => {
    setLoading(true)
    api
      .get('/groups')
      .then((res) => setGroups(res.data || []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false))
  }

  return (
    <GroupContext.Provider value={{ groups, loading, refresh }}>
      {children}
    </GroupContext.Provider>
  )
}

export const useGroups = () => useContext(GroupContext)
