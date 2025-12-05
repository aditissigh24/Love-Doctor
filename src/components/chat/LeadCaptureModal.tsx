"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCometChat } from "@/providers/CometChatProvider";
import { COACH_UID_MAP } from "@/config/cometchat";
import styles from "./LeadCaptureModal.module.css";
import type { UserFormData } from "@/types";

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    coachId?: number;
    coachName?: string;
}

export default function LeadCaptureModal({
    isOpen,
    onClose,
    coachId,
    coachName,
}: LeadCaptureModalProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const { loginUser } = useCometChat();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Omit<UserFormData, "coachId">>({
        situation: "",
        name: "",
        ageRange: "",
        gender: "",
    });

    const [errors, setErrors] = useState<Partial<UserFormData>>({});

    useEffect(() => {
        if (isOpen && session?.user?.id) {
            fetch("/api/auth/user-info")
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.user) {
                        setFormData((prev) => ({
                            ...prev,
                            name: data.user.name || prev.name,
                            ageRange: data.user.ageRange || prev.ageRange,
                            gender: data.user.gender || prev.gender,
                            situation:
                                data.user.currentSituation || prev.situation,
                        }));
                    }
                })
                .catch((err) =>
                    console.error("Error fetching user info:", err)
                );
        }
    }, [isOpen, session?.user?.id]);

    const validateForm = (): boolean => {
        const newErrors: Partial<UserFormData> = {};

        if (!formData.situation.trim()) {
            newErrors.situation = "Please describe your situation";
        }
        if (!formData.name.trim()) {
            newErrors.name = "Please enter your name";
        }
        if (!formData.ageRange) {
            newErrors.ageRange = "Please select your age range";
        }
        if (!formData.gender) {
            newErrors.gender = "Please select your gender";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!coachId) {
            console.error("No coach selected");
            return;
        }

        setIsLoading(true);

        try {
            // Submit user info to database
            const infoResponse = await fetch("/api/chat/submit-user-info", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    ...formData,
                    coachId,
                }),
            });

            const infoData = await infoResponse.json();

            if (!infoData.success) {
                console.error("Failed to submit user info:", infoData.message);
                alert("Something went wrong. Please try again.");
                setIsLoading(false);
                return;
            }

            // Get user unique ID from session
            const userUniqueId =
                session?.user?.id || session?.user?.email || "";
            if (!userUniqueId) {
                alert(
                    "Unable to get user information. Please try logging in again."
                );
                setIsLoading(false);
                return;
            }

            // Step 1: Login user to CometChat
            console.log("Logging in user to CometChat...");
            await loginUser(userUniqueId, formData.name);
            console.log("User logged in successfully");

            // Get coach info from config
            const coachConfig = COACH_UID_MAP[coachId];
            if (!coachConfig) {
                console.error("Invalid coach ID");
                alert("Invalid coach selection. Please try again.");
                setIsLoading(false);
                return;
            }

            // Step 2: Send initial message with form data
            try {
                const { CometChat } = await import(
                    "@cometchat/chat-sdk-javascript"
                );

                const messageText = `Hi! I'm ${formData.name}

Age Range: ${formData.ageRange}
Gender: ${formData.gender}

My situation: ${formData.situation}`;

                const textMessage = new CometChat.TextMessage(
                    coachConfig.uid,
                    messageText,
                    CometChat.RECEIVER_TYPE.USER
                );

                await CometChat.sendMessage(textMessage);
                console.log("Initial message sent successfully");
            } catch (error) {
                console.error("Error sending initial message:", error);
                // Continue anyway - user can still chat
            }

            // Track with Mixpanel
            if (typeof window !== "undefined" && (window as any).mixpanel) {
                (window as any).mixpanel.track("Lead Captured", {
                    coachId,
                    coachName,
                    ageRange: formData.ageRange,
                    gender: formData.gender,
                });
            }

            // Close modal - user stays on chat page
            onClose();
        } catch (error) {
            console.error("Error creating chat:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again.";
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        console.log("LeadCaptureModal: isOpen is false, not rendering");
        return null;
    }

    console.log("=== LeadCaptureModal RENDERING ===");
    console.log("isOpen:", isOpen);
    console.log("coachId:", coachId);
    console.log("coachName:", coachName);

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    ×
                </button>

                <div className={styles.header}>
                    <h2>Chat with {coachName || "Coach"}</h2>
                    <p>Tell us a bit about yourself to get started</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="situation">
                            What's your situation?*
                        </label>
                        <textarea
                            id="situation"
                            value={formData.situation}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    situation: e.target.value,
                                })
                            }
                            placeholder="Describe what you're going through..."
                            rows={4}
                            disabled={isLoading}
                        />
                        {errors.situation && (
                            <span className={styles.error}>
                                {errors.situation}
                            </span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="name">Your Name*</label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            placeholder="Enter your name"
                            disabled={isLoading}
                        />
                        {errors.name && (
                            <span className={styles.error}>{errors.name}</span>
                        )}
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="ageRange">Age Range*</label>
                            <select
                                id="ageRange"
                                value={formData.ageRange}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        ageRange: e.target.value,
                                    })
                                }
                                disabled={isLoading}
                            >
                                <option value="">Select...</option>
                                <option value="18-24">18-24</option>
                                <option value="25-34">25-34</option>
                                <option value="35-44">35-44</option>
                                <option value="45-54">45-54</option>
                                <option value="55+">55+</option>
                            </select>
                            {errors.ageRange && (
                                <span className={styles.error}>
                                    {errors.ageRange}
                                </span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="gender">Gender*</label>
                            <select
                                id="gender"
                                value={formData.gender}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        gender: e.target.value,
                                    })
                                }
                                disabled={isLoading}
                            >
                                <option value="">Select...</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="non-binary">Non-binary</option>
                                <option value="prefer-not-to-say">
                                    Prefer not to say
                                </option>
                            </select>
                            {errors.gender && (
                                <span className={styles.error}>
                                    {errors.gender}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? "Starting Chat..." : "Start Chatting"}
                    </button>
                </form>
            </div>
        </div>
    );
}
