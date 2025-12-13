import React, { useState } from "react";
import axios from "axios";
import { PlayCircle, Trash2, Plus, ListMusic } from "lucide-react";

// Get API URL correctly
const API_BASE = (process.env.REACT_APP_API_BASE_URL || "https://musicapp-o3ow.onrender.com").replace(/\/$/, "");

export default function PlaylistPanel({ playlists = [], onRefresh, onPlayPlaylist, user }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Auth headers for API calls
  const authHeaders = { headers: { "X-User-Id": user?.id || 0 } };

  const create = async () => {
    if (!name.trim()) return alert('Enter a cosmic name for your playlist');
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/playlists`, { name }, authHeaders);
      setName('');
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
      alert('Failed to create playlist. Check connection.');
    }
    setLoading(false);
  };

  const deletePlaylist = async (id) => {
    if(!window.confirm("Destroy this world (playlist)?")) return;
    try {
        await axios.delete(`${API_BASE}/api/playlists/${id}`, authHeaders);
        if (onRefresh) onRefresh();
    } catch(e) { console.error(e); }
  }

  return (
    <div style={{ marginTop: 20 }}>
      {/* CREATION BAR */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
            <ListMusic size={18} style={{ position: 'absolute', top: 12, left: 12, color: 'rgba(255,255,255,0.5)' }}/>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="New Galaxy Name..."
              className="glass-input"
              style={{ width: '100%', paddingLeft: 40 }}
              onKeyDown={(e) => e.key === 'Enter' && create()}
            />
        </div>
        <button 
            className="glass-btn" 
            onClick={create} 
            disabled={loading}
            style={{ width: 'auto', padding: '0 15px', display:'flex', alignItems:'center', gap:5 }}
        >
            <Plus size={20}/>
            {loading ? '...' : 'Create'}
        </button>
      </div>

      {/* LIST OF PLAYLISTS */}
      <div className="list-vertical">
        {playlists.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: 20 }}>
                <p>No playlists yet.</p>
                <p style={{ fontSize: '0.8rem' }}>Create one to start your collection.</p>
            </div>
        ) : (
            playlists.map(pl => (
              <div key={pl.id} className="glass-row">
                <div className="row-info">
                    <div className="row-title" style={{ fontSize: '1rem' }}>{pl.name}</div>
                    <div className="row-artist" style={{ fontSize: '0.8rem' }}>{pl.songCount || 0} songs</div>
                </div>

                <div className="row-actions">
                  <button 
                    className="icon-btn" 
                    title="Play Playlist"
                    onClick={() => onPlayPlaylist && onPlayPlaylist(pl)}
                  >
                    <PlayCircle size={20} color="#00ffff" />
                  </button>
                  
                  <button 
                    className="icon-btn" 
                    title="Delete Playlist"
                    onClick={() => deletePlaylist(pl.id)}
                  >
                    <Trash2 size={18} color="#ff4466" />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
