import mixpanel, { Mixpanel } from "mixpanel";
import { MixpanelEventName } from "@/config/mixpanel";

// Server-side Mixpanel instance
let serverMixpanel: Mixpanel | null = null;

/**
 * Initialize server-side Mixpanel
 * Should be called in API routes or server components
 */
export function initServerMixpanel(): Mixpanel | null {
    const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

    if (!token) {
        console.warn(
            "Mixpanel token not found. Skipping server-side initialization."
        );
        return null;
    }

    if (!serverMixpanel) {
        serverMixpanel = mixpanel.init(token);
        console.log("Server-side Mixpanel initialized");
    }

    return serverMixpanel;
}

/**
 * Track event from server-side
 */
export function trackServerEvent(
    distinctId: string,
    eventName: MixpanelEventName,
    properties?: Record<string, any>
): void {
    const client = initServerMixpanel();

    if (!client) {
        console.warn("Server Mixpanel not available");
        return;
    }

    const eventProps = {
        ...properties,
        timestamp: Date.now(),
    };

    client.track(eventName, {
        distinct_id: distinctId,
        ...eventProps,
    });

    if (process.env.NODE_ENV === "development") {
        console.log("📊 Mixpanel Event (Server):", eventName, eventProps);
    }
}
