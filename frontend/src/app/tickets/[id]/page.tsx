'use client';

import { useEffect, useState, use } from 'react';
import styles from './detail.module.css';
import { useRouter } from 'next/navigation';

interface User {
    username: string;
}

interface Ticket {
    id: number;
    subject: string;
    description: string;
    status: string;
    priority: string;
    createdBy: User;
    assignedTo?: User;
    updatedAt: string;
}

interface Comment {
    id: number;
    content: string;
    user: User;
    createdAt: string;
}

export default function TicketDetail({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const id = unwrappedParams.id;
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [status, setStatus] = useState('');
    const router = useRouter();
    const [role, setRole] = useState('');

    useEffect(() => {
        setRole(localStorage.getItem('role') || '');

        // Fetch Ticket
        fetch(`http://localhost:8080/api/tickets/${id}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setTicket(data);
                setStatus(data.status);
            })
            .catch(err => console.error(err));

        fetchComments();
    }, [id]);

    const fetchComments = () => {
        fetch(`http://localhost:8080/api/tickets/${id}/comments`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => setComments(data))
            .catch(err => console.error(err));
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        await fetch(`http://localhost:8080/api/tickets/${id}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ content: newComment })
        });
        setNewComment('');
        fetchComments();
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!ticket) return;
        setStatus(newStatus);
        await fetch(`http://localhost:8080/api/tickets/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ ...ticket, status: newStatus })
        });
        // Refresh ticket
        const res = await fetch(`http://localhost:8080/api/tickets/${id}`, { credentials: 'include' });
        setTicket(await res.json());
    };

    if (!ticket) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            <button onClick={() => router.push('/dashboard')} className={styles.backBtn}>&larr; Back to Dashboard</button>

            <div className={styles.mainLayout}>
                <div className={styles.ticketPanel}>
                    <div className={styles.header}>
                        <h1>{ticket.subject}</h1>
                        <div className={styles.meta}>
                            <span className={`${styles.priority} ${styles[ticket.priority.toLowerCase()]}`}>{ticket.priority}</span>
                            <span className={styles.date}>Created by {ticket.createdBy?.username} on {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className={styles.description}>
                        <h3>Description</h3>
                        <p>{ticket.description}</p>
                    </div>

                    <div className={styles.commentsSection}>
                        <h3>Comments</h3>
                        <div className={styles.commentList}>
                            {comments.map(comment => (
                                <div key={comment.id} className={styles.comment}>
                                    <div className={styles.commentHeader}>
                                        <span className={styles.author}>{comment.user.username}</span>
                                        <span className={styles.timestamp}>{new Date(comment.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p>{comment.content}</p>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                            <textarea
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                rows={3}
                            />
                            <button type="submit">Post Comment</button>
                        </form>
                    </div>
                </div>

                <div className={styles.sidebar}>
                    <div className={styles.card}>
                        <h3>Status</h3>
                        {(role === 'ADMIN' || role === 'SUPPORT') ? (
                            <select value={status} onChange={e => handleStatusChange(e.target.value)} className={styles.select}>
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        ) : (
                            <div className={`${styles.statusBadge} ${styles[status.toLowerCase()]}`}>{status}</div>
                        )}
                    </div>

                    <div className={styles.card}>
                        <h3>Assigned To</h3>
                        <p>{ticket.assignedTo ? ticket.assignedTo.username : 'Unassigned'}</p>
                        {(role === 'ADMIN' || role === 'SUPPORT') && (
                            <button className={styles.assignBtn} onClick={() => alert('Assign feature coming soon')}>Reassign</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
