// Mixpanel Event Names and Properties Configuration

export const MIXPANEL_EVENTS = {
  // Page Events
  PAGE_VIEW: 'page_view',
  
  // Form Events
  LEAD_FORM_SUBMIT: 'lead_form_submit',
  FORM_FIELD_FOCUS: 'form_field_focus',
  FORM_ERROR: 'form_error',
  
  // CTA Events
  CTA_CLICK: 'cta_click',
  
  // Coach Events
  COACH_CARD_VIEW: 'coach_card_view',
  COACH_CARD_CLICK: 'coach_card_click',
  VIEW_ALL_COACHES_CLICK: 'view_all_coaches_click',
  
  // Emotional Hooks
  EMOTIONAL_CHIP_CLICK: 'emotional_chip_click',
  
  // Engagement Events
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
} as const;

export type MixpanelEventName = typeof MIXPANEL_EVENTS[keyof typeof MIXPANEL_EVENTS];

// Event Properties Types
export interface BaseEventProperties {
  page_url?: string;
  page_title?: string;
  referrer?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  session_id?: string;
  timestamp?: number;
}

export interface PageViewProperties extends BaseEventProperties {
  page_path: string;
}

export interface LeadFormSubmitProperties extends BaseEventProperties {
  situation_length: number;
  user_name: string;
  user_age_range: string;
  user_gender: string;
  form_completion_time?: number;
}

export interface CTAClickProperties extends BaseEventProperties {
  cta_text: string;
  cta_location: string;
  cta_type: 'primary' | 'secondary';
}

export interface CoachCardProperties extends BaseEventProperties {
  coach_name: string;
  coach_expertise?: string[];
}

export interface EmotionalChipProperties extends BaseEventProperties {
  chip_text: string;
  chip_index: number;
}

export interface FormFieldFocusProperties extends BaseEventProperties {
  field_name: string;
  field_type: string;
}

export interface FormErrorProperties extends BaseEventProperties {
  field_name: string;
  error_type: string;
}

export interface ScrollDepthProperties extends BaseEventProperties {
  depth_percentage: 25 | 50 | 75 | 100;
}

export interface TimeOnPageProperties extends BaseEventProperties {
  time_seconds: number;
}

// Super Properties (sent with every event)
export interface SuperProperties {
  app_version?: string;
  environment: 'development' | 'production';
  platform: 'web';
}

// Helper to get device type
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// Helper to generate session ID
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to get base properties
export function getBaseProperties(): BaseEventProperties {
  if (typeof window === 'undefined') {
    return {
      timestamp: Date.now(),
    };
  }
  
  return {
    page_url: window.location.href,
    page_title: document.title,
    referrer: document.referrer || 'direct',
    device_type: getDeviceType(),
    timestamp: Date.now(),
  };
}

