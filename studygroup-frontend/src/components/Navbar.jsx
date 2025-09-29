import { Link } from 'react-router-dom'
import { useAuth } from '../context/Useauth'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="sg-navbar">
      <style>
        {`
        .sg-navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 10px 16px;
          background: rgba(255,255,255,0.75);
          backdrop-filter: saturate(180%) blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .sg-nav-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .sg-link {
          color: #1f2937;
          text-decoration: none;
          font-weight: 600;
          padding: 8px 10px;
          border-radius: 8px;
          transition: color 120ms ease, background 120ms ease, transform 120ms ease;
        }
        .sg-link:hover { background: #eef2ff; color: #1e40af; }
        .sg-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
        .sg-user { color: #374151; font-size: 14px; }
        .sg-btn {
          border: none;
          padding: 8px 12px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
        }
        .sg-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(59,130,246,0.28); filter: brightness(1.03); }
        .sg-auth-link { color: #1f2937; background: #f3f4f6; }
        .sg-auth-link:hover { background: #e5e7eb; }

        /* Responsive */
        @media (max-width: 640px) {
          .sg-nav-inner { flex-wrap: wrap; gap: 8px; }
          .sg-right { width: 100%; justify-content: flex-end; }
        }
        `}
      </style>
      <div className="sg-nav-inner">
        <Link className="sg-link" to="/dashboard">Dashboard</Link>
        <Link className="sg-link" to="/groups">Groups</Link>
        <Link className="sg-link" to="/chat">Chat</Link>
        <Link className="sg-link" to="/calendar">Calendar</Link>

        <span className="sg-right">
          {user ? (
            <>
              <span className="sg-user">Hi, {user.name || user.email}</span>
              <Link className="sg-link" to="/profile">Profile</Link>
              <button className="sg-btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="sg-link sg-auth-link" to="/login">Login</Link>
              <Link className="sg-link sg-auth-link" to="/register">Register</Link>
            </>
          )}
        </span>
      </div>
    </nav>
  )
}
