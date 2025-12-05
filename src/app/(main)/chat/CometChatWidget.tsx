"use client";

import { useState, useEffect } from "react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import {
    CometChatMessageHeader,
    CometChatMessageList,
    CometChatMessageComposer,
} from "@cometchat/chat-uikit-react";

interface CometChatWidgetProps {
    conversationWith: string;
}

export default function CometChatWidget({
    conversationWith,
}: CometChatWidgetProps) {
    console.log("=== COMETCHAT WIDGET RENDER ===");
    console.log("conversationWith:", conversationWith);

    const [selectedUser, setSelectedUser] = useState<CometChat.User | null>(
        null
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!conversationWith) return;

        console.log("Fetching coach user from CometChat...");
        CometChat.getUser(conversationWith)
            .then((user) => {
                console.log("Coach user fetched successfully:", user.getName());
                setSelectedUser(user);
            })
            .catch((err) => {
                console.error("Failed fetching coach user:", err);
                setError(`Failed to load coach: ${err.message}`);
                // If coach doesn't exist, create a User object as fallback
                const fallbackUser = new CometChat.User(conversationWith);
                fallbackUser.setName(conversationWith);
                setSelectedUser(fallbackUser);
            });
    }, [conversationWith]);

    if (error) {
        return (
            <div style={{ padding: "20px", color: "red" }}>
                <h2>Error loading chat</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!selectedUser) {
        console.log("Waiting for coach user to load...");
        return (
            <div
                style={{
                    padding: "20px",
                    color: "black",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                }}
            >
                Loading chat...
            </div>
        );
    }

    console.log(
        "Rendering CometChat components with user:",
        selectedUser.getUid()
    );

    return (
        <div
            style={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <CometChatMessageHeader user={selectedUser} />
            <CometChatMessageList user={selectedUser} />
            <CometChatMessageComposer user={selectedUser} />
        </div>
    );
}
