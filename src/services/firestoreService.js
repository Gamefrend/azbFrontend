import { db } from '../config/firebase-config';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    increment,
    writeBatch
} from 'firebase/firestore';

// ============================================
// LIKES
// ============================================

export const addLike = async (mediaId, albumId, visitorId, visitorName) => {
    const likeId = `${visitorId}_${mediaId}`;
    const likeRef = doc(db, 'likes', likeId);

    const existing = await getDoc(likeRef);
    if (existing.exists()) {
        return { alreadyLiked: true };
    }

    const batch = writeBatch(db);

    batch.set(likeRef, {
        visitorId,
        visitorName,
        mediaId,
        albumId,
        createdAt: serverTimestamp()
    });

    const statsRef = doc(db, 'mediaStats', mediaId);
    batch.set(statsRef, {
        likeCount: increment(1),
        lastUpdated: serverTimestamp()
    }, { merge: true });

    await batch.commit();
    return { success: true };
};

export const removeLike = async (mediaId, visitorId) => {
    const likeId = `${visitorId}_${mediaId}`;
    const likeRef = doc(db, 'likes', likeId);

    const existing = await getDoc(likeRef);
    if (!existing.exists()) {
        return { notFound: true };
    }

    const batch = writeBatch(db);
    batch.delete(likeRef);

    const statsRef = doc(db, 'mediaStats', mediaId);
    batch.set(statsRef, {
        likeCount: increment(-1),
        lastUpdated: serverTimestamp()
    }, { merge: true });

    await batch.commit();
    return { success: true };
};

export const hasUserLiked = async (mediaId, visitorId) => {
    const likeId = `${visitorId}_${mediaId}`;
    const likeRef = doc(db, 'likes', likeId);
    const snapshot = await getDoc(likeRef);
    return snapshot.exists();
};

export const subscribeLikes = (mediaId, callback) => {
    const q = query(
        collection(db, 'likes'),
        where('mediaId', '==', mediaId)
    );

    return onSnapshot(q, (snapshot) => {
        const likes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(likes);
    });
};

// ============================================
// COMMENTS
// ============================================

export const addComment = async (mediaId, albumId, visitorId, visitorName, text) => {
    const batch = writeBatch(db);

    const commentRef = doc(collection(db, 'comments'));
    batch.set(commentRef, {
        mediaId,
        albumId,
        visitorId,
        visitorName,
        text,
        createdAt: serverTimestamp()
    });

    const statsRef = doc(db, 'mediaStats', mediaId);
    batch.set(statsRef, {
        commentCount: increment(1),
        lastUpdated: serverTimestamp()
    }, { merge: true });

    await batch.commit();
    return { id: commentRef.id };
};

export const deleteComment = async (commentId, mediaId) => {
    const batch = writeBatch(db);

    batch.delete(doc(db, 'comments', commentId));

    const statsRef = doc(db, 'mediaStats', mediaId);
    batch.set(statsRef, {
        commentCount: increment(-1),
        lastUpdated: serverTimestamp()
    }, { merge: true });

    await batch.commit();
    return { success: true };
};

export const subscribeComments = (mediaId, callback) => {
    const q = query(
        collection(db, 'comments'),
        where('mediaId', '==', mediaId),
        orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const comments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(comments);
    });
};

// ============================================
// IMPRESSIONS / VIEWS
// ============================================

export const trackImpression = async (mediaId, visitorId = 'anonymous', source = 'album_view') => {
    const batch = writeBatch(db);

    const impressionRef = doc(collection(db, 'impressions'));
    batch.set(impressionRef, {
        mediaId,
        visitorId,
        source,
        timestamp: serverTimestamp()
    });

    const statsRef = doc(db, 'mediaStats', mediaId);
    batch.set(statsRef, {
        viewCount: increment(1),
        lastUpdated: serverTimestamp()
    }, { merge: true });

    await batch.commit();
};

// ============================================
// MEDIA STATS
// ============================================

export const getMediaStats = async (mediaId) => {
    const statsRef = doc(db, 'mediaStats', mediaId);
    const snapshot = await getDoc(statsRef);

    if (snapshot.exists()) {
        return snapshot.data();
    }

    return {
        likeCount: 0,
        commentCount: 0,
        viewCount: 0
    };
};

export const subscribeMediaStats = (mediaId, callback) => {
    const statsRef = doc(db, 'mediaStats', mediaId);

    return onSnapshot(statsRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data());
        } else {
            callback({
                likeCount: 0,
                commentCount: 0,
                viewCount: 0
            });
        }
    });
};

export const getMultipleMediaStats = async (mediaIds) => {
    const stats = {};

    for (const mediaId of mediaIds) {
        stats[mediaId] = await getMediaStats(mediaId);
    }

    return stats;
};