import {
    MixpanelEventName,
    generateSessionId,
    getBaseProperties,
    SuperProperties,
} from "@/config/mixpanel";

// Client-side Mixpanel initialization flag
let isClientInitialized = false;

// Session ID management
let sessionId: string | null = null;

// Lazy loaded mixpanel
let mixpanelBrowser: any = null;

/**
 * Initialize client-side Mixpanel
 * Should be called once on app mount
 */
export async function initClientMixpanel(): Promise<void> {
    if (typeof window === "undefined") return;

    const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

    if (!token) {
        console.warn(
            "Mixpanel token not found. Skipping client-side initialization."
        );
        return;
    }

    if (!isClientInitialized) {
        // Dynamically import mixpanel-browser only on client
        const mixpanelModule = await import("mixpanel-browser");
        mixpanelBrowser = mixpanelModule.default;

        mixpanelBrowser.init(token, {
            debug: process.env.NODE_ENV === "development",
            track_pageview: false, // We'll handle this manually
            persistence: "localStorage",
            api_host: "https://api-eu.mixpanel.com",
        });

        // Set super properties
        const superProps: SuperProperties = {
            environment:
                process.env.NODE_ENV === "production"
                    ? "production"
                    : "development",
            platform: "web",
        };
        mixpanelBrowser.register(superProps);

        // Generate and store session ID
        sessionId = generateSessionId();

        isClientInitialized = true;
        console.log("Client-side Mixpanel initialized");
    }
}

/**
 * Get session ID
 */
export function getSessionId(): string {
    if (!sessionId) {
        sessionId = generateSessionId();
    }
    return sessionId;
}

/**
 * Track event from client-side
 */
export function trackClientEvent(
    eventName: MixpanelEventName,
    properties?: Record<string, any>
): void {
    if (typeof window === "undefined") return;

    if (!isClientInitialized || !mixpanelBrowser) {
        console.warn(
            "Mixpanel not initialized. Call initClientMixpanel() first."
        );
        return;
    }

    const baseProps = getBaseProperties();
    const eventProps = {
        ...baseProps,
        ...properties,
        session_id: getSessionId(),
    };

    mixpanelBrowser.track(eventName, eventProps);

    if (process.env.NODE_ENV === "development") {
        console.log("📊 Mixpanel Event (Client):", eventName, eventProps);
    }
}

/**
 * Set user properties (client-side)
 */
export function setUserProperties(properties: Record<string, any>): void {
    if (typeof window === "undefined") return;

    if (!isClientInitialized || !mixpanelBrowser) {
        console.warn(
            "Mixpanel not initialized. Call initClientMixpanel() first."
        );
        return;
    }

    mixpanelBrowser.people.set(properties);

    if (process.env.NODE_ENV === "development") {
        console.log("👤 Mixpanel User Properties:", properties);
    }
}

/**
 * Identify user (client-side)
 */
export function identifyUser(userId: string): void {
    if (typeof window === "undefined") return;

    if (!isClientInitialized || !mixpanelBrowser) {
        console.warn(
            "Mixpanel not initialized. Call initClientMixpanel() first."
        );
        return;
    }

    mixpanelBrowser.identify(userId);

    if (process.env.NODE_ENV === "development") {
        console.log("🔑 Mixpanel User Identified:", userId);
    }
}

/**
 * Reset Mixpanel (client-side)
 * Useful for logout scenarios
 */
export function resetMixpanel(): void {
    if (typeof window === "undefined") return;

    if (!isClientInitialized || !mixpanelBrowser) return;

    mixpanelBrowser.reset();
    sessionId = null;

    if (process.env.NODE_ENV === "development") {
        console.log("🔄 Mixpanel Reset");
    }
}

/**
 * Get Mixpanel distinct ID (client-side)
 */
export function getDistinctId(): string | undefined {
    if (typeof window === "undefined") return undefined;

    if (!isClientInitialized || !mixpanelBrowser) {
        console.warn(
            "Mixpanel not initialized. Call initClientMixpanel() first."
        );
        return undefined;
    }

    return mixpanelBrowser.get_distinct_id();
}
