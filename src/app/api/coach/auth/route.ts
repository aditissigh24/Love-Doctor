import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This endpoint creates or fetches a Coach account
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

        console.log("--- COACH AUTH ---");
        console.log("Creating/finding coach for:", phone || email);

        // Find existing coach
        let coach = await prisma.coach.findFirst({
            where: {
                OR: [
                    phone ? { phone: phone } : {},
                    email ? { email: email } : {},
                ].filter((condition) => Object.keys(condition).length > 0),
            },
        });

        if (coach) {
            // Update last login
            console.log("Existing coach found:", coach.id);
            await prisma.coach.update({
                where: { id: coach.id },
                data: { lastLoginAt: new Date() },
            });
        } else {
            // Create new coach with default values
            console.log("Creating new coach for:", phone || email);

            // Generate a unique UID for the coach (used for CometChat)
            const coachUid = `coach-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 8)}`;

            coach = await prisma.coach.create({
                data: {
                    phone: phone || null,
                    email: email || null,
                    name: name || `Coach ${phone?.slice(-4) || "New"}`,
                    title: "Relationship Coach",
                    specialty: "",
                    bio: "",
                    tags: [],
                    countryCode: countryCode || "+91",
                    likemindsUuid: coachUid,
                    isActive: true,
                    lastLoginAt: new Date(),
                },
            });
            console.log("New coach created:", coach.id);
        }

        return NextResponse.json({
            success: true,
            message: coach ? "Coach authenticated" : "Coach account created",
            user: {
                id: coach.id.toString(),
                phone: coach.phone,
                email: coach.email,
                name: coach.name,
                countryCode: coach.countryCode,
                role: "coach",
            },
        });
    } catch (error) {
        console.error("Error in coach-auth:", error);
        return NextResponse.json(
            { success: false, message: "Failed to authenticate coach" },
            { status: 500 }
        );
    }
}
