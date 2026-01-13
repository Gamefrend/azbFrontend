import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../services/api';

const AlbumList = ({ user }) => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
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
      let data;
      if (isCreatingEvent) {
        data = await api.createEvent(newAlbumName);
        setAlbums([{ ...data.event, is_event: true }, ...albums]);
      } else {
        data = await api.createAlbum(newAlbumName);
        setAlbums([data.album, ...albums]);
      }
      setNewAlbumName("");
      setShowModal(false);
      setIsCreatingEvent(false);
    } catch (err) {
      setError(isCreatingEvent ? "Event konnte nicht erstellt werden" : "Album konnte nicht erstellt werden");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Wirklich löschen?")) {
      try {
        await api.deleteAlbum(id);
        setAlbums(albums.filter(a => a.id !== id));
      } catch (err) {
        setError("Löschen fehlgeschlagen");
      }
    }
  };

  // Filter-Logik
  const myAlbums = albums.filter(a => a.role === 'owner' && !a.is_event);
  const sharedWithMe = albums.filter(a => a.role !== 'owner' && !a.is_event);
  const socialEvents = albums.filter(a => a.is_event);

  const displayedAlbums =
      activeTab === 'my' ? myAlbums :
          activeTab === 'shared' ? sharedWithMe : socialEvents;

  const openCreateModal = (isEvent = false) => {
    setIsCreatingEvent(isEvent);
    setShowModal(true);
  };

  if (loading) return <main className="content"><div className="loader">Lade Alben...</div></main>;

  return (
      <main className="content">
        <header className="content-header">
          <h1>{activeTab === 'events' ? '🔥 Social Events' : 'Deine Alben'}</h1>
          <button className="primary-btn" onClick={() => openCreateModal(activeTab === 'events')}>
            {activeTab === 'events' ? '+ Neues Event' : '+ Neues Album'}
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
                  <div
                      key={album.id}
                      className={`album-card ${album.is_event ? 'event-card' : ''}`}
                      onClick={() => navigate(album.is_event ? `/event/${album.id}` : `/album/${album.id}`)}
                  >
                    {album.role === 'owner' && !album.is_event && (
                        <div className="album-actions">
                          <button className="action-btn delete" onClick={(e) => handleDelete(e, album.id)} title="Löschen">🗑️</button>
                        </div>
                    )}

                    {album.is_event && <div className="event-badge">🔥 LIVE</div>}

                    <div className="album-placeholder">
                      {album.is_event ? '🎉' : (album.role === 'owner' ? '📁' : '🔗')}
                    </div>
                    <div className="album-info">
                      <h3>{album.title}</h3>
                      <p>
                        {album.media_count || 0} {album.is_event ? 'Beiträge' : 'Fotos'}
                        {!album.is_event && (
                            <span className={`role-inline ${album.role}`}>
                      {album.role === 'owner' ? ' • 👑 Owner' :
                          album.role === 'editor' ? ' • ✏️ Editor' : ' • 👁️ Viewer'}
                    </span>
                        )}
                      </p>
                    </div>
                  </div>
              ))
          ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  {activeTab === 'events' ? '🎉' : '📁'}
                </div>
                <h2>
                  {activeTab === 'my' ? 'Noch keine eigenen Alben' :
                      activeTab === 'shared' ? 'Keine geteilten Alben' :
                          'Noch keine Social Events'}
                </h2>
                <p>
                  {activeTab === 'events'
                      ? 'Erstelle ein Event und lade alle ein, ihre Fotos zu teilen!'
                      : 'Erstelle dein erstes Album.'}
                </p>
                <button className="cta-upload-btn" onClick={() => openCreateModal(activeTab === 'events')}>
                  {activeTab === 'events' ? '+ Event erstellen' : '+ Album erstellen'}
                </button>
              </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content modern-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
                <div className="modal-header">
                  <h2>{isCreatingEvent ? '🔥 Neues Social Event' : 'Neues Album'}</h2>
                  <p>
                    {isCreatingEvent
                        ? 'Jeder kann Fotos und Videos zu diesem Event beitragen!'
                        : 'Erstelle einen Ort für deine Erinnerungen.'}
                  </p>
                </div>
                <form onSubmit={createAlbum}>
                  <div className="input-group">
                    <label>{isCreatingEvent ? 'Event-Name' : 'Album-Name'}</label>
                    <input
                        type="text"
                        placeholder={isCreatingEvent ? 'z.B. Sommerfest 2025' : 'z.B. Urlaub 2025'}
                        value={newAlbumName}
                        onChange={(e) => setNewAlbumName(e.target.value)}
                        autoFocus
                        className="modern-input"
                    />
                  </div>
                  <div className="modal-buttons">
                    <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Abbrechen</button>
                    <button type="submit" className="confirm-btn" disabled={!newAlbumName.trim()}>
                      {isCreatingEvent ? 'Event erstellen' : 'Album erstellen'}
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