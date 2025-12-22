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
  const [buffering, setBuffering] = useState(false);

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

  const updateRangeBackground = (c, d) => {
    if (rangeRef.current) {
        const percent = (c / d) * 100 || 0;
        // We set the CSS variable on the input, which inherits to the track pseudo-element
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
      {/* UPDATED STYLES: 
          1. Moves styles to ::-webkit-slider-runnable-track to allow border-radius (Curves!).
          2. Updates animation to cubic-bezier for "Fast then Slow" organic feel.
      */}
      <style>{`
        .progress-section {
          display: flex !important;
          flex-direction: column;
          justify-content: center;
          height: auto;
          min-height: 40px; 
        }

        /* 1. RESET INPUT */
        .seek-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          background: transparent; 
          cursor: pointer;
          margin: 0;
          height: 20px; /* Thumb height container */
        }

        /* 2. STYLE THE TRACK (WEBKIT) - Gives us Rounded Corners */
        .seek-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px; /* Line height */
          border-radius: 999px; /* CURVED EDGES */
          
          /* LAYERS: Shimmer, Progress, Base */
          background-image: 
            linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent),
            linear-gradient(90deg, var(--cloud-blue), var(--cloud-pink)),
            linear-gradient(rgba(255,255,255,0.15), rgba(255,255,255,0.15));
            
          background-size: 
            0% 100%, /* Hidden shimmer default */
            var(--seek-pos, 0%) 100%, 
            100% 100%;
            
          background-repeat: no-repeat;
          background-position: -100% center, left center, left center;
        }

        /* 3. STYLE THE THUMB (WEBKIT) */
        .seek-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px; width: 20px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          /* Center thumb on the 6px track: (6 - 20) / 2 = -7px */
          margin-top: -7px; 
          transition: transform 0.1s;
        }
        .seek-slider:active::-webkit-slider-thumb {
          transform: scale(1.2);
        }

        /* 4. FIREFOX SUPPORT (Duplicate styles required for separate vendor) */
        .seek-slider::-moz-range-track {
          width: 100%;
          height: 6px;
          border-radius: 999px;
          background-image: 
            linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent),
            linear-gradient(90deg, var(--cloud-blue), var(--cloud-pink)),
            linear-gradient(rgba(255,255,255,0.15), rgba(255,255,255,0.15));
          background-size: 0% 100%, var(--seek-pos, 0%) 100%, 100% 100%;
          background-repeat: no-repeat;
          background-position: -100% center, left center, left center;
        }
        .seek-slider::-moz-range-thumb {
          height: 20px; width: 20px;
          border-radius: 50%;
          background: white;
          border: none;
        }

        /* 5. BUFFERING ANIMATION - Organic Speed */
        /* Applied to WebKit Track */
        .seek-slider.buffering-active::-webkit-slider-runnable-track {
          /* fast-out, slow-in curve */
          animation: shimmer 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1); 
          background-size: 50% 100%, var(--seek-pos, 0%) 100%, 100% 100%;
        }
        /* Applied to Firefox Track */
        .seek-slider.buffering-active::-moz-range-track {
          animation: shimmer 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
          background-size: 50% 100%, var(--seek-pos, 0%) 100%, 100% 100%;
        }

        @keyframes shimmer {
          0% { background-position: -100% center, left center, left center; }
          100% { background-position: 200% center, left center, left center; }
        }
      `}</style>
      
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

      <audio
        ref={audioRef}
        src={song?.streamUrl} 
        autoPlay={playing}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        onLoadStart={() => setBuffering(true)}
        onWaiting={() => setBuffering(true)} 
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
      />
    </div>
  );
}
