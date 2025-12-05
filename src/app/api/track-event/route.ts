import { NextRequest, NextResponse } from 'next/server';
import { trackServerEvent } from '@/services/mixpanel-server';
import { MixpanelEventName } from '@/config/mixpanel';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { distinctId, eventName, properties } = body;
    
    // Validate required fields
    if (!distinctId || !eventName) {
      return NextResponse.json(
        { error: 'Missing required fields: distinctId and eventName' },
        { status: 400 }
      );
    }
    
    // Track the event
    trackServerEvent(
      distinctId,
      eventName as MixpanelEventName,
      properties || {}
    );
    
    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully',
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

