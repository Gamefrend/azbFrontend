import { useState, useEffect } from 'react';
import { api } from '../services/api';

const ShareModal = ({ albumId, albumTitle, onClose }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('viewer');
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Berechtigungen laden
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const data = await api.getPermissions(albumId);
                setPermissions(data.permissions);
            } catch (err) {
                console.error('Fehler beim Laden der Berechtigungen:', err);
                setError('Berechtigungen konnten nicht geladen werden');
            } finally {
                setLoading(false);
            }
        };
        fetchPermissions();
    }, [albumId]);

    // User einladen
    const handleInvite = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setError(null);
        setSuccess(null);

        try {
            const result = await api.addPermission(albumId, email.trim(), role);

            // Neue Berechtigung zur Liste hinzufügen (oder aktualisieren)
            setPermissions(prev => {
                const exists = prev.find(p => p.user_uid === result.permission.user_uid);
                if (exists) {
                    return prev.map(p =>
                        p.user_uid === result.permission.user_uid
                            ? { ...p, role: result.permission.role, email, display_name: email }
                            : p
                    );
                }
                return [...prev, { ...result.permission, email, display_name: email }];
            });

            setEmail('');
            setSuccess(`${email} wurde als ${role === 'editor' ? 'Editor' : 'Betrachter'} eingeladen!`);

            // Erfolgs-Nachricht nach 3 Sekunden ausblenden
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Einladung fehlgeschlagen');
        }
    };

    // Berechtigung entfernen
    const handleRemove = async (userUid, userEmail) => {
        if (!window.confirm(`${userEmail} wirklich entfernen?`)) return;

        try {
            await api.removePermission(albumId, userUid);
            setPermissions(prev => prev.filter(p => p.user_uid !== userUid));
            setSuccess(`${userEmail} wurde entfernt`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Entfernen fehlgeschlagen');
        }
    };

    // Rollen-Badge Styling
    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'owner': return 'role-badge owner';
            case 'editor': return 'role-badge editor';
            default: return 'role-badge viewer';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'owner': return '👑 Owner';
            case 'editor': return '✏️ Editor';
            default: return '👁️ Viewer';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>✕</button>

                <h2>Album teilen</h2>
                <p className="share-album-title">"{albumTitle}"</p>

                {/* Einladungs-Formular */}
                <form onSubmit={handleInvite} className="invite-form">
                    <div className="invite-row">
                        <input
                            type="email"
                            placeholder="Email-Adresse eingeben"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="viewer">👁️ Betrachter</option>
                            <option value="editor">✏️ Editor</option>
                        </select>
                        <button type="submit" className="primary-btn">Einladen</button>
                    </div>
                </form>

                {/* Feedback Messages */}
                {error && <div className="share-error">{error}</div>}
                {success && <div className="share-success">{success}</div>}

                {/* Berechtigungen Liste */}
                <div className="permissions-section">
                    <h3>Personen mit Zugriff</h3>

                    {loading ? (
                        <p className="loading-text">Lade...</p>
                    ) : permissions.length > 0 ? (
                        <ul className="permissions-list">
                            {permissions.map((perm) => (
                                <li key={perm.user_uid} className="permission-item">
                                    <div className="permission-user">
                                        <div className="user-avatar">
                                            {(perm.display_name || perm.email || '?')[0].toUpperCase()}
                                        </div>
                                        <div className="user-info">
                                            <span className="user-name">{perm.display_name || 'Unbekannt'}</span>
                                            <span className="user-email">{perm.email}</span>
                                        </div>
                                    </div>
                                    <div className="permission-actions">
                    <span className={getRoleBadgeClass(perm.role)}>
                      {getRoleLabel(perm.role)}
                    </span>
                                        {perm.role !== 'owner' && (
                                            <button
                                                className="remove-btn"
                                                onClick={() => handleRemove(perm.user_uid, perm.email)}
                                                title="Zugriff entfernen"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-permissions">Nur du hast Zugriff auf dieses Album.</p>
                    )}
                </div>

                {/* Info Box */}
                <div className="share-info-box">
                    <p><strong>👁️ Betrachter:</strong> Kann Fotos ansehen</p>
                    <p><strong>✏️ Editor:</strong> Kann Fotos hinzufügen & löschen</p>
                    <p><strong>👑 Owner:</strong> Volle Kontrolle (Album löschen, Berechtigungen verwalten)</p>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;