import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ShareModal from './ShareModal';
import MediaInteractions from './MediaInteractions';

const AlbumView = ({ user }) => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [album, setAlbum] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
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
        setError("Album konnte nicht geladen werden");
        setTimeout(() => navigate("/"), 2000);
      } finally {
        setLoading(false);
      }
    };
    if (user && albumId) fetchData();
  }, [albumId, user, navigate]);

  const isVideoFile = (url) => url?.split(/[#?]/)[0].match(/\.(mp4|webm|ogg|mov)$/i);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const result = await api.uploadMedia(albumId, Array.from(files));
      setMedia([...result.media, ...media]);
    } catch (err) {
      setError("Upload fehlgeschlagen (Datei zu groß oder falsches Format)");
    } finally {
      setUploading(false);
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e, mediaId) => {
    e.stopPropagation();
    if (!window.confirm("Medium löschen?")) return;
    try {
      await api.deleteMedia(mediaId);
      setMedia(media.filter(m => m.id !== mediaId));
    } catch (err) { setError("Löschen fehlgeschlagen"); }
  };

  if (loading) return <main className="content"><div className="loader">Lade Inhalte...</div></main>;

  // Berechtigung: Owner/Editor ODER es ist ein öffentliches Event
  const canEdit = ['owner', 'editor'].includes(album?.role);
  const canUpload = album?.is_event || canEdit;

  return (
    <main className="content">
      <header className="content-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/")}>←</button>
          <div className="title-group">
            <h1>{album?.title}</h1>
            {album?.is_event && <span className="role-badge owner">Social Event</span>}
          </div>
        </div>

        <div className="header-actions">
          {!album?.is_event && (
            <button className="share-btn" onClick={() => setShowShareModal(true)}>🔗 Teilen</button>
          )}
          {canUpload && (
            <>
              <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*,video/*" multiple style={{ display: 'none' }} />
              <button className="primary-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? '⏳ Lädt...' : '📸 Posten'}
              </button>
            </>
          )}
        </div>
      </header>

      <section className="photo-section">
        <div className="photo-grid">
          {media.map(item => (
            <div key={item.id} className="photo-card modern" onClick={() => setSelectedMedia(item)}>
              {isVideoFile(item.url) ? (
                <video src={item.url} muted playsInline className="video-preview" />
              ) : (
                <img src={item.url} alt="Media" loading="lazy" />
              )}
              <div className="photo-overlay">
                <span className="zoom-label">{isVideoFile(item.url) ? '▶ Abspielen' : '🔍 Vollbild'}</span>
                {canEdit && (
                  <button className="delete-mini-btn" onClick={(e) => handleDelete(e, item.id)}>✕</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedMedia && (
        <div className="lightbox-with-interactions">
          <div className="lightbox-backdrop" onClick={() => setSelectedMedia(null)} />
          <button className="close-lightbox" onClick={() => setSelectedMedia(null)}>✕</button>
          
          <div className="lightbox-main">
            <div className="lightbox-media">
              {isVideoFile(selectedMedia.url) ? (
                <video src={selectedMedia.url} controls autoPlay className="lightbox-video" />
              ) : (
                <img src={selectedMedia.url} alt="Vollbild" />
              )}
            </div>
            <div className="lightbox-sidebar">
              <MediaInteractions media={selectedMedia} user={user} />
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <ShareModal albumId={albumId} albumTitle={album?.title} onClose={() => setShowShareModal(false)} />
      )}
    </main>
  );
};

export default AlbumView;