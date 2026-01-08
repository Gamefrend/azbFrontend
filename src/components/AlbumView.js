import { useState, useEffect, useRef } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { db } from "../config/firebase-config";
import { doc, getDoc } from "firebase/firestore";

const AlbumView = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Referenz für den versteckten Input

  const [albumData, setAlbumData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // Neuer Status für den Upload

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        const albumRef = doc(db, "album", albumId);
        const albumSnap = await getDoc(albumRef);

        if (albumSnap.exists()) {
          setAlbumData(albumSnap.data());
        } else {
          navigate("/");
        }
      } catch (err) {
        console.error("Fehler beim Laden:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbumDetails();
  }, [albumId, navigate]);

  // Die Upload-Logik aus der HTML-Datei
  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    for (const file of files) {
      formData.append('images', file); // 'images' muss zum Namen in der Cloud Function passen
    }
    
    // albumId als Feld mitsenden
    formData.append('albumId', albumId);

    try {
      const response = await fetch(
        'https://upload-image-function-898583273277.europe-west3.run.app',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      alert("Bilder erfolgreich in die Cloud geladen!");
    } catch (err) {
      console.error("Upload-Fehler:", err);
      alert("Upload fehlgeschlagen. Prüfe die Konsole.");
    } finally {
      setUploading(false);
      e.target.value = null; 
    }
  };

  if (loading) return <div className="content"><p>Album wird geladen...</p></div>;

  return (
    <main className="content">
      <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/")} style={{ marginRight: '1rem' }}>
            ← Zurück
          </button>
          <h1 style={{ display: 'inline' }}>{albumData?.titel || "Unbenanntes Album"}</h1>
        </div>
        
        {/* Versteckter Input */}
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />

        <button 
          className="add-photo-btn" 
          disabled={uploading}
          onClick={() => fileInputRef.current.click()} // Öffnet den Dateidialog
          style={{ 
            padding: '10px 20px', 
            backgroundColor: uploading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: uploading ? 'not-allowed' : 'pointer' 
          }}
        >
          {uploading ? 'Wird hochgeladen...' : '+ Foto hochladen'}
        </button>
      </header>

      <section className="photo-section">
        {uploading && <p style={{ textAlign: 'center', color: '#007bff' }}>Bilder werden verarbeitet...</p>}
        
        {(!albumData?.photos || albumData.photos.length === 0) ? (
          <div className="empty-album-placeholder" style={{ textAlign: 'center', padding: '50px', border: '2px dashed #ccc', borderRadius: '10px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
            <h3>Dieses Album ist noch leer</h3>
            <p>Nutze den Button oben, um Bilder in dieses Cloud-Album zu laden.</p>
          </div>
        ) : (
          <div className="photo-grid">
            {/* Hier map() über albumData.photos, sobald die URLs in Firestore gespeichert werden */}
            <p>Bilder werden hier erscheinen...</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default AlbumView;