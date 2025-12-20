import { auth } from "./config/firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

// Auth-Komponente: Nur Login (kein automatisches Anlegen von Accounts mehr).

export const Auth = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [errorText, setErrorText] = useState("");

  // signIn: versucht den Benutzer mit Email/Passwort anzumelden.
  const signIn = async () => {
    setErrorText(""); // vorherige Fehler zurücksetzen
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Erfolgreich angemeldet");
    } catch (err) {
      const code = err?.code || "";
      console.error(err);

      setErrorText("Anmeldung fehlgeschlagen.");
      
    }
  };

  // JSX: zentriertes Formular mit klaren deutschen Labels und Kommentaren.
  return (
    <div className="auth-container">
      <form
        className="auth-form"
        onSubmit={(e) => {
          // Verhindere Seitenreload und starte Login
          e.preventDefault();
          signIn();
        }}
      >
        <h2>Anmelden</h2>

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

        <button type="submit">Anmelden</button>

        {/* Roter Fehlertext unter dem Formular, wenn etwas schief geht */}
        {errorText && <div className="auth-error">{errorText}</div>}
      </form>
    </div>
  );
};

export default Auth;