"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import LoginButton from "@/components/auth/LoginButton";
import AuthModal, { VerifiedUserData } from "@/components/auth/AuthModal";
import styles from "./Header.module.css";
import toast from "react-hot-toast";

export default function Header() {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Hide header on chat page
    if (pathname === "/chat") {
        return null;
    }

    // Handle verified user data from AuthModal
    const handleVerified = async (userData: VerifiedUserData) => {
        try {
            // Call user auth endpoint to create/fetch user account
            const response = await fetch("/api/auth/user-auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (data.success && data.user) {
                // Sign in with NextAuth
                const signInResult = await signIn("phone-otp", {
                    phone: data.user.phone || "",
                    email: data.user.email || "",
                    countryCode: data.user.countryCode,
                    redirect: false,
                });

                if (signInResult?.ok) {
                    toast.success("Login successful!");
                    setAuthModalOpen(false);
                    router.refresh();
                } else {
                    toast.error("Login failed. Please try again.");
                }
            } else {
                toast.error(data.message || "Authentication failed");
            }
        } catch (error) {
            console.error("User authentication error:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    return (
        <>
            <header className={styles.header}>
                <div className={styles.container}>
                    <LoginButton onClick={() => setAuthModalOpen(true)} />
                </div>
            </header>

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onVerified={handleVerified}
            />
        </>
    );
}
