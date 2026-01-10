import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../services/api';  // ← NEU

const AlbumList = ({ user }) => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const navigate = useNavigate();

  // NEU: Von SQL laden statt Firestore
  useEffect(() => {
    if (!user) return;

    const fetchAlbums = async () => {
      try {
        const data = await api.getAlbums();
        setAlbums(data.albums);
      } catch (err) {
        console.error("Fehler beim Laden:", err);
        setError("Alben konnten nicht geladen werden");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [user]);

  // NEU: Album über SQL erstellen
  const createAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;

    try {
      const data = await api.createAlbum(newAlbumName);
      setAlbums([data.album, ...albums]);  // Neues Album vorne einfügen
      setNewAlbumName("");
      setShowModal(false);
    } catch (err) {
      console.error("Fehler beim Erstellen:", err);
      setError("Album konnte nicht erstellt werden");
    }
  };

  if (loading) return <main className="content"><p>Lade Alben...</p></main>;

  return (
      <main className="content">
        <header className="content-header">
          <h1>Meine Alben</h1>
          <button className="add-album-btn" onClick={() => setShowModal(true)}>
            + Neues Album
          </button>
        </header>

        {error && <div className="error-banner" style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

        <div className="album-grid">
          {albums.length > 0 ? (
              albums.map(album => (
                  <div
                      key={album.id}
                      className="album-card"
                      onClick={() => navigate(`/album/${album.id}`)}
                  >
                    <div className="album-placeholder">📁</div>
                    <div className="album-info">
                      <h3>{album.title}</h3>
                      <p>{album.media_count || 0} Fotos • {album.role}</p>
                    </div>
                  </div>
              ))
          ) : (
              <p className="no-data">Noch keine Alben vorhanden.</p>
          )}
        </div>

        {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Neues Album erstellen</h2>
                <form onSubmit={createAlbum}>
                  <input
                      type="text"
                      placeholder="Name des Albums"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      autoFocus
                  />
                  <div className="modal-buttons">
                    <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                      Abbrechen
                    </button>
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