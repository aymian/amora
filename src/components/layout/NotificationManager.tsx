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

        // Aggressive but dismissible inform/prompt
        const enforcementInterval = setInterval(() => {
            if (!("Notification" in window)) return;

            // Only prompt if not granted AND not already shown in this session (or allowed to dismiss)
            const hasDismissed = sessionStorage.getItem("dismissed_resonance_prompt");

            if (Notification.permission !== "granted" && !hasDismissed) {
                toast.error("⚠️ RESONANCE LINK SEVERED", {
                    description: "Enable notifications for real-time directorial sync. Status: 'DE-SYNCHRONIZED'.",
                    duration: 10000, // Not Infinity anymore, give them a break
                    id: "resonance-enforcement",
                    onDismiss: () => sessionStorage.setItem("dismissed_resonance_prompt", "true"),
                    action: {
                        label: "FIX SYNC",
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
        }, 60000);

        return () => clearInterval(enforcementInterval);
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
