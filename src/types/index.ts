// Type definitions for Love Doctor landing page

export interface Coach {
    id: number;
    name: string;
    title: string;
    description: string;
    image: string;
    expertise: string[];
}

export interface EmotionalHook {
    id: number;
    text: string;
}

export interface SocialProofItem {
    id: number;
    text: string;
    city: string;
}

export interface LeadFormData {
    situation: string;
    name: string;
    ageRange: string;
    gender: string;
}

export interface DailyInsight {
    id: number;
    text: string;
    category: string;
}

// Chat-related types
export interface UserFormData {
    situation: string;
    name: string;
    ageRange: string;
    gender: string;
    coachId: number;
}

export interface ChatMessageData {
    sender: string;
    recipient: string;
    message: string;
    timestamp: string;
}

export interface LikeMindsSdkResponse {
    success: boolean;
    message?: string;
    data?: any;
}

// OTPless types
export interface OTPlessUser {
    mobile: string;
    country_code: string;
    token: string;
    timestamp: number;
}

export interface OTPlessCallback {
    (otplessUser: OTPlessUser): void;
}
