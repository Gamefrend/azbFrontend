// App.js
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from "./config/firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import './App.css'; // Wichtig: CSS muss geladen werden
import Auth from './auth';
import AlbumList from './components/AlbumList';
import AlbumView from './components/AlbumView';
import ParticleBackground from './components/RainDropsBackground'; // Import der three.js Komponente
import { useDarkMode } from './hooks/useDarkMode'; // Import des Dark Mode Hooks

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, toggleTheme] = useDarkMode(); // Dark Mode Hook verwenden

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => { await signOut(auth); };

  if (loading) return <div className="loading-screen">Lade App...</div>;

  return (
    <Router>
      <div className="App">
        <ParticleBackground /> {/* three.js Hintergrund hier einfügen */}

        {user ? (
          <div className="app-container">
            <nav className="navbar">
              <div className="navbar-content">
                <div className="navbar-brand" onClick={() => window.location.href="/"}>
                  📸 <span>PixShare</span>
                </div>
                <div className="navbar-user">
                  <span className="user-email">{user.email}</span>
                  {/* Dark Mode Toggle */}
                  <button onClick={toggleTheme} className="theme-toggle-btn">
                    {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                  </button>
                  <button onClick={logout} className="logout-navbar-btn">Abmelden</button>
                </div>
              </div>
            </nav>

            <div className="main-layout">
              <Routes>
                <Route path="/" element={<AlbumList user={user} />} />
                <Route path="/album/:albumId" element={<AlbumView user={user} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        ) : (
          <Auth />
        )}
      </div>
    </Router>
  );
}

export default App;