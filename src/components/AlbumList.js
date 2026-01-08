import { useState, useEffect } from 'react';
import { db } from "../config/firebase-config";
import { 
  collection, addDoc, serverTimestamp, query, where, 
  onSnapshot, doc, updateDoc, deleteDoc 
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AlbumList = ({ user }) => {
  const [albums, setAlbums] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "album"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const albumData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlbums(albumData);
    });
    return () => unsubscribe();
  }, [user]);

  const createAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;
    try {
      const albumRef = await addDoc(collection(db, "album"), {
        titel: newAlbumName,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "album", albumRef.id, "accesses"), {
        userId: user.uid,
        role: "owner",
      });
      setNewAlbumName("");
      setShowModal(false);
    } catch (err) {
      console.error("Fehler beim Erstellen:", err);
    }
  };

  const deleteAlbum = async (e, albumId) => {
    e.stopPropagation(); // Verhindert, dass der Klick das Album öffnet
    if (window.confirm("Möchtest du dieses Album wirklich unwiderruflich löschen?")) {
      try {
        await deleteDoc(doc(db, "album", albumId));
        // Optional: Hier auch die 'accesses' Sub-Collection löschen
      } catch (err) {
        console.error("Fehler beim Löschen:", err);
      }
    }
  };

  const renameAlbum = async (e, albumId, aktuellerTitel) => {
    e.stopPropagation(); // Verhindert das Öffnen des Albums
    const neuerName = prompt("Neuer Name für das Album:", aktuellerTitel);
    if (neuerName && neuerName.trim() !== "" && neuerName !== aktuellerTitel) {
      try {
        const albumRef = doc(db, "album", albumId);
        await updateDoc(albumRef, {
          titel: neuerName
        });
      } catch (err) {
        console.error("Fehler beim Umbenennen:", err);
      }
    }
  };

  return (
    <main className="content">
      <header className="content-header">
        <h1>Meine Alben</h1>
        <button className="add-album-btn" onClick={() => setShowModal(true)}>
          + Neues Album
        </button>
      </header>

      <div className="album-grid">
        {albums.length > 0 ? (
          albums.map(album => (
            <div 
              key={album.id} 
              className="album-card" 
              onClick={() => navigate(`/album/${album.id}`)}
            >
              <div className="album-actions">
            <button 
              className="action-btn" 
              onClick={(e) => renameAlbum(e, album.id, album.titel)}
            >
              ✏️
            </button>
            <button 
              className="action-btn delete" 
              onClick={(e) => deleteAlbum(e, album.id)}
            >
              🗑️
            </button>
          </div>
              <div className="album-placeholder">📁</div>
              <div className="album-info">
                <h3>{album.titel}</h3>
                <p>Ansehen & Verwalten</p>
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
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Abbrechen</button>
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

