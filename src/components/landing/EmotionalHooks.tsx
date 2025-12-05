"use client";

import styles from "./styles/EmotionalHooks.module.css";
import { trackClientEvent } from "@/services/mixpanel-client";
import { MIXPANEL_EVENTS } from "@/config/mixpanel";

const emotionalHooks = [
    "Why did he pull away suddenly?",
    "Why does she reply late now?",
    "Is this a situationship or relationship?",
    "Will he come back?",
    "Is she losing interest?",
    "Am I being too available?",
    "How do I stop overthinking?",
    "How do I set boundaries without scaring them away?",
];

export default function EmotionalHooks() {
    const handleChipClick = (chipText: string, chipIndex: number) => {
        trackClientEvent(MIXPANEL_EVENTS.EMOTIONAL_CHIP_CLICK, {
            chip_text: chipText,
            chip_index: chipIndex,
        });

        // Scroll to lead capture form
        const leadCaptureSection = document.querySelector(
            '[class*="leadCapture"]'
        );
        if (leadCaptureSection) {
            leadCaptureSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section className={styles.emotionalHooks}>
            <div className={styles.container}>
                <p className={styles.topText}>Got a 10 Questions?</p>

                <h2 className={styles.title}>
                    Sounds{" "}
                    <span className={styles.gradientText}>familiar?</span>
                </h2>

                <div className={styles.hooksGrid}>
                    {emotionalHooks.map((hook, index) => (
                        <div
                            key={index}
                            className={styles.hookPill}
                            onClick={() => handleChipClick(hook, index)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    handleChipClick(hook, index);
                                }
                            }}
                        >
                            {hook}
                        </div>
                    ))}
                </div>

                <p className={styles.subtitle}>
                    You shouldn&apos;t answers. The biggest guess. Get clarity.
                </p>
            </div>
        </section>
    );
}
