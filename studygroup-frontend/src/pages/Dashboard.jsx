// src/pages/Dashboard.jsx
import React from "react";
// 🚨 CORRECTION: Use curly braces {} for the named export 'useAuth'
import { useAuth } from "../context/Useauth"; 

export default function Dashboard() {
  // Destructure the user from the hook
  const { user } = useAuth();

  return (
    <div>
      <h2>Dashboard</h2>
      {/* Safely display user info if available */}
      <p>Welcome {user?.name || user?.email}</p>
    </div>
  );
}