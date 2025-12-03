// src/components/UploadCard.jsx
import React, { useState } from "react";
import axios from "axios";
import '../App.css'; // Ensure CSS is imported

export default function UploadCard({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [artistImage, setArtistImage] = useState(null);
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [album, setAlbum] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  // -------------------------------------------------------------------------
  // 🛑 TODO: PASTE YOUR RENDER BACKEND URL HERE
  // -------------------------------------------------------------------------
  const API_BASE = "https://groove-j0kw.onrender.com"; 
  // -------------------------------------------------------------------------

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please choose an audio file.");

    if (API_BASE.includes("REPLACE_THIS")) {
      return alert("Setup Error: You forgot to paste your Render Backend URL inside UploadCard.jsx!");
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title || file.name.replace(/\.[^.]+$/, ""));
    if (artistName) fd.append("artistName", artistName);
    if (artistImage) fd.append("artistImage", artistImage);
    if (coverImage) fd.append("coverImage", coverImage);
    if (album) fd.append("album", album);

    setLoading(true);
    setProgress(0);

    try {
      const url = `${API_BASE}/api/songs/upload`;
      console.log("Uploading to:", url);

      await axios.post(url, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        },
      });

      setFile(null);
      setCoverImage(null);
      setArtistImage(null);
      setTitle("");
      setArtistName("");
      setAlbum("");
      setProgress(0);
      setLoading(false);

      if (onUploaded) onUploaded();
      alert("Upload complete!");
    } catch (err) {
      console.error(err);
      setLoading(false);
      
      if (err.response && err.response.status === 405) {
         alert("Error 405: Still hitting Vercel. Check the API_BASE URL in code.");
      } else {
         alert("Upload failed — check backend console.");
      }
    }
  };

  return (
    <div className="upload-card">
      <strong className="upload-title">Upload a Song</strong>

      <form onSubmit={submit}>
        <div className="form-group">
          <label className="file-label-text">Audio File *</label>
          <input 
            className="file-input" 
            type="file" 
            accept="audio/*" 
            onChange={(e) => setFile(e.target.files[0])} 
          />
        </div>

        <div className="form-group">
          <input
            className="upload-input"
            placeholder="Song Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <input
            className="upload-input"
            placeholder="Artist Name (optional)"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <input
            className="upload-input"
            placeholder="Album Name (optional)"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="file-label-text">Artist Image (optional)</label>
          <input 
            className="file-input" 
            type="file" 
            accept="image/*" 
            onChange={(e) => setArtistImage(e.target.files[0])} 
          />
        </div>

        <div className="form-group">
          <label className="file-label-text">Cover Image (optional)</label>
          <input 
            className="file-input" 
            type="file" 
            accept="image/*" 
            onChange={(e) => setCoverImage(e.target.files[0])} 
          />
        </div>

        <button className="upload-btn" type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload Song"}
        </button>

        {loading && (
          <div className="upload-progress-container">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-text">{progress}%</div>
          </div>
        )}
      </form>
    </div>
  );
}
