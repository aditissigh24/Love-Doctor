import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This endpoint creates or fetches a User account
// Called after OTPless token verification with verified phone/email
export async function POST(req: NextRequest) {
    try {
        const { phone, email, countryCode, name } = await req.json();

        if (!phone && !email) {
            return NextResponse.json(
                { success: false, message: "Phone or email is required" },
                { status: 400 }
            );
        }

        console.log("--- USER AUTH ---");
        console.log("Creating/finding user for:", phone || email);

        // Find existing user
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    phone ? { phone: phone } : {},
                    email ? { email: email } : {},
                ].filter((condition) => Object.keys(condition).length > 0),
            },
        });

        if (user) {
            // Update last login
            console.log("Existing user found:", user.id);
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    lastLoginAt: new Date(),
                    name: name || user.name,
                    email: email || user.email,
                    phone: phone || user.phone,
                    countryCode: countryCode || user.countryCode,
                },
            });
        } else {
            // Create new user
            console.log("Creating new user for:", phone || email);
            user = await prisma.user.create({
                data: {
                    phone: phone || null,
                    email: email || null,
                    name: name || null,
                    countryCode: countryCode || "+91",
                    lastLoginAt: new Date(),
                },
            });
            console.log("New user created:", user.id);
        }

        return NextResponse.json({
            success: true,
            message: "User authenticated",
            user: {
                id: user.id,
                phone: user.phone,
                email: user.email,
                name: user.name,
                countryCode: user.countryCode,
                role: "user",
            },
        });
    } catch (error) {
        console.error("Error in user-auth:", error);
        return NextResponse.json(
            { success: false, message: "Failed to authenticate user" },
            { status: 500 }
        );
    }
}


