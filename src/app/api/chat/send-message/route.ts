import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Extract message data from LikeMinds SDK
    const { sender, recipient, message, timestamp } = body;
    
    // Log message to console (MVP - no persistence)
    console.log('===== Chat Message Logged =====');
    console.log('Sender:', sender);
    console.log('Recipient:', recipient);
    console.log('Message:', message);
    console.log('Timestamp:', timestamp || new Date().toISOString());
    console.log('==============================');
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Chat message logged successfully',
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error logging message:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to log message',
    }, { status: 500 });
  }
}

