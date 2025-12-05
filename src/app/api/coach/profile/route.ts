import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Fetch coach profile by ID
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Coach ID is required" },
                { status: 400 }
            );
        }

        const coach = await prisma.coach.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                name: true,
                title: true,
                specialty: true,
                bio: true,
                imageUrl: true,
                tags: true,
            },
        });

        if (!coach) {
            // Return default profile structure if coach not found
            return NextResponse.json({
                id: parseInt(id),
                name: "",
                title: "",
                specialty: "",
                bio: "",
                imageUrl: "",
                tags: [],
            });
        }

        return NextResponse.json({
            id: coach.id,
            name: coach.name,
            title: coach.title,
            specialty: coach.specialty,
            bio: coach.bio || "",
            imageUrl: coach.imageUrl || "",
            tags: coach.tags || [],
        });
    } catch (error) {
        console.error("Error fetching coach profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

// PUT: Update coach profile
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, title, specialty, bio, imageUrl, tags } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Coach ID is required" },
                { status: 400 }
            );
        }

        // Check if coach exists
        const existingCoach = await prisma.coach.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingCoach) {
            return NextResponse.json(
                { error: "Coach not found" },
                { status: 404 }
            );
        }

        // Update coach profile
        const updatedCoach = await prisma.coach.update({
            where: { id: parseInt(id) },
            data: {
                name: name || existingCoach.name,
                title: title || existingCoach.title,
                specialty: specialty || existingCoach.specialty,
                bio: bio !== undefined ? bio : existingCoach.bio,
                imageUrl: imageUrl !== undefined ? imageUrl : existingCoach.imageUrl,
                tags: tags !== undefined ? tags : existingCoach.tags,
            },
            select: {
                id: true,
                name: true,
                title: true,
                specialty: true,
                bio: true,
                imageUrl: true,
                tags: true,
            },
        });

        return NextResponse.json({
            id: updatedCoach.id,
            name: updatedCoach.name,
            title: updatedCoach.title,
            specialty: updatedCoach.specialty,
            bio: updatedCoach.bio || "",
            imageUrl: updatedCoach.imageUrl || "",
            tags: updatedCoach.tags || [],
        });
    } catch (error) {
        console.error("Error updating coach profile:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}

