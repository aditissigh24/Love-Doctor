import { NextRequest, NextResponse } from "next/server";
import { verifyOTPlessToken } from "@/services/otpless";

// This endpoint ONLY verifies the OTPless token
// It does NOT create any user/coach account
// The parent component decides which auth endpoint to call after verification
export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Token is required" },
                { status: 400 }
            );
        }

        // Verify token with OTPless backend
        const otplessResponse = await verifyOTPlessToken(token);

        if (!otplessResponse.success || !otplessResponse.user) {
            console.error("OTPless verification failed:", otplessResponse.message);
            return NextResponse.json(
                { success: false, message: otplessResponse.message || "Invalid OTP" },
                { status: 401 }
            );
        }

        const { mobile, country_code, email, name } = otplessResponse.user;

        console.log("Token verified successfully for:", mobile || email);

        // Return verified user data - no account creation here
        return NextResponse.json({
            success: true,
            user: {
                phone: mobile,
                email: email,
                countryCode: country_code || "+91",
                name: name,
            },
        });
    } catch (error) {
        console.error("Error verifying token:", error);
        return NextResponse.json(
            { success: false, message: "Failed to verify token" },
            { status: 500 }
        );
    }
}


