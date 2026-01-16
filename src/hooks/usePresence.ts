import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export function usePresence(userId: string | undefined) {
    useEffect(() => {
        if (!userId) return;

        const userRef = doc(db, 'users', userId);

        // Set online status
        const setOnline = async () => {
            try {
                // We use setDoc with merge to ensure field exists, 
                // but updateDoc is better if we know user exists. 
                // Assuming user exists since we have ID.
                await updateDoc(userRef, {
                    isOnline: true,
                    lastSeen: serverTimestamp()
                });
            } catch (e) {
                console.error("Error setting presence:", e);
            }
        };

        setOnline();

        // Heartbeat every 2 minutes
        const interval = setInterval(() => {
            updateDoc(userRef, {
                lastSeen: serverTimestamp()
            });
        }, 2 * 60 * 1000);

        // Cleanup: Set offline on unmount (optional, but good for SPA nav)
        // Ideally we use onDisconnect form Realtime DB, but for Firestore we can just update on window close or reliable triggers.
        // Firestore doesn't have built-in onDisconnect for document writes like RTDB.
        // We will just rely on "lastSeen" time difference for "Online" status.

        return () => clearInterval(interval);
    }, [userId]);
}
