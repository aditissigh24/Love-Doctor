import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Handle Coach
        if (session.user.role === "coach") {
            const coachId = parseInt(session.user.id);
            if (isNaN(coachId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid coach ID" },
                    { status: 400 }
                );
            }

            const coach = await prisma.coach.findUnique({
                where: { id: coachId },
            });

            if (!coach) {
                return NextResponse.json(
                    { success: false, message: "Coach not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                user: {
                    id: coach.id.toString(),
                    phone: coach.phone,
                    email: coach.email,
                    name: coach.name,
                    role: "coach",
                    likemindsUuid: coach.likemindsUuid,
                    // Add other coach fields if needed
                },
            });
        }

        // Handle User (Existing Logic)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                phone: true,
                email: true,
                name: true,
                ageRange: true,
                gender: true,
                currentSituation: true,
                situations: true,
                likeMindsUserId: true,
                likeMindsMemberId: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Map enum gender back to form value
        const genderMap: Record<string, string> = {
            MALE: "male",
            FEMALE: "female",
            NON_BINARY: "non-binary",
            PREFER_NOT_SAY: "prefer-not-to-say",
        };

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                phone: user.phone,
                email: user.email,
                name: user.name,
                ageRange: user.ageRange,
                gender: user.gender ? genderMap[user.gender] : null,
                currentSituation: user.currentSituation,
                situations: user.situations,
                likeMindsUserId: user.likeMindsUserId,
                likeMindsMemberId: user.likeMindsMemberId,
                role: "user",
            },
        });
    } catch (error) {
        console.error("Error fetching user info:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
