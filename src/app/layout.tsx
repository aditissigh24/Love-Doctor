import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import MixpanelProvider from "@/components/providers/MixpanelProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import { CometChatProvider } from "@/providers/CometChatProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

const dmSans = DM_Sans({
    variable: "--font-dm-sans",
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Love Doctor - Navigate Your Love Life with Clarity",
    description:
        "Stop overthinking your love life. Get clarity from relationship experts who understand emotions, psychology, and polarity. 100% private. No judgements. Just clarity.",
    keywords:
        "relationship advice, love coach, relationship counseling, dating advice, emotional support, heartbreak help, situationship advice",
    openGraph: {
        title: "Love Doctor - Navigate Your Love Life with Clarity",
        description:
            "A safe, private space to decode what's going on in your love life with expert relationship coaches.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <script src="https://t.contentsquare.net/uxa/365a0d659a61b.js"></script>
            </head>
            <body className={`${inter.variable} ${dmSans.variable}`}>
                <Toaster position="top-center" />
                <AuthProvider>
                    <CometChatProvider>
                        <MixpanelProvider>{children}</MixpanelProvider>
                    </CometChatProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
