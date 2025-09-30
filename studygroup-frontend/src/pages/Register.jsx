import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [academicDetails, setAcademicDetails] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    if (confirmPassword !== password) errs.confirmPassword = "Passwords do not match";
    if (!academicDetails.trim()) errs.academicDetails = "Academic details are required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { name, email, password, academic_details: academicDetails };
      // Some Spring Boot backends return token on register, some don't. Handle both.
      const res = await registerUser(payload);
      const { token } = res.data || {};
      if (token) {
        localStorage.setItem("token", token);
        // Optional immediate avatar upload if provided
        if (avatar) {
          try {
            const formData = new FormData();
            formData.append("avatar", avatar);
            await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/users/me/avatar", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });
          } catch {}
        }
        navigate("/dashboard");
      } else {
        alert("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "Registration failed";
      if (String(message).toLowerCase().includes("email") && String(message).toLowerCase().includes("exist")) {
        setFieldErrors((p) => ({ ...p, email: "Email already exists" }));
      }
      setError(message);
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
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
        }
        .auth-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(5,150,105,0.35);
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
        <h2 className="auth-title">Register</h2>
        <p className="auth-subtitle">Create your account to get started.</p>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          <input
            className="auth-input"
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            name="name"
            autoComplete="off"
            spellCheck={false}
          />
          {fieldErrors.name && <span style={{ color: '#b91c1c', fontSize: 12 }}>{fieldErrors.name}</span>}

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
          {fieldErrors.email && <span style={{ color: '#b91c1c', fontSize: 12 }}>{fieldErrors.email}</span>}

          <input
            className="auth-input"
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            autoComplete="off"
            spellCheck={false}
          />
          {fieldErrors.password && <span style={{ color: '#b91c1c', fontSize: 12 }}>{fieldErrors.password}</span>}

          <input
            className="auth-input"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            name="confirmPassword"
            autoComplete="off"
            spellCheck={false}
          />
          {fieldErrors.confirmPassword && <span style={{ color: '#b91c1c', fontSize: 12 }}>{fieldErrors.confirmPassword}</span>}

          <input
            className="auth-input"
            type="text"
            placeholder="Academic details (e.g., CS, Year 2)"
            value={academicDetails}
            onChange={(e) => setAcademicDetails(e.target.value)}
            name="academic_details"
            autoComplete="off"
            spellCheck={false}
          />
          {fieldErrors.academicDetails && <span style={{ color: '#b91c1c', fontSize: 12 }}>{fieldErrors.academicDetails}</span>}

          <input
            className="auth-input"
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
            name="avatar"
          />

          <button className="auth-button" type="submit" disabled={submitting}>{submitting ? "Registering..." : "Register"}</button>
        </form>
      </div>
    </div>
  );
}
