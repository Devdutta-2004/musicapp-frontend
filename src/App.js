import React, { useState, useEffect } from "react";
import './index.css'; // Keep your global styles
import MusicApp from "./components/MusicApp";
import Login from "./components/Login"; // We will create this next

function App() {
  // 1. Check if user is already logged in (saved in browser memory)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('astronote_user');
    return saved ? JSON.parse(saved) : null;
  });

  // 2. Function to handle when a user logs in
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('astronote_user', JSON.stringify(userData));
  };

  // 3. Function to handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('astronote_user');
  };

  // 4. The Gatekeeper Logic
  return (
    <div className="App">
      {!user ? (
        // If NO user, show Login Screen
        <Login onLogin={handleLogin} />
      ) : (
        // If user EXISTS, show Music App (and pass user info)
        <MusicApp user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
