"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import styles from "./LoginButton.module.css";

interface LoginButtonProps {
    onClick?: () => void;
}

export default function LoginButton({ onClick }: LoginButtonProps) {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (session) {
        return (
            <div className={styles.userInfo}>
                <span className={styles.phoneNumber}>
                    {session.user.countryCode} {session.user.phone}
                </span>
                <button
                    onClick={() => signOut()}
                    className={styles.logoutButton}
                >
                    Logout
                </button>
            </div>
        );
    }

    return (
        <button onClick={onClick} className={styles.loginButton}>
            Login
        </button>
    );
}









