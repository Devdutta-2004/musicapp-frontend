import React, { useRef, useState, useEffect } from 'react';
import { X, Sparkles, Clock, Music2, Quote, Share2, Download } from 'lucide-react';

// REMOVED: import html2canvas from 'html2canvas'; 

export default function PlanetCard({ user, onClose }) {
  
  const [isFlipped, setIsFlipped] = useState(false); 
  const [isSharing, setIsSharing] = useState(false); 
  const [libLoaded, setLibLoaded] = useState(false); // Track if library is ready
  const cardRef = useRef(null); 

  // --- 1. DYNAMICALLY LOAD HTML2CANVAS FROM CDN ---
  useEffect(() => {
    // Check if it's already loaded
    if (window.html2canvas) {
      setLibLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    script.onload = () => setLibLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Optional: Clean up script tag on unmount if you want
      // document.body.removeChild(script);
    };
  }, []);

  const handleFlip = (e) => {
    if (e.target.closest('button') || e.target.closest('.share-button')) return;
    if (!isFlipped) setIsFlipped(true);
  };

  const handleShare = async () => {
    // Ensure the library is loaded and element exists
    if (!cardRef.current || isSharing || !window.html2canvas) return;
    
    setIsSharing(true);

    try {
      // USE window.html2canvas INSTEAD OF IMPORT
      const canvas = await window.html2canvas(cardRef.current, {
        backgroundColor: null, 
        scale: 2, 
        useCORS: true, 
      });

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'my-planet-card.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Cosmic Music Profile',
          text: `I discovered my music planet on the Music App! 🌌`,
        });
      } else {
        const link = document.createElement('a');
        link.download = 'my-planet-card.png';
        link.href = canvas.toDataURL();
        link.click();
        alert("Image saved to downloads!");
      }
    } catch (error) {
      console.error('Error sharing card:', error);
      alert("Could not generate image. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  if (!user) return null;

  // ... (The rest of your getPlanetDetails function remains exactly the same) ...
  const getPlanetDetails = (type) => {
    // Paste your existing getPlanetDetails function here...
    switch (type) {
      case 'Volcanic': return { image: '/planets/volcanic.png', tarotName: 'IV. THE FORGE', title: 'Volcanic Core', desc: "Forged in the intense heat of Rock & Metal.", color: '#ff4d4d', accent: 'linear-gradient(45deg, #ff4d4d, #ffae00)' };
      // ... include all your other cases ...
      default: return { image: '/planets/nebula.png', tarotName: '0. THE BEGINNING', title: 'Stardust Nebula', desc: "A swirling cloud of infinite potential.", color: '#a855f7', accent: 'linear-gradient(45deg, #a855f7, #6366f1)' };
    }
  };

  const details = getPlanetDetails(user.planetType);

  return (
    <div style={overlayStyle}>
      {/* ... Your JSX Structure remains exactly the same ... */}
      
      {/* Just showing the Share Button part to confirm the logic */}
      <div className={`flip-container ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
        <div className="flipper">
           {/* ... Back Card ... */}
           <div className="card-face back">
             <div className="back-content">
               <button onClick={onClose} className="close-btn back-btn"><X size={24} color="#888" /></button>
               <Sparkles size={48} color="#a855f7" className="tarot-sparkle" />
               <h1>Tap to Reveal Your Cosmic Destiny</h1>
               <p>Processing {user.username}'s music energy...</p>
             </div>
           </div>

           {/* ... Front Card ... */}
           <div className="card-face front" ref={cardRef}>
             <button onClick={onClose} className="close-btn front-btn" data-html2canvas-ignore><X size={24} color="white" /></button>
             
             <div className="card-header">
               <Sparkles size={16} color={details.color} />
               <span style={{ letterSpacing: '3px', fontWeight: 'bold', color: details.color }}>{details.tarotName}</span>
               <Sparkles size={16} color={details.color} />
             </div>

             <div className="art-frame" style={{ borderColor: details.color }}>
               <img src={details.image} alt={details.title} className="planet-img" onError={(e) => e.target.src = '/planets/nebula.png'} crossOrigin="anonymous" />
               <div className="glow-effect" style={{ background: details.accent }}></div>
             </div>

             <div className="card-body">
               <h1 className="planet-title" style={{ background: details.accent, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{details.title}</h1>
               <div className="user-name">Explorer: {user.username}</div>
               <div className="divider" style={{ background: details.color }}></div>
               <div className="lore-box">
                 <Quote size={12} className="quote-icon" style={{ color: details.color }}/>
                 <p>{details.desc}</p>
               </div>

               <div className="stats-row">
                 <div className="stat-group">
                    <div className="stat"><Clock size={12} color="#888"/><span>{user.totalMinutesListened || 0}m</span></div>
                    <div className="stat"><Music2 size={12} color="#888"/><span>Lvl {(user.totalMinutesListened / 60).toFixed(1)}</span></div>
                 </div>
                 
                 {/* Share Button only appears if lib is loaded */}
                 {libLoaded && (
                   <div className="stat share-button" onClick={handleShare} data-html2canvas-ignore>
                     {isSharing ? <span className="animate-spin">⌛</span> : <Share2 size={14} color="#fff"/>}
                     <span>{isSharing ? '...' : 'Share'}</span>
                   </div>
                 )}
               </div>
             </div>
           </div>
        </div>
      </div>

      <style>{`
        /* ... PASTE YOUR EXISTING CSS STYLES HERE ... */
        .flip-container { width: 300px; height: 520px; position: relative; perspective: 1000px; cursor: pointer; animation: floatIn 0.5s ease-out; }
        .flipper { transition: 0.6s; transform-style: preserve-3d; position: relative; width: 100%; height: 100%; }
        .flip-container.flipped .flipper { transform: rotateY(180deg); }
        .card-face { position: absolute; top: 0; left: 0; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 20px; overflow: hidden; background: #0a0a0a; border: 1px solid #333; box-shadow: 0 0 40px rgba(0,0,0,0.8); display: flex; flex-direction: column; align-items: center; padding: 20px 16px; }
        .card-face::before { content: ''; position: absolute; top: 6px; left: 6px; right: 6px; bottom: 6px; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; pointer-events: none; }
        .card-face.front { transform: rotateY(180deg); }
        .card-face.back { justify-content: center; color: #aaa; }
        .back-content { text-align: center; padding: 40px; }
        .back-content h1 { font-size: 1.4rem; font-weight: 600; color: #d1d5db; margin-top: 15px; }
        .tarot-sparkle { animation: pulse 1.5s infinite; opacity: 0.8; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        .art-frame { width: 220px; height: 220px; border: 1px solid #333; border-radius: 50%; position: relative; overflow: hidden; margin-bottom: 16px; background: #000; flex-shrink: 0; }
        .planet-img { width: 100%; height: 100%; object-fit: cover; z-index: 2; position: relative; }
        .card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 0.75rem; margin-top: 10px; }
        .card-body { text-align: center; width: 100%; flex: 1; display: flex; flex-direction: column; min-height: 0; }
        .planet-title { font-size: 1.6rem; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 1px; line-height: 1.1; }
        .user-name { color: #666; font-size: 0.8rem; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px; }
        .divider { height: 1px; width: 40px; margin: 12px auto; opacity: 0.5; flex-shrink: 0; }
        .lore-box { font-style: italic; color: #ccc; font-size: 0.85rem; line-height: 1.4; margin-bottom: 12px; padding: 0 4px; position: relative; overflow-y: auto; max-height: 80px; }
        .quote-icon { position: absolute; top: -6px; left: -2px; opacity: 0.6; }
        .stats-row { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0 4px; font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-top: auto; background: rgba(0,0,0,0.2); border-radius: 12px; padding: 6px; }
        .stat-group { display: flex; gap: 8px; }
        .stat { display: flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 12px; white-space: nowrap; }
        .share-button { cursor: pointer; transition: background 0.2s; background: rgba(145, 70, 255, 0.2); color: white; border: 1px solid rgba(145, 70, 255, 0.4); }
        .share-button:hover { background: rgba(145, 70, 255, 0.4); }
        .animate-spin { animation: spin 1s linear infinite; display: inline-block; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .glow-effect { position: absolute; bottom: 0; left: 0; right: 0; height: 100px; opacity: 0.3; filter: blur(20px); z-index: 1; }
        .close-btn { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); border-radius: 50%; padding: 4px; border: none; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; }
        .close-btn:hover { background: rgba(255,255,255,0.1); }
        @keyframes floatIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
  zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
};
