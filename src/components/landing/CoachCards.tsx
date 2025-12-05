"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./styles/CoachCards.module.css";
import { trackClientEvent } from "@/services/mixpanel-client";
import { MIXPANEL_EVENTS } from "@/config/mixpanel";
import { COACH_UID_MAP } from "@/config/cometchat";
import AuthModal, { VerifiedUserData } from "@/components/auth/AuthModal";
import toast from "react-hot-toast";

const coaches = [
    {
        id: 1,
        name: "Priya Sharma",
        title: "Relationship coach",
        specialty: "Specialty: Attachment & communication",
        image: "/images/coach-1.svg",
        tags: ["Attachment", "Communication", "Polarity"],
    },
    {
        id: 2,
        name: "Arjun Mehta",
        title: "Dating strategist",
        specialty: "Specialty: Dating & boundaries",
        image: "/images/coach-2.svg",
        tags: ["Modern Dating", "Boundaries", "Self-Worth"],
    },
    {
        id: 3,
        name: "Shivu Agarwal",
        title: "Emotional wellness expert",
        specialty: "Specialty: Emotional intelligence",
        image: "/images/coach-3.svg",
        tags: ["Emotional Intelligence", "Healing", "Growth"],
    },
];

export default function CoachCards() {
    const { data: session } = useSession();
    const router = useRouter();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [selectedCoachForAuth, setSelectedCoachForAuth] = useState<{
        id: number;
        name: string;
    } | null>(null);

    // After auth completes, check if there's a stored coach
    useEffect(() => {
        if (session && selectedCoachForAuth) {
            // Redirect to chat with stored coach
            const coachConfig = COACH_UID_MAP[selectedCoachForAuth.id];
            if (coachConfig) {
                router.push(
                    `/chat?coachUid=${coachConfig.uid}&coachId=${
                        selectedCoachForAuth.id
                    }&coachName=${encodeURIComponent(
                        selectedCoachForAuth.name
                    )}`
                );
            }
            setSelectedCoachForAuth(null);
        }
    }, [session, selectedCoachForAuth, router]);

    const handleCoachCardClick = (
        coachId: number,
        coachName: string,
        coachExpertise: string[]
    ) => {
        trackClientEvent(MIXPANEL_EVENTS.COACH_CARD_CLICK, {
            coach_name: coachName,
            coach_expertise: coachExpertise,
        });

        // Check if user is authenticated
        if (!session) {
            // Store coach selection and open auth modal
            setSelectedCoachForAuth({ id: coachId, name: coachName });
            setAuthModalOpen(true);
            return;
        }

        // Get coach UID from config
        const coachConfig = COACH_UID_MAP[coachId];
        if (!coachConfig) {
            console.error("Invalid coach ID");
            return;
        }

        // Directly redirect to chat page
        router.push(
            `/chat?coachUid=${
                coachConfig.uid
            }&coachId=${coachId}&coachName=${encodeURIComponent(coachName)}`
        );
    };

    const closeAuthModal = () => {
        setAuthModalOpen(false);
        setSelectedCoachForAuth(null);
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

    const handleViewAllClick = () => {
        trackClientEvent(MIXPANEL_EVENTS.VIEW_ALL_COACHES_CLICK, {
            cta_location: "coach_cards_section",
        });

        // Scroll to lead capture form
        const leadCaptureSection = document.querySelector(
            '[class*="leadCapture"]'
        );
        if (leadCaptureSection) {
            leadCaptureSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section className={styles.coachCards}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        Meet Your{" "}
                        <span className={styles.gradientText}>Guides</span>
                    </h2>
                    <p className={styles.description}>
                        Ex-therapists, relationship coaches & emotional experts.
                    </p>
                    <p className={styles.subdescription}>
                        People who actually understand polarity, communication &
                        attachment — not baba-level advice.
                    </p>
                </div>

                <div className={styles.cardsGrid}>
                    {coaches.map((coach) => (
                        <div key={coach.id} className={styles.card}>
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={coach.image}
                                    alt={coach.name}
                                    width={300}
                                    height={400}
                                    className={styles.image}
                                />
                                <div className={styles.imageOverlay}></div>
                            </div>

                            <div className={styles.cardContent}>
                                <h3 className={styles.coachName}>
                                    {coach.name}
                                </h3>
                                <p className={styles.coachTitle}>
                                    {coach.title}
                                </p>
                                <p className={styles.specialty}>
                                    {coach.specialty}
                                </p>

                                <button
                                    className={styles.bookButton}
                                    onClick={() =>
                                        handleCoachCardClick(
                                            coach.id,
                                            coach.name,
                                            coach.tags
                                        )
                                    }
                                >
                                    Chat Now →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.ctaWrapper}>
                    <button
                        className={styles.viewAllCta}
                        onClick={handleViewAllClick}
                    >
                        View All Guides →
                    </button>
                </div>
            </div>

            {/* Auth Modal */}
            {authModalOpen && (
                <div
                    className={styles.authModalBackdrop}
                    onClick={closeAuthModal}
                >
                    <AuthModal
                        isOpen={authModalOpen}
                        onClose={closeAuthModal}
                        onVerified={handleVerified}
                    />
                </div>
            )}
        </section>
    );
}
