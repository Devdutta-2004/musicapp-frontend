// src/components/LyricsPanel.jsx
import React, { useEffect, useState, useRef } from 'react';

export default function LyricsPanel({ song }) {
  const [loading, setLoading] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [editing, setEditing] = useState(false);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!song) {
        setLyrics('');
        setMeta(null);
        setEditing(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(`/api/lyrics?songId=${encodeURIComponent(song.id)}`);
        const json = await resp.json();
        if (cancelled) return;
        const entry = json?.entry || null;
        if (entry) {
          setLyrics(entry.lyrics || '');
          setMeta({ source: entry.source, updatedAt: entry.updatedAt });
          setEditing(false);
        } else {
          setLyrics('');
          setMeta(null);
          setEditing(false);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load lyrics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [song?.id]);

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    window.addEventListener('click', onDocClick);
    return () => window.removeEventListener('click', onDocClick);
  }, []);

  async function saveLyrics() {
    if (!song) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: String(song.id), lyrics, source: 'manual' })
      });
      const json = await resp.json();
      if (json?.ok) {
        setMeta(json.entry ? { source: json.entry.source, updatedAt: json.entry.updatedAt } : { source: 'manual' });
        setEditing(false);
        setMenuOpen(false);
      } else {
        setError('Save failed');
      }
    } catch (err) {
      console.error(err);
      setError('Save failed');
    } finally {
      setLoading(false);
    }
  }

  async function clearLyrics() {
    if (!song) return;
    if (!window.confirm('Clear lyrics for this song?')) return;
    setLoading(true);
    setError(null);
    try {
      await fetch(`/api/lyrics?songId=${encodeURIComponent(song.id)}`, { method: 'DELETE' });
      setLyrics('');
      setMeta(null);
      setEditing(false);
      setMenuOpen(false);
    } catch (err) {
      console.error(err);
      setError('Delete failed');
    } finally {
      setLoading(false);
    }
  }

  if (!song) return <div className="lyrics-empty">Select a song to see lyrics</div>;

  return (
    <div className="lyrics-panel" role="region" aria-label="Lyrics panel">
      <div className="lyrics-panel-header">
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>{song.title}</h3>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{song.artistName}</div>
        </div>

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            className="small-btn"
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            title=""
          >
            ✎ 
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="lyrics-actions-menu"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                background: 'var(--bg-secondary)',
                border: '1px solid rgba(255,255,255,0.03)',
                borderRadius: 8,
                boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                padding: 8,
                zIndex: 60,
                minWidth: 160,
              }}
            >
              <button
                className="small-btn"
                style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 6 }}
                onClick={() => { setEditing(e => !e); setMenuOpen(false); }}
              >
                {editing ? 'Cancel Edit' : 'Edit Lyrics'}
              </button>

              <button
                className="small-btn"
                style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 6 }}
                onClick={saveLyrics}
                disabled={!editing || loading}
              >
                Save Lyrics
              </button>

              <button
                className="small-btn danger"
                style={{ display: 'block', width: '100%', textAlign: 'left' }}
                onClick={clearLyrics}
                disabled={loading}
              >
                Clear Lyrics
              </button>
            </div>
          )}
        </div>
        
      </div>

      {loading && <div className="lyrics-loading">Loading…</div>}
      {error && <div className="lyrics-error" role="alert">{error}</div>}

      <div className="lyrics-body">
        {editing ? (
          <textarea
            className="lyrics-textarea"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Paste or type lyrics here..."
            rows={12}
          />
        ) : (
          <pre className="lyrics-pre">{lyrics || 'No lyrics saved yet — open Actions → Edit to add lyrics.'}</pre>
        )}
      </div>

      <div className="lyrics-meta">
        {meta ? <small>Source: {meta.source} · Updated: {meta.updatedAt ? new Date(meta.updatedAt).toLocaleString() : '—'}</small> : null}
      </div>
      
    </div>
  );
}
