import { auth, db } from "./config/firebase-config";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { useState } from "react";
import { doc, setDoc, collection, addDoc, serverTimestamp, getDoc } from "firebase/firestore";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorText, setErrorText] = useState("");

  const googleProvider = new GoogleAuthProvider();

  // Erstellt das Nutzerprofil in Firestore, falls es noch nicht existiert
  const createUserProfile = async (user) => {
    try {
      const userDocRef = doc(db, "user", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // User-Dokument anlegen
        await setDoc(userDocRef, {
          email: user.email,
          name: user.displayName || "Neuer Nutzer",
          uid: user.uid,
          createdAt: serverTimestamp(),
        });

        // Erstes Album anlegen
        const albumRef = await addDoc(collection(db, "album"), {
          titel: "Mein erstes Album",
          ownerId: user.uid,
          createdAt: serverTimestamp(),
        });

        // Berechtigung anlegen
        await addDoc(collection(db, "album", albumRef.id, "accesses"), {
          userId: user.uid,
          role: "owner",
        });
      }
    } catch (err) {
      console.error("Fehler beim Erstellen des Profils:", err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorText("");
    
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(userCredential.user);
        console.log("Registrierung erfolgreich");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
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
      const result = await signInWithPopup(auth, googleProvider);
      await createUserProfile(result.user);
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

        <button type="submit">
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

        <button type="button" onClick={signInWithGoogle} className="google-btn">
          Mit Google anmelden
        </button>

        {errorText && <div className="auth-error">{errorText}</div>}
      </form>
    </div>
  );
};

export default Auth;