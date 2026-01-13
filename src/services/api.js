import {auth} from '../config/firebase-config';

const API_URL = 'https://api-service-898583273277.europe-west3.run.app/';

// Auth Header holen
const getHeaders = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Nicht eingeloggt');

    const token = await user.getIdToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

export const api = {
    // ==================== USER ====================
    async syncUser() {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/users/sync`, {
            method: 'POST',
            headers
        });
        if (!res.ok) throw new Error('Sync fehlgeschlagen');
        return res.json();
    },

    async searchUsers(email) {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/users/search?email=${encodeURIComponent(email)}`, {
            headers
        });
        if (!res.ok) throw new Error('Suche fehlgeschlagen');
        return res.json();
    },

    // ==================== ALBUMS ====================
    async getAlbums() {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/albums`, {headers});
        if (!res.ok) throw new Error('Laden fehlgeschlagen');
        return res.json();
    },

    async createAlbum(title, description = null) {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/albums`, {
            method: 'POST',
            headers,
            body: JSON.stringify({title, description}),
        });
        if (!res.ok) throw new Error('Erstellen fehlgeschlagen');
        return res.json();
    },

    async getAlbum(albumId) {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/albums/${albumId}`, {headers});
        if (!res.ok) throw new Error('Laden fehlgeschlagen');
        return res.json();
    },

    async updateAlbum(albumId, data) {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/albums/${albumId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Update fehlgeschlagen');
        return res.json();
    },

    async deleteAlbum(albumId) {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/albums/${albumId}`, {
            method: 'DELETE',
            headers
        });
        if (!res.ok) throw new Error('Löschen fehlgeschlagen');
        return res.json();
    },

    // ==================== PERMISSIONS ====================
    async getPermissions(albumId) {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/albums/${albumId}/permissions`, {headers});
        if (!res.ok) throw new Error('Laden fehlgeschlagen');
        return res.json();
    },

    async addPermission(albumId, email, role) {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/albums/${albumId}/permissions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({email, role}),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Hinzufügen fehlgeschlagen');
        }
        return res.json();
    },

    async removePermission(albumId, userUid) {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/albums/${albumId}/permissions/${userUid}`, {
            method: 'DELETE',
            headers,
        });
        if (!res.ok) throw new Error('Entfernen fehlgeschlagen');
        return res.json();
    },

    // ==================== MEDIA ====================
    async getMedia(albumId) {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/albums/${albumId}/media`, {headers});
        if (!res.ok) throw new Error('Laden fehlgeschlagen');
        return res.json();
    },

    async uploadMedia(albumId, files) {
        const user = auth.currentUser;
        if (!user) throw new Error('Nicht eingeloggt');
        const token = await user.getIdToken();

        const formData = new FormData();
        for (const file of files) {
            formData.append('images', file);
        }

        const res = await fetch(`${API_URL}/albums/${albumId}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // KEIN Content-Type bei FormData!
            },
            body: formData,
        });
        if (!res.ok) throw new Error('Upload fehlgeschlagen');
        return res.json();
    },

    async deleteMedia(mediaId) {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/media/${mediaId}`, {
            method: 'DELETE',
            headers
        });
        if (!res.ok) throw new Error('Löschen fehlgeschlagen');
        return res.json();
    },

    // ==================== EVENTS ====================
    async getEvents() {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/events`, {headers});
        if (!res.ok) throw new Error('Events laden fehlgeschlagen');
        return res.json();
    },

    async createEvent(title, description = null) {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers,
            body: JSON.stringify({title, description}),
        });
        if (!res.ok) throw new Error('Event erstellen fehlgeschlagen');
        return res.json();
    },

    async getEvent(eventId) {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/events/${eventId}`, {headers});
        if (!res.ok) throw new Error('Event laden fehlgeschlagen');
        return res.json();
    },

    async uploadEventMedia(eventId, files) {
        const user = auth.currentUser;
        if (!user) throw new Error('Nicht eingeloggt');
        const token = await user.getIdToken();

        const formData = new FormData();
        for (const file of files) {
            formData.append('images', file);
        }

        const res = await fetch(`${API_URL}/events/${eventId}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        if (!res.ok) throw new Error('Upload fehlgeschlagen');
        return res.json();
    },

    async getEventMedia(eventId) {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/events/${eventId}/media`, {headers});
        if (!res.ok) throw new Error('Medien laden fehlgeschlagen');
        return res.json();
    },
};