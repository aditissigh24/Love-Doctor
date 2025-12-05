# Love Doctor Landing Page

A premium single-page landing page for Love Doctor - a relationship navigation and emotional support service designed for Indian consumers.

## 🎯 Project Overview

This landing page is built with Next.js 16 (App Router) and TypeScript, featuring:

- **Provocative, emotionally-charged copy** targeting Indian relationship anxieties
- **Purple-pink gradient aesthetic** with neon effects
- **Premium coach profiles** showcasing aspirational relationship experts
- **Lead capture form** for situation decoding
- **Social proof** with relatable testimonials
- **WhatsApp integration** for instant connection

## 📁 Project Structure

```
love-doctor/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles with CSS variables
│   │   ├── layout.tsx           # Root layout with metadata
│   │   ├── page.tsx             # Main landing page
│   │   └── page.module.css      # Page-level styles
│   ├── landing/                 # Landing page components
│   │   ├── HeroSection.tsx
│   │   ├── EmotionalHooks.tsx
│   │   ├── CoachCards.tsx
│   │   ├── SocialProof.tsx
│   │   ├── DailyInsight.tsx
│   │   ├── LeadCapture.tsx
│   │   ├── WhatsAppFooter.tsx
│   │   └── styles/              # Component CSS modules
│   │       ├── HeroSection.module.css
│   │       ├── EmotionalHooks.module.css
│   │       ├── CoachCards.module.css
│   │       ├── SocialProof.module.css
│   │       ├── DailyInsight.module.css
│   │       ├── LeadCapture.module.css
│   │       └── WhatsAppFooter.module.css
│   └── types/
│       └── index.ts             # TypeScript type definitions
├── public/
│   └── images/                  # Coach placeholder images
│       ├── coach-1.svg
│       ├── coach-2.svg
│       └── coach-3.svg
└── package.json
```

## 🎨 Design Features

### Color Palette
- **Primary Gradient**: Purple (#8B5CF6) to Pink (#EC4899)
- **Secondary Gradient**: Lighter purple to pink variations
- **Neon Effects**: Purple (#A78BFA) and Pink (#F9A8D4) glows
- **Dark Background**: Deep navy to purple gradient

### Components

1. **HeroSection**: Full-screen hero with 4 headline variations, CTAs, and micro-copy badges
2. **EmotionalHooks**: 8 interactive chips with relatable relationship questions
3. **CoachCards**: Premium coach profiles with expertise tags
4. **SocialProof**: Real-time style testimonials from different Indian cities
5. **DailyInsight**: Interactive spinning wheel with daily insights
6. **LeadCapture**: Multi-field form with situation textarea, name, age range, and gender
7. **WhatsAppFooter**: WhatsApp CTA with footer links

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## 🎯 Key Features

- **Mobile-first responsive design** - Works beautifully on all devices
- **Smooth animations** - CSS animations for hover states and interactions
- **Accessibility** - Semantic HTML and proper form labels
- **Performance optimized** - Next.js Image optimization for coach photos
- **Type-safe** - Full TypeScript implementation
- **Zero external dependencies** - Uses only Next.js, React, and TypeScript

## 📝 Customization

### Change Headlines
Edit `src/landing/HeroSection.tsx` - modify the `headlines` array

### Update Coach Profiles
Edit `src/landing/CoachCards.tsx` - modify the `coaches` array
Replace placeholder SVGs in `public/images/` with actual photos

### Modify Form Fields
Edit `src/landing/LeadCapture.tsx` - adjust form fields and validation

### Adjust Colors
Edit CSS variables in `src/app/globals.css`:
- `--gradient-primary`
- `--gradient-secondary`
- `--neon-purple`
- `--neon-pink`

### WhatsApp Number
Edit `src/landing/WhatsAppFooter.tsx` - update the `whatsappNumber` constant

## 🎨 Design Psychology

The landing page incorporates several psychological triggers:

1. **Fear of heartbreak/ghosting** - Addressed in emotional hooks
2. **Need for validation** - Reflected in social proof
3. **Desire for clarity** - Core positioning throughout
4. **Trust building** - Micro-copy emphasizing privacy and safety
5. **Aspirational supply** - Premium coach profiles
6. **Dopamine hits** - Interactive daily insight wheel

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

All components are fully responsive with appropriate layouts for each breakpoint.

## 🔧 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **Fonts**: Inter & DM Sans (Google Fonts)
- **Image Format**: SVG placeholders (replace with actual images)

## 📊 Form Handling

Currently, the lead capture form logs data to the console. To integrate with a backend:

1. Create a Next.js API route in `src/app/api/submit-lead/route.ts`
2. Update the `handleSubmit` function in `src/landing/LeadCapture.tsx`
3. Add your backend endpoint or service (e.g., Supabase, Firebase, custom API)

## 🎯 Next Steps

- [ ] Replace placeholder coach images with real photos
- [ ] Integrate backend API for form submission
- [ ] Add analytics tracking (Google Analytics, Mixpanel, etc.)
- [ ] Implement A/B testing for headline variations
- [ ] Add email capture to footer
- [ ] Create Thank You page after form submission
- [ ] Set up WhatsApp Business API integration

## 📄 License

All rights reserved © 2024 Love Doctor

---

Built with ❤️ for navigating love lives in India
