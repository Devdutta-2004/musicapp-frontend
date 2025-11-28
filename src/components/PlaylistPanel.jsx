// PlaylistPanel.jsx
import React, {useState} from "react";
import axios from "axios";

export default function PlaylistPanel({playlists = [], onRefresh, onPlayPlaylist}) {
  const [name, setName] = useState('');

  const create = async () => {
    if(!name) return alert('Enter playlist name');
    try {
      await axios.post('/api/playlists', { name });
      setName('');
      if(onRefresh) onRefresh();
    } catch(e){ console.error(e); alert('Create failed'); }
  };

  const play = (pl) => {
    if(onPlayPlaylist) onPlayPlaylist(pl);
  };

  return (
    <div className="playlist-panel" style={{ marginTop: 12 }}>
      <div className="muted" style={{ marginBottom: 8 }}>Playlists</div>

      <div className="playlist-create" style={{ display: 'flex', gap: 8 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="New playlist"
          className="playlist-input"
          style={{ flex: 1 }}
        />
        <button className="small-btn" onClick={create}>Create</button>
      </div>

      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {playlists.map(pl => (
          <div key={pl.id} className="playlist-row card-surface" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8 }}>
            <div style={{ fontWeight: 600 }}>{pl.name}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="small-btn" onClick={()=>play(pl)}>Play</button>
              <button className="small-btn" onClick={async ()=>{ 
                try { await axios.delete(`/api/playlists/${pl.id}`); if(onRefresh) onRefresh(); } catch(e){ console.error(e); }
              }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
