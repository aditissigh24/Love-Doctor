import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "phone-otp",
            name: "Phone OTP",
            credentials: {
                phone: { label: "Phone", type: "text" },
                email: { label: "Email", type: "text" },
                countryCode: { label: "Country Code", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.phone && !credentials?.email) {
                    return null;
                }
                console.log("=== AUTHORIZE CALLED ===");
                console.log("Credentials:", {
                    phone: credentials.phone,
                    email: credentials.email,
                });

                try {
                    // 1. Check if Coach
                    const coach = await prisma.coach.findFirst({
                        where: {
                            OR: [
                                credentials.phone
                                    ? { phone: credentials.phone }
                                    : {},
                                credentials.email
                                    ? { email: credentials.email }
                                    : {},
                            ].filter(
                                (condition) => Object.keys(condition).length > 0
                            ),
                        },
                    });
                    console.log(
                        "Coach search result:",
                        coach ? `FOUND: ${coach.email}` : "NOT FOUND"
                    );
                    if (coach) {
                        await prisma.coach.update({
                            where: { id: coach.id },
                            data: { lastLoginAt: new Date() },
                        });
                        return {
                            id: coach.id.toString(),
                            phone: coach.phone,
                            email: coach.email,
                            name: coach.name,
                            countryCode: coach.countryCode,
                            role: "coach",
                            likemindsUuid: coach.likemindsUuid,
                            likeMindsMemberId:
                                coach.likemindsMemberId ?? undefined,
                        };
                    }

                    // 2. Check User
                    const user = await prisma.user.findFirst({
                        where: {
                            OR: [
                                credentials.phone
                                    ? { phone: credentials.phone }
                                    : {},
                                credentials.email
                                    ? { email: credentials.email }
                                    : {},
                            ].filter(
                                (condition) => Object.keys(condition).length > 0
                            ),
                        },
                    });

                    if (user) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { lastLoginAt: new Date() },
                        });

                        return {
                            id: user.id,
                            phone: user.phone,
                            email: user.email,
                            name: user.name,
                            countryCode: user.countryCode,
                            role: "user",
                            likemindsUuid: user.likeMindsUserId ?? undefined,
                            likeMindsMemberId:
                                user.likeMindsMemberId ?? undefined,
                        };
                    }

                    // 3. Create new User (Default for unknown numbers)
                    const newUser = await prisma.user.create({
                        data: {
                            phone: credentials.phone || null,
                            email: credentials.email || null,
                            countryCode: credentials.countryCode || "+91",
                            lastLoginAt: new Date(),
                        },
                    });

                    return {
                        id: newUser.id,
                        phone: newUser.phone,
                        email: newUser.email,
                        name: newUser.name,
                        countryCode: newUser.countryCode,
                        role: "user",
                        likemindsUuid: undefined, // Will be set later
                        likeMindsMemberId: undefined,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.phone = user.phone;
                token.email = user.email;
                token.name = user.name;
                token.countryCode = user.countryCode;
                token.role = user.role;
                token.likemindsUuid = user.likemindsUuid;
                token.likeMindsMemberId = user.likeMindsMemberId;
            }

            // Refresh likemindsUuid if not in token (logic differs for User vs Coach)
            if (token.id && !token.likemindsUuid) {
                try {
                    if (token.role === "coach") {
                        const dbCoach = await prisma.coach.findUnique({
                            where: { id: parseInt(token.id as string) },
                            select: {
                                likemindsUuid: true,
                                likemindsMemberId: true,
                            },
                        });
                        if (dbCoach?.likemindsUuid) {
                            token.likemindsUuid = dbCoach.likemindsUuid;
                        }
                        if (dbCoach?.likemindsMemberId) {
                            token.likeMindsMemberId = dbCoach.likemindsMemberId;
                        }
                    } else {
                        // Default to user check
                        const dbUser = await prisma.user.findUnique({
                            where: { id: token.id as string },
                            select: {
                                likeMindsUserId: true,
                                likeMindsMemberId: true,
                            },
                        });
                        if (dbUser?.likeMindsUserId) {
                            token.likemindsUuid = dbUser.likeMindsUserId;
                        }
                        if (dbUser?.likeMindsMemberId) {
                            token.likeMindsMemberId = dbUser.likeMindsMemberId;
                        }
                    }
                } catch (error) {
                    console.error("Error fetching LikeMinds data:", error);
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.phone = token.phone as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.countryCode = token.countryCode as string;
                session.user.role = token.role;
                session.user.likemindsUuid = token.likemindsUuid;
                session.user.likeMindsMemberId = token.likeMindsMemberId;
            }
            return session;
        },
    },
    pages: {
        signIn: "/",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
