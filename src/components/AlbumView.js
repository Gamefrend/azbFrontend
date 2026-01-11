import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ShareModal from './ShareModal';

const AlbumView = ({ user }) => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [album, setAlbum] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  // Wir speichern jetzt das ganze Objekt statt nur die URL für die Lightbox
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

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

  // Hilfsfunktion: Erkennt Video anhand der Dateiendung
  const isVideoFile = (url) => {
    if (!url) return false;
    return url.split(/[#?]/)[0].match(/\.(mp4|webm|ogg|mov)$/i);
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      const result = await api.uploadMedia(albumId, Array.from(files));
      // Neue Medien oben hinzufügen
      setMedia([...result.media, ...media]);
    } catch (err) {
      // Fehlermeldung verfeinert für 400er Fehler (meistens Größe/Format)
      setError("Upload fehlgeschlagen. Datei eventuell zu groß (max. 50MB) oder ungültiges Format.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e, mediaId) => {
    e.stopPropagation();
    if (!window.confirm("Dieses Medium wirklich löschen?")) return;
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

        <div className="header-actions">
          <button className="share-btn" onClick={() => setShowShareModal(true)}>
            <span>🔗</span> Teilen
          </button>
          
          {canEdit && (
            <>
              {/* accept auf Video erweitert */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleUpload} 
                accept="image/*,video/*" 
                multiple 
                style={{ display: 'none' }} 
              />
              <button className="primary-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? '⏳ Lädt...' : '+ Medium hinzufügen'}
              </button>
            </>
          )}
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <section className="photo-section">
        {media.length > 0 ? (
          <div className="photo-grid">
            {media.map(item => {
              const isVideo = isVideoFile(item.url);

              return (
                <div key={item.id} className="photo-card modern" onClick={() => setSelectedMedia(item)}>
                  {isVideo ? (
                    <video src={item.url} muted playsInline className="video-preview" />
                  ) : (
                    <img src={item.url} alt="Media" loading="lazy" />
                  )}
                  
                  <div className="photo-overlay">
                    <span className="zoom-label">
                      {isVideo ? '▶ Abspielen' : '🔍 Vollbild'}
                    </span>
                    {canEdit && (
                      <button className="delete-mini-btn" onClick={(e) => handleDelete(e, item.id)}>✕</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📸</div>
            <h2>Dein Album ist noch leer</h2>
            <p>Lade Fotos oder Videos hoch, um das Album zu füllen.</p>
            {canEdit && (
              <button className="cta-upload-btn" onClick={() => fileInputRef.current?.click()}>
                <span className="plus-icon">+</span> Medien auswählen
              </button>
            )}
          </div>
        )}
      </section>

      {/* Lightbox / Vollbild Modal */}
      {selectedMedia && (
        <div className="lightbox" onClick={() => setSelectedMedia(null)}>
          <button className="close-lightbox" onClick={() => setSelectedMedia(null)}>✕</button>
          
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {isVideoFile(selectedMedia.url) ? (
              <video 
                src={selectedMedia.url} 
                controls 
                autoPlay 
                className="lightbox-video"
              />
            ) : (
              <img src={selectedMedia.url} alt="Vollbild" />
            )}
          </div>
        </div>
      )}

      {showShareModal && (
        <ShareModal
          albumId={albumId}
          albumTitle={album?.title}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </main>
  );
};

export default AlbumView;