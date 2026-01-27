import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Format phone number (ensure it includes country code, e.g., +1)
    const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
 console.log( process.env.VAPI_API_KEY, "vapi api key");
    // Get Vapi API key from environment variables
    const VAPI_API_KEY = process.env.VAPI_API_KEY;
    const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;
    const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID;

    if (!VAPI_API_KEY || !VAPI_ASSISTANT_ID || !VAPI_PHONE_NUMBER_ID) {
      console.error('Missing Vapi configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Make the outbound call request to Vapi
    const vapiResponse = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
      body: JSON.stringify({
        assistantId: VAPI_ASSISTANT_ID,
        phoneNumberId: VAPI_PHONE_NUMBER_ID,
        customer: {
          number: formattedPhone,
        },
        // Pass user data as metadata that Vapi can access during the call
        metadata: {
          name,
          email,
          phone: formattedPhone,
        },
        // Provide dynamic variables so the assistant can use {{name}}, {{email}}, {{phone}} in prompts
        assistantOverrides: {
          variableValues: {
            name,
            email,
            phone: formattedPhone,
          },
        },
      }),
    });

    if (!vapiResponse.ok) {
      const errorData = await vapiResponse.json();
      console.error('Vapi API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to initiate call', details: errorData },
        { status: vapiResponse.status }
      );
    }

    const callData = await vapiResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Call initiated successfully',
      callId: callData.id,
    });
  } catch (error) {
    console.error('Error initiating Vapi call:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

