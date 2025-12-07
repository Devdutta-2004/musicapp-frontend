import React from 'react';
import { X, Music, Clock } from 'lucide-react';

export default function PlanetCard({ user, onClose }) {
  if (!user) return null;

  // 1. Map user's planet type to your image files
  const getPlanetImage = (type) => {
    switch (type) {
      case 'Gas Giant': return '/planets/gas-giant.png';
      case 'Ice World': return '/planets/ice-world.png';
      case 'Volcanic':  return '/planets/volcanic.png';
      default:          return '/planets/nebula.png'; // Everyone starts here
    }
  };

  const planetImage = getPlanetImage(user.planetType);

  return (
    <div style={overlayStyle}>
      <div style={cardContainerStyle} className="card-pop-in">
        
        {/* Close Button */}
        <button onClick={onClose} style={closeBtnStyle}><X size={24} /></button>

        {/* THE ART CARD (Your Photoshop Design) */}
        <img 
          src={planetImage} 
          alt={user.planetType} 
          style={{ width: '100%', borderRadius: '16px', display: 'block' }} 
          onError={(e) => e.target.src = '/planets/nebula.png'} // Fallback if image missing
        />

        {/* OVERLAY STATS (Floating on top of your art) */}
        <div style={statsOverlayStyle}>
            <h2 style={{ margin: 0, fontSize: '1.8rem', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              {user.username}
            </h2>
            <div style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '15px' }}>
               {user.planetName || "Unknown System"}
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
                <div style={badgeStyle}>
                    <Clock size={14} /> 
                    <span>{user.totalMinutesListened || 0}m explored</span>
                </div>
            </div>
        </div>

      </div>

      <style>{`
        .card-pop-in { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

// --- CSS STYLES ---
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
  zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const cardContainerStyle = {
  position: 'relative',
  width: '320px', 
  background: 'transparent',
  borderRadius: '16px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
};

const closeBtnStyle = {
  position: 'absolute', top: '-40px', right: 0, background: 'rgba(255,255,255,0.1)',
  border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', padding: '8px'
};

const statsOverlayStyle = {
  position: 'absolute', bottom: 0, left: 0, right: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0))',
  padding: '20px', borderRadius: '0 0 16px 16px', color: 'white'
};

const badgeStyle = {
  background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
  padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem',
  display: 'flex', alignItems: 'center', gap: '6px'
};
