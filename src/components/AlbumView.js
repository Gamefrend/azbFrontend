import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const AlbumView = ({ user }) => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [album, setAlbum] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Album und Media laden
  useEffect(() => {
    const fetchData = async () => {
      try {
        const albumData = await api.getAlbum(albumId);
        setAlbum(albumData.album);

        const mediaData = await api.getMedia(albumId);
        setMedia(mediaData.media);
      } catch (err) {
        console.error("Fehler beim Laden:", err);
        setError("Album konnte nicht geladen werden");
        setTimeout(() => navigate("/"), 2000);
      } finally {
        setLoading(false);
      }
    };

    if (user && albumId) {
      fetchData();
    }
  }, [albumId, user, navigate]);

  // Bilder hochladen
  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const result = await api.uploadMedia(albumId, Array.from(files));
      setMedia([...result.media, ...media]);  // Neue Bilder vorne
    } catch (err) {
      console.error("Upload fehlgeschlagen:", err);
      setError("Upload fehlgeschlagen");
    } finally {
      setUploading(false);
      fileInputRef.current.value = '';  // Input zurücksetzen
    }
  };

  // Bild löschen
  const handleDelete = async (mediaId) => {
    if (!window.confirm("Bild wirklich löschen?")) return;

    try {
      await api.deleteMedia(mediaId);
      setMedia(media.filter(m => m.id !== mediaId));
    } catch (err) {
      console.error("Löschen fehlgeschlagen:", err);
      setError("Löschen fehlgeschlagen");
    }
  };

  if (loading) return <main className="content"><p>Album wird geladen...</p></main>;
  if (error && !album) return <main className="content"><p style={{color: 'red'}}>{error}</p></main>;

  const canEdit = ['owner', 'editor'].includes(album?.role);

  return (
      <main className="content">
        <header className="content-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate("/")}>← Zurück</button>
            <h1>{album?.title || "Album"}</h1>
            <span style={{
              background: album?.role === 'owner' ? '#4CAF50' : '#2196F3',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              marginLeft: '10px'
            }}>
            {album?.role}
          </span>
          </div>

          {canEdit && (
              <>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                />
                <button
                    className="add-photo-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                >
                  {uploading ? '⏳ Uploading...' : '+ Foto hinzufügen'}
                </button>
              </>
          )}
        </header>

        {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

        <section className="photo-section">
          {media.length > 0 ? (
              <div className="photo-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {media.map(item => (
                    <div key={item.id} className="photo-card" style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <img
                          src={item.url}
                          alt={item.filename || "Foto"}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover'
                          }}
                      />
                      {canEdit && (
                          <button
                              onClick={() => handleDelete(item.id)}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'rgba(255,0,0,0.8)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '30px',
                                height: '30px',
                                cursor: 'pointer'
                              }}
                          >
                            ✕
                          </button>
                      )}
                    </div>
                ))}
              </div>
          ) : (
              <div className="photo-grid-placeholder">
                <p>Dieses Album ist noch leer.</p>
                {canEdit && <p>Klicke auf "+ Foto hinzufügen" um Bilder hochzuladen.</p>}
              </div>
          )}
        </section>
      </main>
  );
};

export default AlbumView;