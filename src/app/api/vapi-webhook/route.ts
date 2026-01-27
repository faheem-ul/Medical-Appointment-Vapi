// app/api/vapi-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'support@innovativemojo.com',
    pass: 'vfps wphk rrsx wing', // move to ENV in production
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Type definitions for VAPI webhook payload
interface ArtifactMessage {
  role?: string;
  message?: string;
}

interface Artifact {
  messages?: ArtifactMessage[];
}

// Build transcript from artifact.messages (user/bot only)
function buildTranscriptFromArtifact(artifact: Artifact | null | undefined): string {
  const msgs = artifact?.messages;
  if (!Array.isArray(msgs) || msgs.length === 0) return '';

  const lines: string[] = [];

  for (const m of msgs) {
    const role = m.role;
    const text = m.message;
    if (!text || !role) continue;

    if (role === 'bot') {
      lines.push(`Agent: ${text}`);
    } else if (role === 'user') {
      lines.push(`User: ${text}`);
    }
  }

  return lines.join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Vapi payload:', JSON.stringify(body, null, 2));

    const message = body?.message;

    // Real caller number from call object (fallback if tool omits it)
    const realCallerNumber =
      message?.call?.from?.phoneNumber ||
      message?.call?.customer?.number ||
      message?.call?.metadata?.phone ||
      body?.customer?.number ||
      '';

    // Tool call + arguments
    const toolCall = message?.toolCalls?.[0];
    const rawArgs = toolCall?.function?.arguments;
    const args =
      typeof rawArgs === 'string' ? JSON.parse(rawArgs) : (rawArgs || {});

    const {
      callerName,
      callerNumber,
      callDuration,
      agentName,
      callSummary,
      detailsCollected,
    } = args as {
      callerName?: string;
      callerNumber?: string;
      numberCalled?: string;
      callDuration?: string;
      agentName?: string;
      callSummary?: string;
      detailsCollected?: string;
    };

    // Prefer tool callerNumber, fall back to real one from call object
    const finalCallerNumber = callerNumber || realCallerNumber || '';

    // Call duration: prefer tool value, fallback to message/call duration if present
    const durationSeconds =
      message?.duration ??
      message?.call?.duration ??
      null;

    const finalCallDuration =
      callDuration ||
      (durationSeconds ? `${durationSeconds} seconds` : '');

    // Build full transcript from artifact.messages
    const artifact = message?.artifact;
    const fullTranscript = buildTranscriptFromArtifact(artifact);

    // Build email text body in required format
    const emailText = `
Caller's Name: ${callerName || 'N/A'}
Caller's Number: ${finalCallerNumber || 'N/A'}
Call Duration: ${finalCallDuration || 'N/A'}
AI Agent Name: ${agentName || 'N/A'}
Call Summary:
${callSummary || 'N/A'}

Details collected from the contact:
${detailsCollected || 'N/A'}

Full Transcript:
${fullTranscript || 'N/A'}
    `.trim();

    // All recipients
    const recipients = [
    //   'sales@innovativemojo.com',
    //   'eric@innovativemojo.com',
    //   'dluster@innovativemojo.com',
    //   'oan@innovativemojo.com',
      'developer@innovativemojo.com',
    ];

    // Nodemailer accepts comma-separated string or array for "to"
    await transport.sendMail({
      from: '"Innovative Mojo Support" <support@innovativemojo.com>',
      to: recipients, // or recipients.join(', ')
      subject: `New Call Summary from ${
        callerName || finalCallerNumber || 'Unknown Caller'
      }`,
      text: emailText,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error handling Vapi request:', err);
    return new NextResponse('Server error', { status: 500 });
  }
}

export function GET() {
  return new NextResponse('Method not allowed', { status: 405 });
}
