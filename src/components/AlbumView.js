import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from "../config/firebase-config";
import { doc, getDoc } from "firebase/firestore";

const AlbumView = () => {
  const { albumId } = useParams(); // Holt die ID aus der URL (z.B. /album/123)
  const navigate = useNavigate();
  const [albumData, setAlbumData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        const albumRef = doc(db, "album", albumId);
        const albumSnap = await getDoc(albumRef);

        if (albumSnap.exists()) {
          setAlbumData(albumSnap.data());
        } else {
          console.log("Album nicht gefunden!");
          navigate("/"); // Zurück zur Übersicht, wenn das Album nicht existiert
        }
      } catch (err) {
        console.error("Fehler beim Laden des Albums:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumDetails();
  }, [albumId, navigate]);

  if (loading) return <div className="content"><p>Album wird geladen...</p></div>;

  return (
    <main className="content">
      <header className="content-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/")}>← Zurück</button>
          <h1>{albumData?.titel || "Unbenanntes Album"}</h1>
        </div>
        
        <button className="add-photo-btn">
          + Foto hinzufügen
        </button>
      </header>

      <section className="photo-section">
        <div className="photo-grid-placeholder">
          <p>Dieses Album ist noch leer.</p>
          <small>ID: {albumId}</small>
        </div>
      </section>
    </main>
  );
};

export default AlbumView;