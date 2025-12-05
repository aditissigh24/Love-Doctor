import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOTPlessToken } from "@/services/otpless";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token } = body;

        // Validate token
        if (!token) {
            return NextResponse.json(
                { success: false, message: "Token is required" },
                { status: 400 }
            );
        }

        // Verify token with OTPless backend
        const otplessResponse = await verifyOTPlessToken(token);

        if (!otplessResponse.success || !otplessResponse.user) {
            console.error(
                "OTPless verification failed:",
                otplessResponse.message
            );
            return NextResponse.json(
                {
                    success: false,
                    message: otplessResponse.message || "Invalid OTP",
                },
                { status: 401 }
            );
        }

        // Extract phone from OTPless response
        const { mobile, country_code, email, name, otplessUserId } =
            otplessResponse.user;
        console.log("--- USER VERIFY-OTP ---");
        console.log("Searching for user with:", { mobile, email });

        // Find or Create User
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    otplessUserId ? { otplessUserId: otplessUserId } : {},
                    mobile ? { phone: mobile } : {},
                    email ? { email: email } : {},
                ].filter((condition) => Object.keys(condition).length > 0),
            },
        });

        if (user) {
            // Update last login and ensure otplessUserId is set
            console.log("Existing user found:", user.id);
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    lastLoginAt: new Date(),
                    otplessUserId: otplessUserId || user.otplessUserId,
                    name: name || user.name,
                    email: email || user.email,
                    phone: mobile || user.phone,
                    countryCode: country_code || user.countryCode,
                },
            });
        } else {
            // Create new user
            console.log("Creating new user for:", mobile || email);
            user = await prisma.user.create({
                data: {
                    phone: mobile,
                    email: email,
                    name: name,
                    otplessUserId: otplessUserId,
                    countryCode: country_code || "+91",
                    lastLoginAt: new Date(),
                },
            });
            console.log("New user created:", user.id);
        }

        return NextResponse.json(
            {
                success: true,
                message: "OTP verified successfully",
                user: {
                    id: user.id,
                    phone: user.phone,
                    email: user.email,
                    name: user.name,
                    countryCode: user.countryCode,
                    role: "user",
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in verify-otp:", error);
        return NextResponse.json(
            { success: false, message: "Failed to verify OTP" },
            { status: 500 }
        );
    }
}
