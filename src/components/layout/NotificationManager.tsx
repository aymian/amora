import { useEffect, useRef } from "react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { toast } from "sonner";

export function NotificationManager() {
    const lastCheck = useRef<number>(Date.now());
    const permissionRequested = useRef(false);

    useEffect(() => {
        const handlePermissions = async () => {
            if (!("Notification" in window)) return;

            if (Notification.permission === "default") {
                try {
                    const permission = await Notification.requestPermission();
                    if (permission === "granted") {
                        new Notification("Resonance Synchronized", {
                            body: "Planetary directorial link established.",
                            icon: "/favicon.svg"
                        });
                    }
                } catch (e) {
                    console.error("Permission request failed", e);
                }
            }
        };

        handlePermissions();




    }, []);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const authUnsub = auth.onAuthStateChanged((user) => {
            if (unsubscribe) unsubscribe();
            if (!user) return;

            // Listen for new messages across all conversations participant is in
            const q = query(
                collection(db, "conversations"),
                where("participants", "array-contains", user.uid)
            );

            unsubscribe = onSnapshot(q, async (snapshot) => {
                for (const change of snapshot.docChanges()) {
                    if (change.type === "modified") {
                        const chatData = change.doc.data();
                        const lastMsg = chatData.lastMessage;
                        const lastMsgAt = chatData.lastMessageAt?.toMillis() || Date.now();

                        if (lastMsgAt > lastCheck.current && chatData.lastSenderId !== user.uid) {
                            lastCheck.current = lastMsgAt;

                            // Extract sender info
                            const senderInfo = chatData.participantDetails?.[chatData.lastSenderId] || { name: "Citizen", photo: "/favicon.svg" };
                            const notificationTitle = `${senderInfo.name} • Resonance`;
                            const notificationIcon = senderInfo.photo || "/favicon.svg";

                            if (Notification.permission === "granted") {
                                try {
                                    const registration = await navigator.serviceWorker.getRegistration();
                                    if (registration && 'showNotification' in registration) {
                                        registration.showNotification(notificationTitle, {
                                            body: lastMsg,
                                            icon: notificationIcon,
                                            badge: "/favicon.svg",
                                            tag: "message-sync",
                                            data: { url: "/message" }
                                        });
                                    } else {
                                        new Notification(notificationTitle, {
                                            body: lastMsg,
                                            icon: notificationIcon
                                        });
                                    }
                                } catch (err) {
                                    new Notification(notificationTitle, {
                                        body: lastMsg,
                                        icon: notificationIcon
                                    });
                                }
                            }

                            toast(notificationTitle, {
                                description: lastMsg,
                                action: {
                                    label: "View",
                                    onClick: () => window.location.href = "/message"
                                }
                            });
                        }
                    }
                }
            });
        });

        return () => {
            authUnsub();
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return null;
}
