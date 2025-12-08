import React, { useRef, useState, useEffect } from 'react';
import { X, Sparkles, Clock, Music2, Quote, Share2 } from 'lucide-react';

export default function PlanetCard({ user, onClose }) {
  
  const [isFlipped, setIsFlipped] = useState(false); 
  const [isSharing, setIsSharing] = useState(false); 
  const [libLoaded, setLibLoaded] = useState(false); // Track if library is ready
  const cardRef = useRef(null); 

  // --- 1. DYNAMICALLY LOAD HTML2CANVAS FROM CDN ---
  // This allows us to use the library without npm install
  useEffect(() => {
    if (window.html2canvas) {
      setLibLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    script.onload = () => setLibLoaded(true);
    document.body.appendChild(script);
    // Cleanup not strictly necessary here as it loads once per session
  }, []);

  const handleFlip = (e) => {
    // Prevent flip if clicking buttons
    if (e.target.closest('button') || e.target.closest('.share-button')) return;
    if (!isFlipped) setIsFlipped(true);
  };

  // --- SNAPSHOT SHARE WITH MIRROR FIX ---
  const handleShare = async () => {
    // Ensure everything is ready
    if (!cardRef.current || isSharing || !window.html2canvas) return;
    
    setIsSharing(true);

    try {
      // --- THE MIRROR FIX IS HERE (onclone) ---
      const canvas = await window.html2canvas(cardRef.current, {
        backgroundColor: null, // Transparent background
        scale: 2, // Better quality
        useCORS: true, // Allow external images
        // This function runs on a cloned version of the element BEFORE screenshot
        onclone: (clonedDoc) => {
           // Find the captured element within the cloned document
           const clonedElement = clonedDoc.querySelector('.card-face.front');
           if (clonedElement) {
             // Forcefully remove the rotation so the image isn't mirrored
             clonedElement.style.transform = 'none';
             // Ensure it's visible to the capture engine
             clonedElement.style.backfaceVisibility = 'visible'; 
           }
        }
      });

      // Convert canvas to a file blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'my-planet-card.png', { type: 'image/png' });

      const details = getPlanetDetails(user.planetType);
    const shareData = {
          files: [file],
          title: 'My Cosmic Music Profile',
          // Restores your original promotional text
          text: `My music taste has evolved into the ${details.title} (${details.tarotName})! Find out what kind of planet your listening habits create on the Music App.`,
          url: window.location.href // Adds the link to the text body
      };

      // Use native sharing if available (Mobile)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
      } else {
        // Fallback for Desktop: Download the image
        const link = document.createElement('a');
        link.download = `My-Planet-${user.username}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        // Optional: also copy text to clipboard as fallback
        if(navigator.clipboard) {
            await navigator.clipboard.writeText(shareData.text + " " + window.location.href);
             alert("Image saved! Share text copied to clipboard.");
        } else {
             alert("Image saved to downloads!");
        }
      }
    } catch (error) {
      console.error('Error generateing card image:', error);
      alert("Could not generate image right now. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  if (!user) return null;

  // --- LORE SYSTEM (Unchanged) ---
  const getPlanetDetails = (type) => {
    switch (type) {
      case 'Volcanic': return { image: '/planets/volcanic.png', tarotName: 'IV. THE FORGE', title: 'Volcanic Core', desc: "Forged in the intense heat of Rock & Metal. Your soul thrives on energy, power, and raw emotion.", color: '#ff4d4d', accent: 'linear-gradient(45deg, #ff4d4d, #ffae00)' };
      case 'Gas Giant': return { image: '/planets/gas-giant.png', tarotName: 'X. THE NEON MIST', title: 'Gas Giant', desc: "Formed by the rhythm of Pop & Dance. Your world is vibrant, energetic, and constantly in motion.", color: '#ff00cc', accent: 'linear-gradient(45deg, #ff00cc, #3333ff)' };
      case 'Ice World': return { image: '/planets/ice-world.png', tarotName: 'II. THE GLACIER', title: 'Ice Tundra', desc: "Frozen in the calm of Lo-Fi & Classical. A sanctuary of focus, clarity, and deep thought.", color: '#00e5ff', accent: 'linear-gradient(45deg, #00e5ff, #2979ff)' };
      case 'Metallic': return { image: '/planets/metallic.png', tarotName: 'VIII. THE MACHINE', title: 'Chrome City', desc: "Constructed by the flow of Hip-Hop & Electronic. A world of structure, rhythm, and heavy bass.", color: '#c0c0c0', accent: 'linear-gradient(45deg, #e0e0e0, #757575)' };
      case 'Plasma World': return { image: '/planets/plasma.png', tarotName: 'XI. THE FUSION', title: 'Plasma Reactor', desc: "A volatile mix of Rock heat and Pop energy. Your taste is intense, bright, and explosive.", color: '#FF5F1F', accent: 'linear-gradient(45deg, #FF0000, #FF00CC)' };
      case 'Steam World': return { image: '/planets/steam.png', tarotName: 'XIV. THE ALCHEMY', title: 'Geothermal World', desc: "Where Fire meets Ice. A complex balance of intense energy and deep calm.", color: '#00ffa2', accent: 'linear-gradient(45deg, #ff4d4d, #00e5ff)' };
      case 'Cyberpunk': return { image: '/planets/cyberpunk.png', tarotName: 'XXI. THE NEOPOLIS', title: 'Neon Chrome', desc: "The intersection of Pop vibrance and Hip-Hop structure. A futuristic, glowing cityscape.", color: '#9d00ff', accent: 'linear-gradient(45deg, #ff00cc, #00ffff)' };
      case 'Forest World': return { image: '/planets/forest.png', tarotName: 'III. THE EMPRESS', title: 'Verdant Garden', desc: "A blooming sanctuary created by the mix of Pop energy and Lo-Fi calm. Life thrives here.", color: '#2ecc71', accent: 'linear-gradient(45deg, #2ecc71, #a8e063)' };
      default: return { image: '/planets/nebula.png', tarotName: '0. THE BEGINNING', title: 'Stardust Nebula', desc: "A swirling cloud of infinite potential. Your musical identity is still forming.", color: '#a855f7', accent: 'linear-gradient(45deg, #a855f7, #6366f1)' };
    }
  };

  const details = getPlanetDetails(user.planetType);

  return (
    <div style={overlayStyle}>
      <div className={`flip-container ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
        <div className="flipper">
           {/* Back Card */}
           <div className="card-face back">
             <div className="back-content">
               <button onClick={onClose} className="close-btn back-btn"><X size={24} color="#888" /></button>
               <Sparkles size={48} color="#a855f7" className="tarot-sparkle" />
               <h1>Tap to Reveal Your Cosmic Destiny</h1>
               <p>Processing {user.username}'s music energy...</p>
             </div>
           </div>

           {/* Front Card - Ref attached here for capture */}
           <div className="card-face front" ref={cardRef}>
             {/* data-html2canvas-ignore hides this button in the screenshot */}
             <button onClick={onClose} className="close-btn front-btn" data-html2canvas-ignore>
                <X size={24} color="white" />
             </button>
             
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
               {/* Scrollable lore box */}
               <div className="lore-box">
                 <Quote size={12} className="quote-icon" style={{ color: details.color }}/>
                 <p>{details.desc}</p>
               </div>

               <div className="stats-row">
                 <div className="stat-group">
                    <div className="stat"><Clock size={12} color="#888"/><span>{user.totalMinutesListened || 0}m</span></div>
                    <div className="stat"><Music2 size={12} color="#888"/><span>Lvl {(user.totalMinutesListened / 60).toFixed(1)}</span></div>
                 </div>
                 
                 {/* Share Button - Shows spinner when generating */}
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
        /* --- CSS (Includes layout fixes) --- */
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
        /* Layout Fixes: Fixed size art frame and scrollable lore */
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
