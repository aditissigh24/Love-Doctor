"use client";

import { Suspense } from "react";
import ChatPageContent from "./ChatPageContent";
import styles from "./page.module.css";

// Loading fallback for Suspense
function ChatLoading() {
    return (
        <div className={styles.container}>
            <div className={styles.loading}>Loading...</div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<ChatLoading />}>
            <ChatPageContent />
        </Suspense>
    );
}
