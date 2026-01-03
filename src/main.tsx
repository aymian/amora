import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

// Request persistent storage to prevent browser from clearing cache
if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then(granted => {
        if (granted) console.log("Storage will not be cleared by the browser!");
    });
}

createRoot(document.getElementById("root")!).render(<App />);
