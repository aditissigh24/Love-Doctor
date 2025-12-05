import "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        phone?: string | null;
        email?: string | null;
        name?: string | null;
        countryCode: string;
        role: "user" | "coach";
        // Unified LikeMinds fields
        likemindsUuid?: string;
        likeMindsMemberId?: number;
    }

    interface Session {
        user: {
            id: string;
            phone?: string | null;
            email?: string | null;
            name?: string | null;
            countryCode: string;
            role: "user" | "coach";
            likemindsUuid?: string;
            likeMindsMemberId?: number;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        phone?: string | null;
        email?: string | null;
        name?: string | null;
        countryCode: string;
        role: "user" | "coach";
        likemindsUuid?: string;
        likeMindsMemberId?: number;
    }
}
