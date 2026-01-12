import { useState, useEffect } from 'react';
import {
    addLike,
    removeLike,
    hasUserLiked,
    subscribeLikes,
    addComment,
    deleteComment,
    subscribeComments,
    subscribeMediaStats,
    trackImpression
} from '../services/firestoreService';

const MediaInteractions = ({ media, user }) => {
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState([]);
    const [comments, setComments] = useState([]);
    const [stats, setStats] = useState({ likeCount: 0, commentCount: 0, viewCount: 0 });
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [showLikesList, setShowLikesList] = useState(false);

    const mediaId = media.id;

    // Impression tracken beim Öffnen
    useEffect(() => {
        if (mediaId && user) {
            trackImpression(mediaId, user.uid, 'lightbox');
        }
    }, [mediaId, user]);

    // Prüfen ob User bereits geliked hat
    useEffect(() => {
        if (mediaId && user) {
            hasUserLiked(mediaId, user.uid).then(setLiked);
        }
    }, [mediaId, user]);

    // Echtzeit-Subscriptions
    useEffect(() => {
        if (!mediaId) return;

        const unsubStats = subscribeMediaStats(mediaId, setStats);
        const unsubLikes = subscribeLikes(mediaId, setLikes);
        const unsubComments = subscribeComments(mediaId, setComments);

        return () => {
            unsubStats();
            unsubLikes();
            unsubComments();
        };
    }, [mediaId]);

    // Like Toggle
    const handleLikeToggle = async () => {
        if (!user || loading) return;
        setLoading(true);

        try {
            if (liked) {
                await removeLike(mediaId, user.uid);
                setLiked(false);
            } else {
                await addLike(mediaId, media.album_id, user.uid, user.email || 'Anonym');
                setLiked(true);
            }
        } catch (error) {
            console.error('Like error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Kommentar senden
    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user || loading) return;
        setLoading(true);

        try {
            await addComment(
                mediaId,
                media.album_id,
                user.uid,
                user.email || 'Anonym',
                newComment.trim()
            );
            setNewComment('');
        } catch (error) {
            console.error('Comment error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Kommentar löschen
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Kommentar löschen?')) return;

        try {
            await deleteComment(commentId, mediaId);
        } catch (error) {
            console.error('Delete comment error:', error);
        }
    };

    // Timestamp formatieren
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="media-interactions">
            {/* Stats Bar */}
            <div className="interaction-stats">
                <button
                    className={`like-btn ${liked ? 'liked' : ''}`}
                    onClick={handleLikeToggle}
                    disabled={loading}
                >
                    <span className="like-icon">{liked ? '❤️' : '🤍'}</span>
                    <span className="like-count">{stats.likeCount}</span>
                </button>

                <div className="stat-item">
                    <span className="stat-icon">💬</span>
                    <span>{stats.commentCount}</span>
                </div>

                <div className="stat-item">
                    <span className="stat-icon">👁️</span>
                    <span>{stats.viewCount}</span>
                </div>
            </div>

            {/* Likes Liste */}
            {stats.likeCount > 0 && (
                <div className="likes-section">
                    <button
                        className="show-likes-btn"
                        onClick={() => setShowLikesList(!showLikesList)}
                    >
                        {showLikesList ? '▼' : '▶'} {stats.likeCount} Gefällt mir
                    </button>

                    {showLikesList && (
                        <div className="likes-list">
                            {likes.map(like => (
                                <div key={like.id} className="like-item">
                                    <div className="like-avatar">
                                        {(like.visitorName || '?')[0].toUpperCase()}
                                    </div>
                                    <span>{like.visitorName}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Kommentare */}
            <div className="comments-section">
                <h4>Kommentare ({stats.commentCount})</h4>

                <form onSubmit={handleSubmitComment} className="comment-form">
                    <input
                        type="text"
                        placeholder="Kommentar schreiben..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={loading}
                    />
                    <button type="submit" disabled={!newComment.trim() || loading}>
                        ➤
                    </button>
                </form>

                <div className="comments-list">
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className="comment-item">
                                <div className="comment-avatar">
                                    {(comment.visitorName || '?')[0].toUpperCase()}
                                </div>
                                <div className="comment-content">
                                    <div className="comment-header">
                                        <span className="comment-author">{comment.visitorName}</span>
                                        <span className="comment-time">{formatTime(comment.createdAt)}</span>
                                    </div>
                                    <p className="comment-text">{comment.text}</p>
                                </div>
                                {user && comment.visitorId === user.uid && (
                                    <button
                                        className="delete-comment-btn"
                                        onClick={() => handleDeleteComment(comment.id)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="no-comments">Noch keine Kommentare. Sei der Erste!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MediaInteractions;