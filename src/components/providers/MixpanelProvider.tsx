"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
    initClientMixpanel,
    trackClientEvent,
} from "@/services/mixpanel-client";
import { MIXPANEL_EVENTS } from "@/config/mixpanel";

interface MixpanelProviderProps {
    children: React.ReactNode;
}

export default function MixpanelProvider({ children }: MixpanelProviderProps) {
    const pathname = usePathname();
    const isInitialized = useRef(false);
    const scrollDepthTracked = useRef<Set<number>>(new Set());
    const pageStartTime = useRef<number>(Date.now());

    // Initialize Mixpanel on mount
    useEffect(() => {
        const init = async () => {
            if (!isInitialized.current) {
                await initClientMixpanel();
                isInitialized.current = true;
            }
        };
        init();
    }, []);

    // Track page views on route change
    useEffect(() => {
        if (isInitialized.current) {
            // Reset scroll depth tracking for new page
            scrollDepthTracked.current.clear();
            pageStartTime.current = Date.now();

            // Track page view
            trackClientEvent(MIXPANEL_EVENTS.PAGE_VIEW, {
                page_path: pathname,
            });
        }
    }, [pathname]);

    // Track scroll depth
    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;
            const scrollPercentage = Math.round(
                ((scrollTop + windowHeight) / documentHeight) * 100
            );

            // Track at 25%, 50%, 75%, 100%
            const milestones = [25, 50, 75, 100];
            milestones.forEach((milestone) => {
                if (
                    scrollPercentage >= milestone &&
                    !scrollDepthTracked.current.has(milestone)
                ) {
                    scrollDepthTracked.current.add(milestone);
                    trackClientEvent(MIXPANEL_EVENTS.SCROLL_DEPTH, {
                        depth_percentage: milestone as 25 | 50 | 75 | 100,
                        page_path: pathname,
                    });
                }
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [pathname]);

    // Track time on page when leaving
    useEffect(() => {
        const handleBeforeUnload = () => {
            const timeOnPage = Math.round(
                (Date.now() - pageStartTime.current) / 1000
            );
            trackClientEvent(MIXPANEL_EVENTS.TIME_ON_PAGE, {
                time_seconds: timeOnPage,
                page_path: pathname,
            });
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [pathname]);

    return <>{children}</>;
}
