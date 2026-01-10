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
  
  // State für die Vollbildansicht
  const [selectedImage, setSelectedImage] = useState(null);

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

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      const result = await api.uploadMedia(albumId, Array.from(files));
      setMedia([...result.media, ...media]);
    } catch (err) {
      setError("Upload fehlgeschlagen");
    } finally {
      setUploading(false);
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e, mediaId) => {
    e.stopPropagation(); // Verhindert, dass das Bild gleichzeitig geöffnet wird
    if (!window.confirm("Bild wirklich löschen?")) return;
    try {
      await api.deleteMedia(mediaId);
      setMedia(media.filter(m => m.id !== mediaId));
    } catch (err) {
      setError("Löschen fehlgeschlagen");
    }
  };

  if (loading) return <main className="content"><div className="loader">Lade Album...</div></main>;

  const canEdit = ['owner', 'editor'].includes(album?.role);

  return (
    <main className="content">
      <header className="content-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/")}>←</button>
          <div className="title-group">
            <h1>{album?.title || "Album"}</h1>
            <span className={`role-badge ${album?.role}`}>{album?.role}</span>
          </div>
        </div>

        {canEdit && (
          <div className="header-actions">
            <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" multiple style={{ display: 'none' }} />
            <button className="primary-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? '⏳ Lädt...' : '+ Foto hinzufügen'}
            </button>
          </div>
        )}
      </header>

      {error && <div className="error-message">{error}</div>}

      <section className="photo-section">
        {media.length > 0 ? (
          <div className="photo-grid">
            {media.map(item => (
            <div key={item.id} className="photo-card modern" onClick={() => setSelectedImage(item.url)}>
              <img src={item.url} alt="Foto" loading="lazy" />
              <div className="photo-overlay">
                <span className="zoom-label">🔍 Vollbild</span>
                {canEdit && (
                  <button className="delete-mini-btn" onClick={(e) => handleDelete(e, item.id)}>✕</button>
                )}
              </div>
            </div>
          ))}
          </div>
        ) : (
          <div className="empty-state">
          <div className="empty-state-icon">📸</div>
          <h2>Dein Album ist noch leer</h2>
          <p>Lade deine ersten Fotos hoch, um dieses Album zum Leben zu erwecken.</p>
          {canEdit && (
            <button className="cta-upload-btn" onClick={() => fileInputRef.current?.click()}>
              <span className="plus-icon">+</span> Foto auswählen
            </button>
          )}
        </div>
      )}
    </section>

      {/* Lightbox / Vollbild Modal */}
      {selectedImage && (
      <div className="lightbox" onClick={() => setSelectedImage(null)}>
        {/* Button außerhalb des Inhalts, damit er immer oben rechts fixiert ist */}
        <button className="close-lightbox" onClick={() => setSelectedImage(null)}>✕</button>
        
        <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
          <img src={selectedImage} alt="Vollbild" />
        </div>
      </div>
    )}
    </main>
  );
};

export default AlbumView;