import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!email.trim() || !password) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) {
      setError("Enter a valid email and password");
      return;
    }
    setSubmitting(true);
    try {
      const res = await loginUser({ email, password });
      const token = res.data?.token;
      if (!token) throw new Error("No token returned");
      if (remember) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }
      alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <style>
        {`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%);
          padding: 24px;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          padding: 28px;
          transition: transform 200ms ease, box-shadow 200ms ease;
        }
        .auth-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(0,0,0,0.10);
        }
        .auth-title {
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }
        .auth-subtitle {
          margin: 0 0 18px 0;
          font-size: 14px;
          color: #6b7280;
        }
        .auth-error {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 12px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .auth-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          font-size: 14px;
          color: #111827;
          text-align: left;
          outline: none;
          transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease;
        }
        .auth-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.15);
          background: #ffffff;
        }
        .auth-button {
          margin-top: 6px;
          padding: 12px 16px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
        }
        .auth-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(37,99,235,0.35);
          filter: brightness(1.03);
        }
        .auth-button:active {
          transform: translateY(0);
          box-shadow: none;
          filter: brightness(0.98);
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .auth-container { padding: 16px; }
          .auth-card { padding: 20px; border-radius: 14px; }
          .auth-title { font-size: 20px; }
          .auth-subtitle { font-size: 13px; }
          .auth-input { padding: 11px 12px; font-size: 13px; }
          .auth-button { padding: 11px 14px; font-size: 13px; }
        }
        @media (min-width: 768px) {
          .auth-card { max-width: 480px; padding: 32px; }
          .auth-title { font-size: 26px; }
        }
        `}
      </style>
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        <p className="auth-subtitle">Welcome back! Please enter your details.</p>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="email"
            autoComplete="off"
            inputMode="email"
            spellCheck={false}
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            autoComplete="off"
            spellCheck={false}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <button className="auth-button" type="submit" disabled={submitting}>{submitting ? "Logging in..." : "Login"}</button>
        </form>
      </div>
    </div>
  );
}
