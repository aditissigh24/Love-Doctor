// CometChat SDK Configuration
export const COMETCHAT_CONFIG = {
    appId: process.env.NEXT_PUBLIC_COMETCHAT_APP_ID || "",
    region: process.env.NEXT_PUBLIC_COMETCHAT_REGION || "us",
    authKey: process.env.NEXT_PUBLIC_COMETCHAT_AUTH_KEY || "",
};

// Map coach IDs to CometChat UIDs
// These UIDs will be used to identify coaches in CometChat
export const COACH_UID_MAP: Record<number, { name: string; uid: string }> = {
    1: {
        name: "Priya Sharma",
        uid: "coach-priya-sharma",
    },
    2: {
        name: "Arjun Mehta",
        uid: "coach-arjun-mehta",
    },
    3: {
        name: "Shivu Agarwal",
        uid: "coach-shivu-agarwal",
    },
};

