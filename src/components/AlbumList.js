import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../services/api';

const AlbumList = ({ user }) => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [activeTab, setActiveTab] = useState('my');  // ← NEU: Tab-State
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
    e.stopPropagation();
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
    e.stopPropagation();
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

  // NEU: Alben filtern
  const myAlbums = albums.filter(a => a.role === 'owner');
  const sharedWithMe = albums.filter(a => a.role !== 'owner');
  const displayedAlbums = activeTab === 'my' ? myAlbums : sharedWithMe;

  if (loading) return <main className="content"><div className="loader">Lade Alben...</div></main>;

  return (
      <main className="content">
        <header className="content-header">
          <h1>Alben</h1>
          <button className="primary-btn" onClick={() => setShowModal(true)}>
            + Neues Album
          </button>
        </header>

        {error && <div className="error-message">{error}</div>}

        {/* NEU: Tab-Navigation */}
        <div className="album-tabs">
          <button
              className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
              onClick={() => setActiveTab('my')}
          >
            📁 Meine Alben ({myAlbums.length})
          </button>
          <button
              className={`tab-btn ${activeTab === 'shared' ? 'active' : ''}`}
              onClick={() => setActiveTab('shared')}
          >
            🔗 Mit mir geteilt ({sharedWithMe.length})
          </button>
        </div>

        <div className="album-grid">
          {displayedAlbums.length > 0 ? (
              displayedAlbums.map(album => (
                  <div key={album.id} className="album-card" onClick={() => navigate(`/album/${album.id}`)}>
                    {/* Aktionen nur für Owner */}
                    {album.role === 'owner' && (
                        <div className="album-actions">
                          <button className="action-btn" onClick={(e) => handleRename(e, album.id, album.title)} title="Umbenennen">✏️</button>
                          <button className="action-btn delete" onClick={(e) => handleDelete(e, album.id)} title="Löschen">🗑️</button>
                        </div>
                    )}

                    <div className="album-placeholder">
                      {album.role === 'owner' ? '📁' : '🔗'}
                    </div>
                    <div className="album-info">
                      <h3>{album.title}</h3>
                      <p>
                        {album.media_count || 0} Fotos •
                        <span className={`role-inline ${album.role}`}>
                    {album.role === 'owner' ? ' 👑 Owner' :
                        album.role === 'editor' ? ' ✏️ Editor' : ' 👁️ Viewer'}
                  </span>
                      </p>
                    </div>
                  </div>
              ))
          ) : (
              <div className="empty-state">
                <p className="no-data">
                  {activeTab === 'my'
                      ? "Du hast noch keine eigenen Alben."
                      : "Noch keine Alben mit dir geteilt."}
                </p>
              </div>
          )}
        </div>

        {/* Modal */}
       {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modern-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            
            <div className="modal-header">
              <h2>Neues Album</h2>
              <p>Gib deinem Album einen Namen, um deine Medien zu organisieren.</p>
            </div>

            <form onSubmit={createAlbum}>
              <div className="input-group">
                <label>Album Name</label>
                <input
                  type="text"
                  placeholder="z.B. Urlaub 2025"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  autoFocus
                  className="modern-input"
                />
              </div>
              
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Abbrechen
                </button>
                <button type="submit" className="confirm-btn" disabled={!newAlbumName.trim()}>
                  Album erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </main>
  );
};

export default AlbumList;