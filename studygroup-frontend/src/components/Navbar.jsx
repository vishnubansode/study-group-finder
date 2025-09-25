import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav style={{ padding: 10, borderBottom: '1px solid #ddd' }}>
      <Link to="/dashboard" style={{ marginRight: 10 }}>
        Dashboard
      </Link>
      <Link to="/groups" style={{ marginRight: 10 }}>
        Groups
      </Link>
      <Link to="/chat" style={{ marginRight: 10 }}>
        Chat
      </Link>
      <Link to="/calendar" style={{ marginRight: 10 }}>
        Calendar
      </Link>

      <span style={{ float: 'right' }}>
        {user ? (
          <>
            <span style={{ marginRight: 8 }}>Hi, {user.name || user.email}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: 8 }}>
              Login
            </Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </span>
    </nav>
  )
}
