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

function safeJsonParse(input: string | undefined): Record<string, unknown> | undefined {
  if (typeof input !== "string") return input;
  try {
    return JSON.parse(input);
  } catch {
    return undefined;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;

    // 1) Find toolCallId + args in the "new" Vapi format
    const toolCallFromList = message?.toolCallList?.[0];
    const toolCallIdFromList = toolCallFromList?.id;
    const argsFromList =
      toolCallFromList?.arguments ??
      toolCallFromList?.parameters ??
      {};

    // 2) Back-compat: older format (your current handler uses this style)
    const toolCallOld = message?.toolCalls?.[0];
    const toolCallIdOld = toolCallOld?.id;
    const rawArgsOld = toolCallOld?.function?.arguments;
    const argsOld = safeJsonParse(rawArgsOld as string | undefined) ?? rawArgsOld ?? {};

    const toolCallId: string = toolCallIdFromList || toolCallIdOld;
    const args = (toolCallIdFromList ? argsFromList : argsOld) || {};

    // Pull caller number from call object as fallback (optional)
    const realCallerNumber =
      message?.call?.from?.phoneNumber ||
      message?.call?.customer?.number ||
      body?.customer?.number ||
      "";

    const callerName: string = args.callerName || "";
    const callerEmail: string = args.callerEmail || "";
    const callerNumber: string = args.callerNumber || realCallerNumber || "";
    const appointmentDate: string = args.appointmentDate || "";
    const appointmentTime: string = args.appointmentTime || "";

    if (!toolCallId) {
      return new NextResponse("Missing toolCallId", { status: 400 });
    }
    if (!callerEmail) {
      // Return tool result (so Vapi can continue) instead of hard failing
      return NextResponse.json({
        results: [
          {
            toolCallId,
            result: { ok: false, error: "Missing callerEmail" },
          },
        ],
      });
    }

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

    await transport.sendMail({
      from: `"Innovative Mojo Support" <support@innovativemojo.com>`,
      to: callerEmail,
      subject,
      text: textLines.join("\n"),
    });

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
