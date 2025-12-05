"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useCometChat } from "@/providers/CometChatProvider";
import LeadCaptureModal from "@/components/chat/LeadCaptureModal";
import styles from "./page.module.css";

// Dynamic import to prevent SSR issues with CometChat SDK
const CometChatWidget = dynamic<{
    conversationWith: string;
}>(() => import("./CometChatWidget"), { ssr: false });

interface UserData {
    name: string;
    currentSituation: string;
}

export default function ChatPageContent() {
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const {
        loginUser,
        currentUser,
        loading: cometChatLoading,
    } = useCometChat();

    // Get params from URL
    const coachUid = searchParams.get("coachUid") || "";
    const coachId = parseInt(searchParams.get("coachId") || "0");
    const coachName = searchParams.get("coachName") || "";

    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Fetch user data from database
    useEffect(() => {
        if (status === "loading") return;

        if (!session?.user?.id) {
            setIsLoading(false);
            return;
        }

        fetch("/api/auth/user-info")
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.user) {
                    setUserData({
                        name: data.user.name || "",
                        currentSituation: data.user.currentSituation || "",
                    });
                }

                // ALWAYS show modal on page load
                console.log("Setting showModal to TRUE");
                setShowModal(true);
            })
            .catch((err: Error) => {
                console.error("Error fetching user info:", err);
                // Show modal on error too
                setShowModal(true);
            })
            .finally(() => setIsLoading(false));
    }, [session?.user?.id, status]);

    // Login user to CometChat when userData is available
    useEffect(() => {
        if (
            userData?.name &&
            session?.user?.id &&
            !currentUser &&
            !cometChatLoading
        ) {
            const userUniqueId = session.user.id || session.user.email || "";
            if (userUniqueId) {
                console.log("Logging user into CometChat...");
                loginUser(userUniqueId, userData.name)
                    .then(() =>
                        console.log("User logged into CometChat successfully")
                    )
                    .catch((err: Error) =>
                        console.error("Failed to login to CometChat:", err)
                    );
            }
        } else {
            console.log("Skipping CometChat login because:");
            if (!userData?.name) console.log("- No userData.name");
            if (!session?.user?.id) console.log("- No session.user.id");
            if (currentUser)
                console.log(
                    "- currentUser already exists:",
                    currentUser.getName()
                );
            if (cometChatLoading) console.log("- CometChat is loading");
        }
    }, [userData, session?.user?.id, currentUser, cometChatLoading, loginUser]);

    const handleModalClose = () => {
        console.log("=== MODAL CLOSE CALLED ===");
        setShowModal(false);
        // Refresh user data after form submission
        if (session?.user?.id) {
            fetch("/api/auth/user-info")
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.user) {
                        setUserData({
                            name: data.user.name || "",
                            currentSituation: data.user.currentSituation || "",
                        });
                    }
                });
        }
    };

    if (status === "loading" || isLoading) {
        console.log("Showing loading screen");
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    if (!coachUid) {
        console.log("No coachUid, showing error");
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h1>Invalid Chat Link</h1>
                    <p>The coach could not be found.</p>
                    <p className={styles.errorNote}>
                        Please start a chat from the coach selection page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Always show modal on page load */}
            <LeadCaptureModal
                isOpen={showModal}
                onClose={handleModalClose}
                coachId={coachId}
                coachName={coachName}
            />

            <div className={styles.chatWrapper}>
                {currentUser ? (
                    <div className={styles.likemindsChat}>
                        <CometChatWidget conversationWith={coachUid} />
                    </div>
                ) : (
                    <div className={styles.loading}>Connecting to chat...</div>
                )}
            </div>
        </div>
    );
}
