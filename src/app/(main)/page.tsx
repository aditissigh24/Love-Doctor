import HeroSection from "@/components/landing/HeroSection";
import EmotionalHooks from "@/components/landing/EmotionalHooks";
import CoachCards from "@/components/landing/CoachCards";
import SocialProof from "@/components/landing/SocialProof";
import LeadCapture from "@/components/landing/LeadCapture";
import WhatsAppFooter from "@/components/landing/WhatsAppFooter";
import styles from "./page.module.css";

export default function Home() {
    return (
        <div className={styles.page}>
            <HeroSection />
            <EmotionalHooks />
            <CoachCards />
            <SocialProof />
            <LeadCapture />
            <WhatsAppFooter />
        </div>
    );
}
