'use client';

import { useState } from 'react';
import styles from './new.module.css';
import { useRouter } from 'next/navigation';

export default function NewTicket() {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('LOW');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8080/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ subject, description, priority })
            });

            if (res.ok) {
                router.push('/dashboard');
            } else {
                alert('Failed to create ticket');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1>Create New Ticket</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.group}>
                        <label>Subject</label>
                        <input
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            required
                            placeholder="Brief summary of the issue"
                        />
                    </div>

                    <div className={styles.group}>
                        <label>Priority</label>
                        <select value={priority} onChange={e => setPriority(e.target.value)}>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                    </div>

                    <div className={styles.group}>
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                            rows={5}
                            placeholder="Detailed explanation..."
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={() => router.back()} className={styles.cancelBtn}>Cancel</button>
                        <button type="submit" className={styles.submitBtn}>Submit Ticket</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
