// Kurze Auth-Komponente: Registrierung per Firebase Email/Password.
// Datei nutzt das `auth`-Objekt aus `src/config/firebase-config`.
import { auth } from "./config/firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

export const Auth = () => {
  // Lokale Eingabewerte für Email und Passwort
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Funktion, die bei Klick versucht, einen Nutzer zu registrieren.
  // Verwendet Firebase Auth: createUserWithEmailAndPassword(auth, email, pw)
  const signIn = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created!"); // bei Erfolg kurz loggen
    } catch (err) {
      // Fehler z.B. bei ungültiger Email oder bereits existierendem Nutzer
      console.error(err);
    }
  };

  // Minimaler JSX-Formularaufbau: zwei Inputs und ein Button.
  // Inputs aktualisieren die lokalen States; Button ruft `signIn` auf.
  return (
    <div>
      <input
        placeholder="Email..."
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Password..."
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={signIn}>Sign In</button>
    </div>
  );
};

export default Auth;