"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export interface VerifiedUserData {
    phone?: string;
    email?: string;
    countryCode?: string;
    name?: string;
}

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerified: (userData: VerifiedUserData) => void;
}

// Extend Window interface to include otpless
declare global {
    interface Window {
        otpless?: (otplessUser: any) => void;
    }
}

const loadOTPlessSdk = async () => {
    if (typeof window === "undefined") return;

    await new Promise<void>((resolve, reject) => {
        const existingScript = document.getElementById(
            "otpless-sdk"
        ) as HTMLScriptElement | null;

        const resolveWhenReady = () => {
            if ((window as any).OTPlessSignin) {
                resolve();
                return true;
            }
            return false;
        };

        if (resolveWhenReady()) return;

        if (existingScript) {
            existingScript.addEventListener(
                "load",
                () => {
                    if (!resolveWhenReady()) {
                        resolve();
                    }
                },
                { once: true }
            );
            existingScript.addEventListener(
                "error",
                () => reject(new Error("Failed to load OTPless SDK")),
                { once: true }
            );
            return;
        }

        const appId = process.env.NEXT_PUBLIC_OTPLESS_APP_ID;
        if (!appId) {
            reject(new Error("OTPless App ID missing"));
            return;
        }

        const script = document.createElement("script");
        script.src = "https://otpless.com/v4/auth.js";
        script.id = "otpless-sdk";
        script.type = "text/javascript";
        script.setAttribute("data-appid", appId);

        script.onload = () => {
            if (!resolveWhenReady()) {
                resolve();
            }
        };

        script.onerror = () => reject(new Error("Failed to load OTPless SDK"));

        document.head.appendChild(script);
    });
};

export default function AuthModal({
    isOpen,
    onClose,
    onVerified,
}: AuthModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleOTPlessCallback = async (otplessUser: any) => {
            console.log("OTPless callback received:", otplessUser);

            try {
                const token = otplessUser.token;

                if (!token) {
                    toast.error("Invalid OTP response. Please try again.");
                    return;
                }

                // Verify token with OTPless backend
                const response = await fetch("/api/auth/verify-token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                console.log("=== VERIFY-TOKEN RESPONSE ===");
                console.log("Success:", data.success);
                console.log("User data:", data.user);

                if (data.success && data.user) {
                    // Pass verified user data to parent via callback
                    onVerified({
                        phone: data.user.phone,
                        email: data.user.email,
                        countryCode: data.user.countryCode,
                        name: data.user.name,
                    });
                    onClose();
                } else {
                    toast.error(data.message || "OTP verification failed");
                }
            } catch (error) {
                console.error("OTPless verification error:", error);
                toast.error("Something went wrong. Please try again.");
            }
        };

        let isMounted = true;

        const initialize = async () => {
            if (typeof window === "undefined") return;

            try {
                await loadOTPlessSdk();
                if (!isMounted) return;

                window.otpless = handleOTPlessCallback;

                const OTPlessSignin = (window as any).OTPlessSignin;

                if (OTPlessSignin) {
                    OTPlessSignin.init({
                        appId: process.env.NEXT_PUBLIC_OTPLESS_APP_ID,
                        channel: "PHONE",
                        countryCode: "+91",
                    });
                } else {
                    console.error("OTPlessSignin not found on window");
                }
            } catch (error) {
                console.error("Failed to load OTPless SDK:", error);
                toast.error("Unable to load login widget. Please try again.");
            }
        };

        initialize();

        // Cleanup function
        return () => {
            if (typeof window !== "undefined") {
                window.otpless = undefined;
            }
            isMounted = false;
        };
    }, [isOpen, onClose, onVerified]);

    if (!isOpen) {
        return null;
    }

    return <div id="otpless-login-page"></div>;
}
