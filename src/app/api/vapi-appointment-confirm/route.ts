// app/api/vapi-appointment-confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: 'support@innovativemojo.com', 
    pass: 'vfps wphk rrsx wing', 
  },
  tls: { rejectUnauthorized: false },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Debug: Log full payload
    console.log('=== VAPI Appointment Confirm - Full Payload ===');
    console.log('Full body:', JSON.stringify(body, null, 2));
    
    const message = body?.message;
    console.log('Message object:', JSON.stringify(message, null, 2));

    // Use the same method as vapi-webhook to get parameters
    const toolCall = message?.toolCalls?.[0];
    console.log('Tool call object:', JSON.stringify(toolCall, null, 2));
    
    const toolCallId = toolCall?.id;
    console.log('Tool call ID:', toolCallId);
    
    const rawArgs = toolCall?.function?.arguments;
    console.log('Raw arguments (before parsing):', rawArgs);
    console.log('Raw arguments type:', typeof rawArgs);
    
    // Parse arguments with error handling
    let args: {
      callerEmail?: string;
      callerName?: string;
      callerNumber?: string;
      appointmentDate?: string;
      appointmentTime?: string;
      [key: string]: unknown;
    } = {};
    
    try {
      if (typeof rawArgs === 'string') {
        console.log('Parsing rawArgs as JSON string...');
        args = JSON.parse(rawArgs);
      } else if (rawArgs && typeof rawArgs === 'object') {
        console.log('Using rawArgs as object directly...');
        args = rawArgs as typeof args;
      } else {
        console.log('No rawArgs found, using empty object');
        args = {};
      }
    } catch (parseError) {
      console.error('Error parsing arguments:', parseError);
      console.error('Failed to parse rawArgs:', rawArgs);
      args = {};
    }
    
    console.log('Parsed arguments:', JSON.stringify(args, null, 2));
    console.log('Arguments keys:', Object.keys(args));

    // Extract email and other appointment details
    const callerEmail = args.callerEmail || "";
    const callerName = args.callerName || "";
    const callerNumber = args.callerNumber || "";
    const appointmentDate = args.appointmentDate || "";
    const appointmentTime = args.appointmentTime || "";

    console.log('=== Extracted Values ===');
    console.log('  callerEmail:', callerEmail);
    console.log('  callerName:', callerName);
    console.log('  callerNumber:', callerNumber);
    console.log('  appointmentDate:', appointmentDate);
    console.log('  appointmentTime:', appointmentTime);

    if (!toolCallId) {
      console.error('❌ Missing toolCallId');
      return new NextResponse("Missing toolCallId", { status: 400 });
    }

    if (!callerEmail || callerEmail.trim() === "") {
      console.warn('⚠️ Missing callerEmail - returning error with available data');
      console.warn('Available args:', JSON.stringify(args, null, 2));
      
      // Return tool result (so Vapi can continue) with all available data
      return NextResponse.json({
        results: [
          {
            toolCallId,
            result: {
              ok: false,
              error: "Missing callerEmail",
              dataReceived: {
                callerName: callerName || null,
                callerNumber: callerNumber || null,
                appointmentDate: appointmentDate || null,
                appointmentTime: appointmentTime || null,
              },
              debug: {
                rawArgs: rawArgs,
                parsedArgs: args,
                toolCall: toolCall,
              },
            },
          },
        ],
      });
    }

    console.log('✅ Email found, proceeding to send confirmation email...');

    // Email content
    const subject = "Confirmed: Your Appointment with Medical Center";
    const textLines = [
      `Hi ${callerName || "there"},`,
      ``,
      appointmentDate && appointmentTime
        ? `Your appointment is confirmed for ${appointmentDate} at ${appointmentTime}.`
        : `Your appointment is confirmed.`,
      ``,
      callerNumber ? `Phone: ${callerNumber}` : "",
      ``,
      "See you soon,",
      "Medical Center",
    ].filter(Boolean);

    console.log('Sending email to:', callerEmail);
    console.log('Email subject:', subject);
    
    await transport.sendMail({
      from: `"Innovative Mojo Support" <support@innovativemojo.com>`,
      to: callerEmail,
      subject,
      text: textLines.join("\n"),
    });

    console.log('✅ Email sent successfully to:', callerEmail);

    // IMPORTANT: Vapi-required response format
    return NextResponse.json({
      results: [
        {
          toolCallId,
          result: { ok: true, sentTo: callerEmail },
        },
      ],
    });
  } catch (err) {
    console.error("Error in vapi-appointment-confirm:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}

export function GET() {
  return new NextResponse("Method not allowed", { status: 405 });
}
