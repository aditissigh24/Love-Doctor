// OTPless Backend Service
// Handles server-side OTP verification

import { OTPLESS_CONFIG } from "@/config/otpless";

export interface OTPlessVerifyResponse {
    success: boolean;
    user?: {
        mobile?: string;
        country_code?: string;
        name?: string;
        email?: string;
        otplessUserId?: string;
    };
    message?: string;
}

/**
 * Verify OTP token with OTPless backend
 * Reference: https://otpless.com/docs/api-reference/backend-api/verify-token
 *
 * @param token - The token received from OTPless widget after successful OTP verification
 * @returns Promise with verification response including user data
 */
export async function verifyOTPlessToken(
    token: string
): Promise<OTPlessVerifyResponse> {
    try {
        console.log("token received", token);
        console.log("clientId", OTPLESS_CONFIG.clientId);
        console.log("clientSecret", OTPLESS_CONFIG.clientSecret);
        const response = await fetch(
            "https://user-auth.otpless.app/auth/v1/validate/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    clientId: OTPLESS_CONFIG.clientId,
                    clientSecret: OTPLESS_CONFIG.clientSecret,
                },
                body: JSON.stringify({ token: token }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("OTPless verification failed:", errorData);
            throw new Error(
                `OTPless verification failed: ${response.statusText}`
            );
        }

        const data = await response.json();
        console.log("response", data);

        // Handle different response structures from OTPless
        if (data.status !== "SUCCESS") {
            return {
                success: false,
                message: data.message || "Verification failed",
            };
        }

        // Extract identity data from the identities array
        const primaryIdentity = data.identities?.[0];
        if (!primaryIdentity) {
            return {
                success: false,
                message: "No identity found in response",
            };
        }

        // Support both phone and email
        const isPhone = primaryIdentity.identityType === "MOBILE";
        const isEmail = primaryIdentity.identityType === "EMAIL";

        return {
            success: true,
            user: {
                // For phone: extract mobile number
                mobile: isPhone ? primaryIdentity.identityValue : undefined,
                country_code: isPhone
                    ? primaryIdentity.countryCode || "+91"
                    : undefined,

                // For email: use email
                email: isEmail ? primaryIdentity.identityValue : undefined,
                name: primaryIdentity.name,

                // Add OTPless userId for unique identification
                otplessUserId: data.userId,
            },
        };
    } catch (error) {
        console.error("Error in verifyOTPlessToken:", error);
        throw error;
    }
}
