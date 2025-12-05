"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useCometChat } from "@/providers/CometChatProvider";
import { CoachProfilePanel } from "./CoachProfilePanel";
import { CoachAuthWrapper } from "./CoachAuthWrapper";
import "./page.css";

// Dynamic imports to prevent SSR issues with CometChat SDK
const CometChatSelector = dynamic(
    () => import("./CometChatSelector").then((mod) => mod.CometChatSelector),
    { ssr: false }
);

const CometChatMessageComposer = dynamic(
    () => import("@cometchat/chat-uikit-react").then((mod) => mod.CometChatMessageComposer),
    { ssr: false }
);

const CometChatMessageHeader = dynamic(
    () => import("@cometchat/chat-uikit-react").then((mod) => mod.CometChatMessageHeader),
    { ssr: false }
);

const CometChatMessageList = dynamic(
    () => import("@cometchat/chat-uikit-react").then((mod) => mod.CometChatMessageList),
    { ssr: false }
);



type ActiveView = "chat" | "profile";

// Chat icon component
const ChatIcon = ({ active }: { active: boolean }) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "url(#gradient)" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
        </defs>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

// Profile icon component
const ProfileIcon = ({ active }: { active: boolean }) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "url(#gradient-profile)" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <defs>
            <linearGradient
                id="gradient-profile"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
            >
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
        </defs>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

interface CoachData {
    id: number;
    name: string;
    title: string;
    specialty: string;
    bio: string;
    imageUrl: string;
    tags: string[];
    uid: string;
}

interface CoachDashboardProps {
    coachData: CoachData;
}

function CoachDashboard({ coachData }: CoachDashboardProps) {
    const { loginUser, currentUser, loading } = useCometChat();
    const [isInitialized, setIsInitialized] = useState(false);
    const [activeView, setActiveView] = useState<ActiveView>("chat");
    const [CometChat, setCometChat] = useState<any>(null);

    // State to store selected user or group
    const [selectedUser, setSelectedUser] = useState<any>(undefined);
    const [selectedGroup, setSelectedGroup] = useState<any>(undefined);

    // Load CometChat SDK and CSS on client side
    useEffect(() => {
        import("@cometchat/chat-sdk-javascript").then((mod) => {
            setCometChat(mod.CometChat);
        });
        // Load CSS dynamically
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/@cometchat/chat-uikit-react/dist/css-variables.css";
        document.head.appendChild(link);
    }, []);

    useEffect(() => {
        if (!isInitialized && !loading && coachData.uid) {
            loginUser(coachData.uid, coachData.name)
                .then(() => {
                    setIsInitialized(true);
                })
                .catch(console.error);
        }
    }, [isInitialized, loading, loginUser, coachData.uid, coachData.name]);

    if (loading || !currentUser || !CometChat) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    background: "#0a0a0a",
                    color: "#fff",
                }}
            >
                <p>Initializing Chat for {coachData.name}...</p>
            </div>
        );
    }

    return (
        <div className="coach-layout">
            {/* Icon Sidebar - WhatsApp Web style */}
            <div className="icon-sidebar">
                <div className="icon-sidebar-top">
                    <button
                        className={`sidebar-icon-btn ${
                            activeView === "chat" ? "active" : ""
                        }`}
                        onClick={() => setActiveView("chat")}
                        title="Chats"
                    >
                        <ChatIcon active={activeView === "chat"} />
                    </button>
                    <button
                        className={`sidebar-icon-btn ${
                            activeView === "profile" ? "active" : ""
                        }`}
                        onClick={() => setActiveView("profile")}
                        title="Profile"
                    >
                        <ProfileIcon active={activeView === "profile"} />
                    </button>
                </div>
                <div className="icon-sidebar-bottom">
                    {/* Placeholder for future icons like settings */}
                </div>
            </div>

            {/* Panel Area - shows conversations or profile based on activeView */}
            <div className="panel-area">
                {activeView === "chat" ? (
                    <div className="conversations-wrapper">
                        <CometChatSelector
                            onSelectorItemClicked={(activeItem: any) => {
                                let item = activeItem;
                                // Extract the conversation participant
                                if (
                                    activeItem instanceof CometChat.Conversation
                                ) {
                                    item = activeItem.getConversationWith();
                                }
                                // Update states based on the type of selected item
                                if (item instanceof CometChat.User) {
                                    setSelectedUser(item);
                                    setSelectedGroup(undefined);
                                } else if (item instanceof CometChat.Group) {
                                    setSelectedUser(undefined);
                                    setSelectedGroup(item);
                                } else {
                                    setSelectedUser(undefined);
                                    setSelectedGroup(undefined);
                                }
                            }}
                        />
                    </div>
                ) : (
                    <CoachProfilePanel initialProfile={coachData} />
                )}
            </div>

            {/* Main Content - only show when in chat view */}
            {activeView === "chat" && (
                <>
                    {selectedUser || selectedGroup ? (
                        <div className="messages-wrapper">
                            <CometChatMessageHeader
                                user={selectedUser}
                                group={selectedGroup}
                            />
                            <CometChatMessageList
                                user={selectedUser}
                                group={selectedGroup}
                            />
                            <CometChatMessageComposer
                                user={selectedUser}
                                group={selectedGroup}
                            />
                        </div>
                    ) : (
                        <div className="empty-conversation">
                            Select a conversation to start
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function CoachHome() {
    return (
        <CoachAuthWrapper>
            {(coachData) => <CoachDashboard coachData={coachData} />}
        </CoachAuthWrapper>
    );
}
