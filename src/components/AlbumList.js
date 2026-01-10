import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../services/api';

const AlbumList = ({ user }) => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchAlbums = async () => {
      try {
        const data = await api.getAlbums();
        setAlbums(data.albums);
      } catch (err) {
        setError("Alben konnten nicht geladen werden");
      } finally {
        setLoading(false);
      }
    };
    fetchAlbums();
  }, [user]);

  const createAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;
    try {
      const data = await api.createAlbum(newAlbumName);
      setAlbums([data.album, ...albums]);
      setNewAlbumName("");
      setShowModal(false);
    } catch (err) {
      setError("Album konnte nicht erstellt werden");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Verhindert das Navigieren zum Album
    if (window.confirm("Dieses Album wirklich unwiderruflich löschen?")) {
      try {
        await api.deleteAlbum(id);
        setAlbums(albums.filter(a => a.id !== id));
      } catch (err) {
        setError("Löschen fehlgeschlagen");
      }
    }
  };

  const handleRename = async (e, id, oldTitle) => {
    e.stopPropagation(); // Verhindert das Navigieren zum Album
    const newName = prompt("Neuer Name für das Album:", oldTitle);
    if (newName && newName.trim() !== "" && newName !== oldTitle) {
      try {
        await api.updateAlbum(id, { title: newName });
        setAlbums(albums.map(a => a.id === id ? { ...a, title: newName } : a));
      } catch (err) {
        setError("Umbenennen fehlgeschlagen");
      }
    }
  };

  if (loading) return <main className="content"><div className="loader">Lade Alben...</div></main>;

  return (
    <main className="content">
      <header className="content-header">
        <h1>Meine Alben</h1>
        <button className="primary-btn" onClick={() => setShowModal(true)}>
          + Neues Album
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="album-grid">
        {albums.length > 0 ? (
          albums.map(album => (
            <div key={album.id} className="album-card" onClick={() => navigate(`/album/${album.id}`)}>
              {/* Bearbeiten/Löschen Overlay Buttons */}
              <div className="album-actions">
                <button className="action-btn" onClick={(e) => handleRename(e, album.id, album.title)} title="Umbenennen">✏️</button>
                <button className="action-btn delete" onClick={(e) => handleDelete(e, album.id)} title="Löschen">🗑️</button>
              </div>

              <div className="album-placeholder">📁</div>
              <div className="album-info">
                <h3>{album.title}</h3>
                <p>{album.media_count || 0} Fotos • {album.role}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p className="no-data">Noch keine Alben vorhanden.</p>
          </div>
        )}
      </div>

      {/* Modal für neues Album bleibt gleich... */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Neues Album erstellen</h2>
            <form onSubmit={createAlbum}>
              <input type="text" placeholder="Name des Albums" value={newAlbumName} onChange={(e) => setNewAlbumName(e.target.value)} autoFocus />
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Abbrechen</button>
                <button type="submit" className="confirm-btn">Erstellen</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default AlbumList;