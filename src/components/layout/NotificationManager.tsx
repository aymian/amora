import { useEffect, useRef } from "react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { toast } from "sonner";

export function NotificationManager() {
    const lastCheck = useRef<number>(Date.now());
    const permissionRequested = useRef(false);

    useEffect(() => {
        const handlePermissions = async () => {
            if (!("Notification" in window)) {
                console.warn("This browser does not support desktop notifications");
                return;
            }

            if (Notification.permission === "default") {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    new Notification("Resonance Synchronized", {
                        body: "Planetary directorial link established. You are now receiving live transmissions.",
                        icon: "/favicon.svg"
                    });
                }
            }
        };

        handlePermissions();

        // Aggressive re-prompting/informing (The "User Cannot Disable It" logic)
        const enforcementInterval = setInterval(() => {
            if (Notification.permission !== "granted") {
                toast.error("⚠️ CRITICAL: RESONANCE LINK SEVERED", {
                    description: "Priority Protocol 1: Amora requires push notification authorization for real-time directorial sync. Your status is currently 'DE-SYNCHRONIZED'.",
                    duration: Infinity,
                    id: "resonance-enforcement", // Prevents stacking
                    action: {
                        label: "ESTABLISH LINK",
                        onClick: () => {
                            if (Notification.permission === "default") {
                                handlePermissions();
                            } else {
                                window.open("https://support.google.com/chrome/answer/3220216", "_blank");
                            }
                        }
                    }
                });
            }
        }, 60000); // Check every minute to stay aggressive as requested

        return () => clearInterval(enforcementInterval);
    }, []);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        // Listen for new messages across all conversations participant is in
        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "modified") {
                    const chatData = change.doc.data();
                    const lastMsg = chatData.lastMessage;
                    const lastMsgAt = chatData.lastMessageAt?.toMillis() || 0;

                    // Only notify if it's a new message and NOT from the current user
                    // Note: participantDetails contains names. We need to find who sent it.
                    // In a real app, we'd check the latest message doc, but here we can approximate
                    // if lastMessageAt is very recent.

                    if (lastMsgAt > lastCheck.current && chatData.lastSenderId !== user.uid) {
                        // Update last check time
                        lastCheck.current = lastMsgAt;

                        // Trigger browser notification if not focusing on the page or just as a redundancy
                        if (Notification.permission === "granted") {
                            new Notification("New Resonance Signal", {
                                body: lastMsg,
                                icon: "/favicon.svg",
                                tag: "message-sync",
                                silent: false,
                            });
                        }

                        // Also show an in-app toast
                        toast("New Incoming Transmission", {
                            description: lastMsg,
                            action: {
                                label: "View",
                                onClick: () => window.location.href = "/messages"
                            }
                        });
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [auth.currentUser]);

    return null;
}
