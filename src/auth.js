import { auth } from "./config/firebase-config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { useState } from "react";
import { api } from './services/api';  // ← NEU

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorText, setErrorText] = useState("");

  const googleProvider = new GoogleAuthProvider();

  // NEU: User in SQL synchronisieren
  const syncUserToSQL = async () => {
    try {
      await api.syncUser();
      console.log("User in SQL synchronisiert");
    } catch (err) {
      console.error("Fehler beim User-Sync:", err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorText("");

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        await syncUserToSQL();  // ← NEU
        console.log("Registrierung erfolgreich");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        await syncUserToSQL();  // ← NEU
        console.log("Login erfolgreich");
      }
    } catch (err) {
      console.error("Auth-Fehler:", err);
      if (err.code === "auth/email-already-in-use") {
        setErrorText("Diese E-Mail wird bereits verwendet.");
      } else if (err.code === "auth/weak-password") {
        setErrorText("Das Passwort muss mindestens 6 Zeichen haben.");
      } else {
        setErrorText("Fehler: " + err.message);
      }
    }
  };

  const signInWithGoogle = async () => {
    setErrorText("");
    try {
      await signInWithPopup(auth, googleProvider);
      await syncUserToSQL();  // ← NEU
    } catch (err) {
      setErrorText("Google-Anmeldung fehlgeschlagen.");
    }
  };

  return (
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleAuth}>
          <h2>{isRegistering ? "Account erstellen" : "Anmelden"}</h2>

          <label htmlFor="email">E‑Mail</label>
          <input
              id="email"
              type="email"
              placeholder="deine@beispiel.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
          />

          <label htmlFor="password">Passwort</label>
          <input
              id="password"
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
          />

          <button type="submit" className="primary-btn" style={{ justifyContent: 'center' }}>
            {isRegistering ? "Jetzt Registrieren" : "Anmelden"}
          </button>
          <p
              style={{ fontSize: "0.8rem", textAlign: "center", cursor: "pointer", color: "#61dafb", marginTop: "10px" }}
              onClick={() => {
                setIsRegistering(!isRegistering);
                setErrorText("");
              }}
          >
            {isRegistering ? "Schon ein Account? Hier anmelden" : "Noch kein Account? Hier registrieren"}
          </p>

          <hr />

          <button type="button" onClick={signInWithGoogle} className="google-btn-modern">
            <img src="/Google.png" alt="G" width="18" />
            Mit Google anmelden
          </button>

          {errorText && <div className="auth-error">{errorText}</div>}
        </form>
      </div>
  );
};

export default Auth;