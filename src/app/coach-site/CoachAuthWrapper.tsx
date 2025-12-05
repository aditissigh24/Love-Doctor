"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthModal, { VerifiedUserData } from "@/components/auth/AuthModal";
import "./CoachAuthWrapper.css";

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

interface CoachAuthWrapperProps {
    children: (coachData: CoachData) => React.ReactNode;
}

export function CoachAuthWrapper({ children }: CoachAuthWrapperProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [coachData, setCoachData] = useState<CoachData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(false);

    // Handle authentication status
    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            setShowLogin(true);
            setIsLoading(false);
            return;
        }

        // User is authenticated - check if they're a coach
        if (session?.user?.role === "coach") {
            fetchCoachData();
        } else {
            // Not a coach - show error
            toast.error("Access denied. This area is for coaches only.");
            setIsLoading(false);
        }
    }, [status, session]);

    // Handle verified user data from AuthModal
    const handleVerified = async (userData: VerifiedUserData) => {
        setIsLoading(true);

        try {
            // Call coach auth endpoint to create/fetch coach account
            const response = await fetch("/api/coach/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            console.log("Coach auth response:", data);

            if (data.success && data.user) {
                // Sign in with NextAuth
                const signInResult = await signIn("phone-otp", {
                    phone: data.user.phone || "",
                    email: data.user.email || "",
                    countryCode: data.user.countryCode,
                    redirect: false,
                });

                if (signInResult?.ok) {
                    toast.success("Welcome, Coach!");
                    setShowLogin(false);
                    router.refresh();
                } else {
                    toast.error("Login failed. Please try again.");
                    setIsLoading(false);
                }
            } else {
                toast.error(data.message || "Authentication failed");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Coach authentication error:", error);
            toast.error("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    const fetchCoachData = async () => {
        try {
            const response = await fetch(
                `/api/coach/profile?id=${session?.user?.id}`
            );
            if (response.ok) {
                const data = await response.json();
                setCoachData({
                    id: parseInt(session?.user?.id || "0"),
                    name: data.name || session?.user?.name || "",
                    title: data.title || "",
                    specialty: data.specialty || "",
                    bio: data.bio || "",
                    imageUrl: data.imageUrl || "",
                    tags: data.tags || [],
                    uid: data.likemindsUuid || `coach-${session?.user?.id}`,
                });
            } else {
                // Use session data as fallback
                setCoachData({
                    id: parseInt(session?.user?.id || "0"),
                    name: session?.user?.name || "Coach",
                    title: "",
                    specialty: "",
                    bio: "",
                    imageUrl: "",
                    tags: [],
                    uid: `coach-${session?.user?.id}`,
                });
            }
        } catch (error) {
            console.error("Error fetching coach data:", error);
            // Use session data as fallback
            setCoachData({
                id: parseInt(session?.user?.id || "0"),
                name: session?.user?.name || "Coach",
                title: "",
                specialty: "",
                bio: "",
                imageUrl: "",
                tags: [],
                uid: `coach-${session?.user?.id}`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (isLoading || status === "loading") {
        return (
            <div className="coach-auth-loading">
                <div className="loading-spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    // Show login screen
    if (showLogin) {
        return (
            <div className="coach-login-screen">
                <div className="coach-login-container">
                    <div className="coach-login-header">
                        <div className="coach-login-logo">
                            <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="url(#logo-gradient)"
                                strokeWidth="1.5"
                            >
                                <defs>
                                    <linearGradient
                                        id="logo-gradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="100%"
                                    >
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop
                                            offset="100%"
                                            stopColor="#ec4899"
                                        />
                                    </linearGradient>
                                </defs>
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </div>
                        <h1>Love Doctor</h1>
                        <p className="coach-login-subtitle">Coach Portal</p>
                    </div>

                    <div className="coach-login-description">
                        <p>
                            Sign in with your phone number to access the coach
                            dashboard.
                        </p>
                    </div>

                    <div className="coach-login-widget">
                        {/* AuthModal handles OTPless + token verification */}
                        <AuthModal
                            isOpen={true}
                            onClose={() => {}}
                            onVerified={handleVerified}
                        />
                    </div>

                    <div className="coach-login-footer">
                        <p>
                            New coaches are automatically registered on first
                            login.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Not a coach
    if (!coachData) {
        return (
            <div className="coach-auth-error">
                <h2>Access Denied</h2>
                <p>This area is restricted to coaches only.</p>
            </div>
        );
    }

    // Render children with coach data
    return <>{children(coachData)}</>;
}
