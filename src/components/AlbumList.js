import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../services/api';

const AlbumList = ({ user }) => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [activeTab, setActiveTab] = useState('my'); 
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

  // Filter-Logik für die Tabs
  const myAlbums = albums.filter(a => a.role === 'owner' && !a.is_event);
  const sharedWithMe = albums.filter(a => a.role !== 'owner' && !a.is_event);
  const socialEvents = albums.filter(a => a.is_event); // Basierend auf dem neuen DB-Feld

  const displayedAlbums = 
    activeTab === 'my' ? myAlbums : 
    activeTab === 'shared' ? sharedWithMe : socialEvents;

  if (loading) return <main className="content"><div className="loader">Lade Alben...</div></main>;

  return (
    <main className="content">
      <header className="content-header">
        <h1>{activeTab === 'events' ? 'Social Events' : 'Deine Alben'}</h1>
        <button className="primary-btn" onClick={() => setShowModal(true)}>
          + Neues Album
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="album-tabs">
        <button className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>
          📁 Meine Alben ({myAlbums.length})
        </button>
        <button className={`tab-btn ${activeTab === 'shared' ? 'active' : ''}`} onClick={() => setActiveTab('shared')}>
          🔗 Geteilt ({sharedWithMe.length})
        </button>
        <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
          🔥 Social Events ({socialEvents.length})
        </button>
      </div>

      <div className="album-grid">
        {displayedAlbums.length > 0 ? (
          displayedAlbums.map(album => (
            <div key={album.id} 
                 className={`album-card ${album.is_event ? 'event-card' : ''}`} 
                 onClick={() => navigate(`/album/${album.id}`)}>
              
              {album.is_event && <div className="event-badge">LIVE EVENT</div>}
              
              <div className="album-placeholder">
                {album.is_event ? '🔥' : (album.role === 'owner' ? '📁' : '🔗')}
              </div>
              <div className="album-info">
                <h3>{album.title}</h3>
                <p>{album.media_count || 0} Beiträge</p>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p className="no-data">Keine Alben in dieser Kategorie gefunden.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modern-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            <div className="modal-header">
              <h2>Neues Album</h2>
              <p>Erstelle einen Ort für deine gemeinsamen Erinnerungen.</p>
            </div>
            <form onSubmit={createAlbum}>
              <div className="input-group">
                <label>Name des Albums</label>
                <input
                  type="text"
                  placeholder="z.B. Sommerfest 2025"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  autoFocus
                  className="modern-input"
                />
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Abbrechen</button>
                <button type="submit" className="confirm-btn" disabled={!newAlbumName.trim()}>Erstellen</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default AlbumList;