// OTPless Configuration
export const OTPLESS_CONFIG = {
    appId: process.env.NEXT_PUBLIC_OTPLESS_APP_ID || "",
    clientId: process.env.OTPLESS_CLIENT_ID || "",
    clientSecret: process.env.OTPLESS_CLIENT_SECRET || "",
};

// Widget configuration options
export const OTPLESS_WIDGET_CONFIG = {
    // Widget will be configured in component
    // Callback is set dynamically
};

