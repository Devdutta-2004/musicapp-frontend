import React, { useState } from 'react';
import axios from 'axios';
import { Rocket, Star, ArrowRight } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const payload = { username, password };

    try {
      // Use the Base URL from your environment or default to local
      const API = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');
      const res = await axios.post(`${API}${endpoint}`, payload);
      
      // If successful, pass the user data up to App.js
      if (res.data) {
          onLogin(res.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Connection failed. Is the server awake?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #1a1a2e 0%, #000 100%)',
      color: 'white'
    }}>
      <div className="login-card" style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        
        <div style={{ marginBottom: 20 }}>
          <div style={{ 
            background: 'linear-gradient(45deg, #ff00cc, #3333ff)', 
            width: 60, height: 60, borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 15px' 
          }}>
            <Rocket size={32} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Astronote</h1>
          <p style={{ color: '#888', marginTop: 5 }}>
            {isRegistering ? 'Join the Galaxy' : 'Welcome back, Traveler'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
            required
          />

          {error && <div style={{ color: '#ff4444', fontSize: '0.9rem' }}>{error}</div>}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Igniting Engines...' : (isRegistering ? 'Launch Rocket' : 'Enter Orbit')}
            {!loading && <ArrowRight size={18} style={{ marginLeft: 8 }} />}
          </button>
        </form>

        <div style={{ marginTop: 20, fontSize: '0.9rem', color: '#aaa' }}>
          {isRegistering ? 'Already have a planet?' : 'New to the galaxy?'}
          <span 
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
            style={{ color: '#3333ff', cursor: 'pointer', marginLeft: 6, fontWeight: 'bold' }}
          >
            {isRegistering ? 'Login' : 'Create Account'}
          </span>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid #333',
  padding: '12px 16px',
  borderRadius: '8px',
  color: 'white',
  outline: 'none',
  fontSize: '1rem'
};

const buttonStyle = {
  background: 'linear-gradient(90deg, #ff00cc, #3333ff)',
  border: 'none',
  padding: '12px',
  borderRadius: '8px',
  color: 'white',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 10
};
