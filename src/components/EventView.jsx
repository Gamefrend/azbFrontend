import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import MediaInteractions from './MediaInteractions';

const EventView = ({ user }) => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [event, setEvent] = useState(null);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const eventData = await api.getEvent(eventId);
                setEvent(eventData.event);
                const mediaData = await api.getEventMedia(eventId);
                setMedia(mediaData.media);
            } catch (err) {
                setError("Event konnte nicht geladen werden");
                setTimeout(() => navigate("/"), 2000);
            } finally {
                setLoading(false);
            }
        };
        if (user && eventId) fetchData();
    }, [eventId, user, navigate]);

    const isVideoFile = (url) => url?.split(/[#?]/)[0].match(/\.(mp4|webm|ogg|mov)$/i);

    const handleUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        setError(null);

        try {
            const result = await api.uploadEventMedia(eventId, Array.from(files));
            setMedia([...result.media, ...media]);
        } catch (err) {
            setError("Upload fehlgeschlagen");
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
        } catch (err) {
            setError("Löschen fehlgeschlagen");
        }
    };

    // Download Funktion (nutzt Blob für direkten Download)
    const handleDownload = async (e, url, filename) => {
        e.stopPropagation(); 
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || `event-download-${Date.now()}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download fehlgeschlagen:", error);
            window.open(url, '_blank');
        }
    };

    if (loading) return <main className="content"><div className="loader">Lade Event...</div></main>;

    const isOwner = event?.role === 'owner';

    return (
        <main className="content">
            <header className="content-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate("/")}>←</button>
                    <div className="title-group">
                        <h1>{event?.title}</h1>
                        <span className="event-live-badge">🔥 LIVE EVENT</span>
                    </div>
                </div>

                <div className="header-actions">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        accept="image/*,video/*"
                        multiple
                        style={{ display: 'none' }}
                    />
                    <button
                        className="primary-btn event-upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? '⏳ Lädt...' : '📸 Beitrag posten'}
                    </button>
                </div>
            </header>

            {error && <div className="error-message">{error}</div>}

            {/* Event Info Banner */}
            <div className="event-info-banner">
                <span>🎉 Jeder kann hier Fotos & Videos teilen!</span>
                <span>📸 {media.length} Beiträge</span>
            </div>

            <section className="photo-section">
                {media.length > 0 ? (
                    <div className="photo-grid">
                        {media.map(item => (
                            <div key={item.id} className="photo-card modern event-media-card" onClick={() => setSelectedMedia(item)}>
                                {isVideoFile(item.url) ? (
                                    <video src={item.url} muted playsInline className="video-preview" />
                                ) : (
                                    <img src={item.url} alt="Media" loading="lazy" />
                                )}

                                {/* Uploader Info */}
                                <div className="media-uploader-info">
                                    <span className="uploader-avatar">
                                        {(item.uploader_name || item.uploader_email || '?')[0].toUpperCase()}
                                    </span>
                                    <span className="uploader-name">{item.uploader_name || item.uploader_email?.split('@')[0] || 'Anonym'}</span>
                                </div>

                                <div className="photo-overlay">
                                    <span className="zoom-label">{isVideoFile(item.url) ? '▶ Abspielen' : '🔍 Vollbild'}</span>
                                    
                                    {/* Download Button Grid */}
                                    <button 
                                        className="download-mini-btn" 
                                        onClick={(e) => handleDownload(e, item.url, item.filename)}
                                        title="Herunterladen"
                                    >
                                        📥
                                    </button>

                                    {(isOwner || item.uploader_uid === user?.uid) && (
                                        <button className="delete-mini-btn" onClick={(e) => handleDelete(e, item.id)}>✕</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state event-empty">
                        <div className="empty-state-icon">🎉</div>
                        <h2>Sei der Erste!</h2>
                        <p>Teile dein erstes Foto oder Video mit allen.</p>
                        <button className="cta-upload-btn" onClick={() => fileInputRef.current?.click()}>
                            📸 Jetzt posten
                        </button>
                    </div>
                )}
            </section>

            {/* Lightbox */}
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
                            <div className="lightbox-uploader-info">
                                <span className="uploader-avatar large">
                                    {(selectedMedia.uploader_name || '?')[0].toUpperCase()}
                                </span>
                                <span>{selectedMedia.uploader_name || selectedMedia.uploader_email?.split('@')[0]}</span>
                            </div>
                            
                            <MediaInteractions media={selectedMedia} user={user} />
                            
                            {/* NEU: Download Button in der Sidebar */}
                            <div style={{padding: '20px'}}>
                                <button 
                                    className="back-btn" 
                                    style={{width: '100%', justifyContent: 'center'}}
                                    onClick={(e) => handleDownload(e, selectedMedia.url, selectedMedia.filename)}
                                >
                                    📥 Datei herunterladen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default EventView;