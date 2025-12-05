import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { situation, name, ageRange, gender, coachId } = body;

        console.log("===== User Information Submitted =====");
        console.log("User ID:", session.user.id);
        console.log("Coach ID:", coachId);
        console.log("Name:", name);
        console.log("Age Range:", ageRange);
        console.log("Gender:", gender);
        console.log("Situation:", situation);
        console.log("Timestamp:", new Date().toISOString());
        console.log("======================================");

        // Get current user to access existing situations
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { situations: true },
        });

        // Map form gender to enum value
        const genderMap: Record<string, string> = {
            male: "MALE",
            female: "FEMALE",
            "non-binary": "NON_BINARY",
            "prefer-not-to-say": "PREFER_NOT_SAY",
        };

        // Update user with form data
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: name || undefined,
                ageRange: ageRange || undefined,
                gender: gender ? (genderMap[gender] as any) : undefined,
                currentSituation: situation || undefined,
                // Add new situation to the array if provided
                situations: situation
                    ? {
                          push: situation,
                      }
                    : undefined,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "User information saved successfully",
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    ageRange: updatedUser.ageRange,
                    gender: updatedUser.gender,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error submitting user info:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to submit user information",
            },
            { status: 500 }
        );
    }
}
