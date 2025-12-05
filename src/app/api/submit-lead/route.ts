import { NextRequest, NextResponse } from 'next/server';
import { trackServerEvent } from '@/services/mixpanel-server';
import { MIXPANEL_EVENTS, LeadFormSubmitProperties } from '@/config/mixpanel';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { situation, name, ageRange, gender, formCompletionTime } = body;
    
    // Validate required fields
    if (!situation || !name || !ageRange || !gender) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate a distinct ID (in production, use actual user ID or generate UUID)
    const distinctId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Track the form submission
    const eventProperties: LeadFormSubmitProperties = {
      situation_length: situation.length,
      user_name: name,
      user_age_range: ageRange,
      user_gender: gender,
      form_completion_time: formCompletionTime,
      page_url: request.headers.get('referer') || 'unknown',
      timestamp: Date.now(),
    };
    
    trackServerEvent(
      distinctId,
      MIXPANEL_EVENTS.LEAD_FORM_SUBMIT,
      eventProperties
    );
    
    // Here you would typically:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Trigger any webhooks
    // 4. etc.
    
    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      distinctId, // Return this to the client for further tracking
    });
  } catch (error) {
    console.error('Error submitting lead form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

