"use client";

import { useEffect, useState } from "react";
import "./CometChatSelector.css";

// Define props interface for component
interface SelectorProps {
    onSelectorItemClicked?: (input: any, type: string) => void;
}

// CometChatSelector component definition
export const CometChatSelector = (props: SelectorProps) => {
    const {
        onSelectorItemClicked = () => { }, // Default function if no prop is provided
    } = props;

    // State to store the currently logged-in user
    const [loggedInUser, setLoggedInUser] = useState<any>(null);
    
    // State to track the currently selected item (conversation, user, group, or call)
    const [activeItem, setActiveItem] = useState<any>(undefined);
    
    // State to store dynamically imported modules
    const [CometChat, setCometChat] = useState<any>(null);
    const [CometChatConversations, setCometChatConversations] = useState<any>(null);
    const [CometChatUIKitLoginListener, setCometChatUIKitLoginListener] = useState<any>(null);

    // Load CometChat modules on client side
    useEffect(() => {
        const loadModules = async () => {
            const chatSdk = await import("@cometchat/chat-sdk-javascript");
            const chatUikit = await import("@cometchat/chat-uikit-react");
            
            setCometChat(chatSdk.CometChat);
            setCometChatConversations(() => chatUikit.CometChatConversations);
            setCometChatUIKitLoginListener(chatUikit.CometChatUIKitLoginListener);
        };
        
        loadModules();
    }, []);

    useEffect(() => {
        if (CometChatUIKitLoginListener) {
            // Retrieve the logged-in user from CometChat's login listener
            let user = CometChatUIKitLoginListener.getLoggedInUser();
            setLoggedInUser(user);
        }
    }, [CometChatUIKitLoginListener]);

    if (!CometChat || !CometChatConversations || !loggedInUser) {
        return null;
    }

    const ConversationsComponent = CometChatConversations;

    return (
        <>
            {/* Render CometChatConversations only if a user is logged in */}
            <ConversationsComponent
                activeConversation={activeItem instanceof CometChat.Conversation ? activeItem : undefined}
                onItemClick={(e: any) => {
                    setActiveItem(e); // Update the selected item state
                    onSelectorItemClicked(e, "updateSelectedItem"); // Trigger callback with selected item
                }}
            />
        </>
    );
};
