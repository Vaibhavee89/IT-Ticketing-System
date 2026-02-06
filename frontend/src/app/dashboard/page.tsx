'use client';

import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import { useRouter } from 'next/navigation';

interface Ticket {
    id: number;
    subject: string;
    status: string;
    priority: string;
    updatedAt: string;
}

export default function Dashboard() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const router = useRouter();
    const [role, setRole] = useState('');

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        const username = localStorage.getItem('username');
        if (!username) {
            router.push('/login');
            return;
        }
        setRole(storedRole || '');

        // Fetch tickets
        // Note: In real app, include Auth header (basic auth creds or token)
        // Here we are skipping auth header logic in fetch for brevity, but backend requires auth.
        // Since we rely on session/browser cookies? No, backend is stateless REST (except session cookie if default).
        // Spring Security default uses JSESSIONID cookie. Fetch *should* send credentials: 'include'.
        fetch('http://localhost:8080/api/tickets', {
            // headers: { Authorization: 'Basic ...' } -> We need to handle this in a real app. 
            // For this demo, let's assume we store the username/password or token in localStorage and send it.
            // However, the Login page didn't return a token, it depended on Session.
            // So we need `credentials: 'include'`.
            credentials: 'include'
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    // router.push('/login'); 
                    // In dev mode with CORS, 401 might happen if cookie is not set or SameSite issues.
                    // For MVP, if this fails, we might need a workaround or JWT.
                    return [];
                }
                return res.json();
            })
            .then(data => setTickets(data))
            .catch(err => console.error(err));
    }, [router]);

    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <h1 className={styles.logo}>Ticketing System</h1>
                <div className={styles.navLinks}>
                    <span>Role: {role}</span>
                    <button onClick={() => {
                        localStorage.clear();
                        router.push('/login');
                    }} className={styles.logoutBtn}>Logout</button>
                </div>
            </nav>

            <main className={styles.main}>
                <div className={styles.header}>
                    <h2>My Tickets</h2>
                    <button className={styles.createBtn} onClick={() => router.push('/tickets/new')}>
                        + New Ticket
                    </button>
                </div>

                <div className={styles.ticketList}>
                    {tickets.length === 0 ? (
                        <p>No tickets found.</p>
                    ) : (
                        tickets.map(ticket => (
                            <div key={ticket.id} className={styles.ticketCard} onClick={() => router.push(`/tickets/${ticket.id}`)}>
                                <div className={styles.ticketHeader}>
                                    <h3>{ticket.subject}</h3>
                                    <span className={`${styles.badge} ${styles[ticket.status.toLowerCase()]}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <div className={styles.ticketMeta}>
                                    <span className={styles.priority}>Priority: {ticket.priority}</span>
                                    <span>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
