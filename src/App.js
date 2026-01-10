import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from "./config/firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import './App.css';
import Auth from './auth';
import AlbumList from './components/AlbumList';

// Eine einfache Platzhalter-Komponente für die Album-Detailseite
const AlbumView = () => <div className="content"><h1>Album Detailansicht (Hier kommen bald die Bilder hin!)</h1></div>;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  if (loading) return <div className="loading-screen">Lade App...</div>;

  return (
    <Router>
      <div className="App">
        {user ? (
          <div className="dashboard-container">
            {/* Sidebar bleibt immer sichtbar */}
            <nav className="sidebar">
              <div className="logo-section">
                <h2 style={{cursor: 'pointer'}} onClick={() => window.location.href="/"}>📸 PixShare</h2>
              </div>
              <div className="user-section">
                <p className="user-email">{user.email}</p>
                <button onClick={logout} className="logout-btn">Abmelden</button>
              </div>
            </nav>

            {/* Hier wechselt der Inhalt je nach URL */}
            <Routes>
              <Route path="/" element={<AlbumList user={user} />} />
              <Route path="/album/:albumId" element={<AlbumView user={user} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        ) : (
          <Auth />
        )}
      </div>
    </Router>
  );
}

export default App;