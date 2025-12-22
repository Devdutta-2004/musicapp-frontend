import React, { useEffect, useRef, useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1, Heart, 
  ChevronDown, MoreHorizontal, Timer, Moon
} from "lucide-react";
import '../App.css';

export default function Player({
  song,
  playing,
  onToggle,
  onToggleLike,
  onNext,
  onPrev,
  onEnded, 
  repeatMode = 'off',
  onToggleRepeat,
  shuffle = false,
  onToggleShuffle,
  onProgress, 
  sleepTime,       
  onSetSleepTimer,
  onMinimize 
}) {
  const audioRef = useRef(null);
  const rangeRef = useRef(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [buffering, setBuffering] = useState(false); // New Buffering State

  const onProgressRef = useRef(onProgress);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

  // Handle Play/Pause when 'playing' prop changes
  useEffect(() => {
    if (audioRef.current) {
      if (playing) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Playback prevented:", error);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
        setDuration(audioRef.current.duration);
    }
    updateMediaSessionPosition();
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      const c = audioRef.current.currentTime;
      const d = audioRef.current.duration;
      setTime(c);
      if (onProgressRef.current) onProgressRef.current(c, d);
      updateRangeBackground(c, d);
      if (Math.floor(c) !== Math.floor(time)) updateMediaSessionPosition();
    }
  };

  // UPDATED: Uses CSS variable to allow multiple background layers (progress + buffering)
  const updateRangeBackground = (c, d) => {
    if (rangeRef.current) {
        const percent = (c / d) * 100 || 0;
        rangeRef.current.style.setProperty('--seek-pos', `${percent}%`);
    }
  };

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    setTime(newTime);
    updateRangeBackground(newTime, duration);
    if (audioRef.current) {
        audioRef.current.currentTime = newTime;
    }
    updateMediaSessionPosition();
  };

  const updateMediaSessionPosition = () => {
    if ('mediaSession' in navigator && audioRef.current) {
      const audio = audioRef.current;
      if (!isFinite(audio.duration) || !isFinite(audio.currentTime)) return;
      try {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate,
          position: audio.currentTime,
        });
      } catch (e) { console.error(e); }
    }
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  const handleAudioEnded = () => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      onEnded(); 
    }
  };

  return (
    <div className="player-container">
      {/* INJECTED STYLES for Centering Fix + Buffering Animation 
          (This ensures it works without editing external CSS files)
      */}
      <style>{`
        /* 1. Fix Center Alignment */
        .progress-section {
          display: flex !important;
          flex-direction: column;
          justify-content: center;
          height: auto;
          min-height: 40px; /* Ensure enough touch space */
        }
        
        .seek-slider {
          align-self: center; /* Forces horizontal center if column */
          margin: 10px 0 !important; /* Balanced margins */
          
          /* Prepare for CSS Variable usage */
          background-image: linear-gradient(90deg, var(--cloud-blue), var(--cloud-pink));
          background-size: var(--seek-pos, 0%) 100%;
          background-repeat: no-repeat;
        }

        /* 2. Buffering Animation Class */
        .seek-slider.buffering-active {
          background-image: 
            linear-gradient(90deg, var(--cloud-blue), var(--cloud-pink)), /* Layer 1: Progress */
            repeating-linear-gradient(
              45deg, 
              rgba(255,255,255,0.1) 0px, 
              rgba(255,255,255,0.1) 10px, 
              rgba(255,255,255,0.3) 10px, 
              rgba(255,255,255,0.3) 20px
            ); /* Layer 2: Stripes */
            
          background-size: var(--seek-pos, 0%) 100%, 200% 100%;
          animation: buffer-move 1s linear infinite;
        }

        @keyframes buffer-move {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 0 0, -28px 0; }
        }
      `}</style>
      
      {/* 1. TOP HEADER */}
      <div className="player-header-row">
          <button className="icon-btn" onClick={onToggleLike}>
            <Heart 
                size={24} 
                fill={song?.liked ? "#ff00cc" : "none"} 
                color={song?.liked ? "#ff00cc" : "rgba(255,255,255,0.7)"} 
            />
         </button>
          
          <div className="relative-menu-container">
              <button 
                className={`icon-btn ${sleepTime ? 'active-dot' : ''}`} 
                onClick={() => setShowMenu(!showMenu)}
              >
                  <Moon size={24} color="white"/>
              </button>

              {showMenu && (
                  <div className="glass-dropdown-menu">
                      <div className="menu-header">
                          <Timer size={14} /> <span>Sleep Timer</span>
                      </div>
                      <button className={`menu-option ${sleepTime === 15 ? 'active' : ''}`} onClick={() => { onSetSleepTimer(15); setShowMenu(false); }}>15 Minutes</button>
                      <button className={`menu-option ${sleepTime === 30 ? 'active' : ''}`} onClick={() => { onSetSleepTimer(30); setShowMenu(false); }}>30 Minutes</button>
                      <button className={`menu-option ${sleepTime === 60 ? 'active' : ''}`} onClick={() => { onSetSleepTimer(60); setShowMenu(false); }}>1 Hour</button>
                      <button className="menu-option danger" onClick={() => { onSetSleepTimer(null); setShowMenu(false); }}>Turn Off</button>
                  </div>
              )}
          </div>
      </div>

      {/* 2. PROGRESS BAR AREA */}
      <div className="progress-section">
          <input 
            type="range" 
            min="0" 
            max={duration || 0} 
            value={time} 
            className={`seek-slider ${buffering ? 'buffering-active' : ''}`} 
            ref={rangeRef}
            onChange={handleSeek}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
          />
          <div className="time-row">
             <span>{formatTime(time)}</span>
             <span>{formatTime(duration)}</span>
          </div>
      </div>

      {/* 3. CONTROLS AREA */}
      <div className="controls-row">
         <button className={`icon-btn ${shuffle ? 'active-dot' : ''}`} onClick={onToggleShuffle}>
            <Shuffle size={20} color={shuffle ? "#7c2cf2" : "white"} />
         </button>

         <button className="icon-btn" onClick={onPrev}>
            <SkipBack size={28} fill="white" />
         </button>

         <button className="play-btn-large" onClick={onToggle}>
            {playing ? <Pause size={32} fill="black"/> : <Play size={32} fill="black" style={{marginLeft:4}}/>}
         </button>

         <button className="icon-btn" onClick={onNext}>
            <SkipForward size={28} fill="white" />
         </button>

         <button className={`icon-btn ${repeatMode !== 'off' ? 'active-dot' : ''}`} onClick={onToggleRepeat}>
             {repeatMode === 'one' ? <Repeat1 size={20} color="#7c2cf2"/> : <Repeat size={20} color={repeatMode === 'all' ? "#00ff88" : "white"}/>}
         </button>
      </div>

      {/* Hidden Audio Element with Buffering Events */}
      <audio
        ref={audioRef}
        src={song?.streamUrl} 
        autoPlay={playing}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        // BUFFFERING LOGIC
        onWaiting={() => setBuffering(true)} 
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
      />
    </div>
  );
}
