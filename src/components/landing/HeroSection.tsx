"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./styles/HeroSection.module.css";
import { trackClientEvent } from "@/services/mixpanel-client";
import { MIXPANEL_EVENTS } from "@/config/mixpanel";
import AuthModal, { VerifiedUserData } from "@/components/auth/AuthModal";
import toast from "react-hot-toast";

export default function HeroSection() {
    const { data: session } = useSession();
    const router = useRouter();
    const [authModalOpen, setAuthModalOpen] = useState(false);

    const handleCTAClick = (
        ctaText: string,
        ctaType: "primary" | "secondary"
    ) => {
        trackClientEvent(MIXPANEL_EVENTS.CTA_CLICK, {
            cta_text: ctaText,
            cta_location: "hero_section",
            cta_type: ctaType,
        });

        // Check if user is authenticated
        if (!session) {
            setAuthModalOpen(true);
            return;
        }

        // Already authenticated - scroll to lead capture form
        const leadCaptureSection = document.querySelector(
            '[class*="leadCapture"]'
        );
        if (leadCaptureSection) {
            leadCaptureSection.scrollIntoView({ behavior: "smooth" });
        }
    };

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

                    // Scroll to lead capture after auth
                    setTimeout(() => {
                        const leadCaptureSection = document.querySelector(
                            '[class*="leadCapture"]'
                        );
                        if (leadCaptureSection) {
                            leadCaptureSection.scrollIntoView({ behavior: "smooth" });
                        }
                    }, 500);
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
        <section className={styles.hero}>
            <div className={styles.heroContent}>
                <div className={styles.neonRing}></div>

                <p className={styles.badge}>
                    40,000+ people found clarity (90%)
                </p>

                <h1 className={styles.headline}>
                    Stop overthinking
                    <br />
                    <span className={styles.gradientText}>your love life</span>
                </h1>

                <p className={styles.subheadline}>
                    Mixed signals? Ghosting? Situationship?
                </p>

                <p className={styles.description}>
                    Yeh sab decode karna part-time job nahi hai. Talk to someone
                    who actually understands emotions, psychology, intention and
                    polarity — without judgments.
                </p>

                <div className={styles.ctaButtons}>
                    <button
                        className={styles.primaryCta}
                        onClick={() =>
                            handleCTAClick("Talk to a Coach", "primary")
                        }
                    >
                        Talk to a Coach
                    </button>
                    <button
                        className={styles.secondaryCta}
                        onClick={() =>
                            handleCTAClick(
                                "Get My Situation Decoded",
                                "secondary"
                            )
                        }
                    >
                        Get My Situation Decoded
                    </button>
                </div>

                <div className={styles.microCopy}>
                    <span className={styles.microBadge}>🔒 100% Private</span>
                    <span className={styles.microBadge}>⚡ No Judgement</span>
                    <span className={styles.microBadge}>💜 Just Clarity</span>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onVerified={handleVerified}
            />
        </section>
    );
}
