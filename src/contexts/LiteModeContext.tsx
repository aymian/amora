import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LiteModeContextType {
    isLiteMode: boolean;
    isDataSaver: boolean;
    setLiteMode: (value: boolean) => void;
    setDataSaver: (value: boolean) => void;
    connectionSpeed: number | null;
}

const LiteModeContext = createContext<LiteModeContextType | undefined>(undefined);

export function LiteModeProvider({ children }: { children: ReactNode }) {
    const [isLiteMode, setIsLiteMode] = useState(() => {
        const saved = localStorage.getItem("lite-mode");
        return saved ? JSON.parse(saved) : false;
    });
    const [isDataSaver, setIsDataSaver] = useState(() => {
        const saved = localStorage.getItem("data-saver");
        return saved ? JSON.parse(saved) : false;
    });
    const [connectionSpeed, setConnectionSpeed] = useState<number | null>(null);

    useEffect(() => {
        if ("connection" in navigator) {
            const conn = (navigator as any).connection;
            const updateConnection = () => {
                setConnectionSpeed(conn.downlink);
                // If speed is less than 1 Mbps and user hasn't manually set a preference
                if (conn.downlink < 1 && localStorage.getItem("lite-mode") === null) {
                    console.log("Slow connection detected (< 1Mbps). Enabling Lite Mode automatically.");
                    setIsLiteMode(true);
                }
            };

            updateConnection();
            conn.addEventListener("change", updateConnection);
            return () => conn.removeEventListener("change", updateConnection);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("lite-mode", JSON.stringify(isLiteMode));
        if (isLiteMode) {
            document.documentElement.classList.add('lite-mode');
        } else {
            document.documentElement.classList.remove('lite-mode');
        }
    }, [isLiteMode]);

    useEffect(() => {
        localStorage.setItem("data-saver", JSON.stringify(isDataSaver));
    }, [isDataSaver]);

    return (
        <LiteModeContext.Provider value={{
            isLiteMode,
            isDataSaver,
            setLiteMode: setIsLiteMode,
            setDataSaver: setIsDataSaver,
            connectionSpeed
        }}>
            {children}
        </LiteModeContext.Provider>
    );
}

export function useLiteMode() {
    const context = useContext(LiteModeContext);
    if (context === undefined) {
        throw new Error("useLiteMode must be used within a LiteModeProvider");
    }
    return context;
}
