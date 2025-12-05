"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { COMETCHAT_CONFIG } from "@/config/cometchat";

// Lazy load CometChat only on client side
let CometChat: any = null;
let CometChatUIKit: any = null;
let UIKitSettingsBuilder: any = null;

interface CometChatContextValue {
    currentUser: any | null;
    loading: boolean;
    error: string | null;
    loginUser: (uid: string, name: string) => Promise<void>;
    logoutUser: () => Promise<void>;
}

const CometChatContext = createContext<CometChatContextValue | null>(null);

export function useCometChat() {
    const context = useContext(CometChatContext);
    if (!context) {
        throw new Error("useCometChat must be used within a CometChatProvider");
    }
    return context;
}

interface CometChatProviderProps {
    children: ReactNode;
}

export function CometChatProvider({ children }: CometChatProviderProps) {
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    // Initialize CometChat UIKit once
    useEffect(() => {
        const initCometChat = async () => {
            if (initialized) return;
            if (typeof window === "undefined") return;

            try {
                // Dynamically import CometChat modules only on client
                const chatSdk = await import("@cometchat/chat-sdk-javascript");
                const chatUikit = await import("@cometchat/chat-uikit-react");
                
                CometChat = chatSdk.CometChat;
                CometChatUIKit = chatUikit.CometChatUIKit;
                UIKitSettingsBuilder = chatUikit.UIKitSettingsBuilder;

                const { appId, region, authKey } = COMETCHAT_CONFIG;

                if (!appId || !region || !authKey) {
                    throw new Error(
                        "CometChat configuration is missing. Please check your environment variables."
                    );
                }

                // Initialize UIKit
                const UIKitSettings = new UIKitSettingsBuilder()
                    .setAppId(appId)
                    .setRegion(region)
                    .setAuthKey(authKey)
                    .subscribePresenceForAllUsers()
                    .build();

                await CometChatUIKit.init(UIKitSettings);
                console.log("CometChat UI Kit initialized successfully.");
                setInitialized(true);

                // Check if user is already logged in
                const loggedInUser = await CometChatUIKit.getLoggedinUser();
                if (loggedInUser) {
                    setCurrentUser(loggedInUser);
                }
            } catch (err) {
                console.error("CometChat initialization error:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to initialize CometChat"
                );
            } finally {
                setLoading(false);
            }
        };

        initCometChat();
    }, [initialized]);

    const loginUser = async (uid: string, name: string): Promise<void> => {
        if (!initialized || !CometChat || !CometChatUIKit) {
            throw new Error("CometChat is not initialized yet");
        }

        try {
            setLoading(true);
            setError(null);

            // Try to login with existing user
            var user = new CometChat.User(uid);

            try {
                user = await CometChatUIKit.login(uid);
                console.log("User logged in successfully:", user.getName());
            } catch (loginError: any) {
                // If user doesn't exist, create new user
                if (loginError?.code === "ERR_UID_NOT_FOUND") {
                    console.log("User not found, creating new user:", uid);

                    const newUser = new CometChat.User(uid);
                    newUser.setName(name);

                    const createdUser = await CometChatUIKit.createUser(
                        newUser
                    );

                    // Now login with the created user
                    user = await CometChatUIKit.login(uid);
                    console.log(
                        "New user created and logged in:",
                        user.getName()
                    );
                } else {
                    throw loginError;
                }
            }

            setCurrentUser(user);
        } catch (err) {
            console.error("Error logging in user:", err);
            const errorMessage =
                err instanceof Error ? err.message : "Failed to login user";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const logoutUser = async (): Promise<void> => {
        if (!CometChatUIKit) return;
        
        try {
            setLoading(true);
            await CometChatUIKit.logout();
            setCurrentUser(null);
            console.log("User logged out successfully");
        } catch (err) {
            console.error("Error logging out user:", err);
            setError(
                err instanceof Error ? err.message : "Failed to logout user"
            );
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value: CometChatContextValue = {
        currentUser,
        loading,
        error,
        loginUser,
        logoutUser,
    };

    return (
        <CometChatContext.Provider value={value}>
            {children}
        </CometChatContext.Provider>
    );
}
