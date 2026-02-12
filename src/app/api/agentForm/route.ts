import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { google } from "googleapis";

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const emailSubmissionMap = new Map<
  string,
  { count: number; resetTime: number; lastSubmission: number }
>();

function checkRateLimit(
  ip: string,
  maxRequests: number = 5,
  windowMs: number = 3600000
): boolean {
  const now = Date.now();
  const key = ip;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

// Check for duplicate email submission (same email within 1 hour)
function checkDuplicateEmail(
  email: string,
  windowMs: number = 3600000
): boolean {
  const now = Date.now();
  const normalizedEmail = email.toLowerCase().trim();
  const current = emailSubmissionMap.get(normalizedEmail);

  if (!current || now > current.resetTime) {
    emailSubmissionMap.set(normalizedEmail, {
      count: 1,
      resetTime: now + windowMs,
      lastSubmission: now,
    });
    return false; // Not a duplicate
  }

  // Check if last submission was within the window
  const timeSinceLastSubmission = now - current.lastSubmission;
  if (timeSinceLastSubmission < windowMs) {
    return true; // Duplicate found
  }

  // Update the submission time
  current.lastSubmission = now;
  current.count++;
  return false; // Not a duplicate, but update the record
}

// Check email-based rate limit (3 requests per hour per email)
function checkEmailRateLimit(
  email: string,
  maxRequests: number = 3,
  windowMs: number = 3600000
): boolean {
  const now = Date.now();
  const normalizedEmail = email.toLowerCase().trim();
  const current = emailSubmissionMap.get(normalizedEmail);

  if (!current || now > current.resetTime) {
    emailSubmissionMap.set(normalizedEmail, {
      count: 1,
      resetTime: now + windowMs,
      lastSubmission: now,
    });
    return true; // Allowed
  }

  if (current.count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  current.count++;
  current.lastSubmission = now;
  return true; // Allowed
}

// Function to send contact data to Google Sheet
async function sendToGoogleSheet(name: string, email: string, phone: string) {
  const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const GOOGLE_SHEETS_CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const GOOGLE_SHEETS_PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

  if (
    !GOOGLE_SHEETS_SPREADSHEET_ID ||
    !GOOGLE_SHEETS_CLIENT_EMAIL ||
    !GOOGLE_SHEETS_PRIVATE_KEY
  ) {
    console.warn(
      "Google Sheets credentials not configured. Skipping Google Sheets integration."
    );
    console.warn(
      `SPREADSHEET_ID exists: ${!!GOOGLE_SHEETS_SPREADSHEET_ID}, CLIENT_EMAIL exists: ${!!GOOGLE_SHEETS_CLIENT_EMAIL}, PRIVATE_KEY exists: ${!!GOOGLE_SHEETS_PRIVATE_KEY}`
    );
    return null;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const timestamp = new Date().toISOString();

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: "Sheet2!A:D",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[name, email, phone, timestamp]],
      },
    });

    console.log("✅ Data sent to Google Sheet successfully");
    console.log("Updated range:", response.data.updates?.updatedRange);
    return response.data;
  } catch (error) {
    console.error("❌ Error sending data to Google Sheet:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-client-ip") ||
      "unknown";

    // Check IP-based rate limit (2 requests per hour per IP)
    if (!checkRateLimit(ip, 2, 3600000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { name, email, phone, recaptchaToken, termsAccepted } =
      await request.json();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate terms acceptance if provided (for forms that require it)
    if (termsAccepted !== undefined && !termsAccepted) {
      return NextResponse.json(
        {
          error: "You must accept the terms and conditions to submit this form",
        },
        { status: 400 }
      );
    }

    // Normalize email for checks
    const normalizedEmail = email.toLowerCase().trim();

    // Check for duplicate email submission (same email within 1 hour)
    if (checkDuplicateEmail(normalizedEmail, 3600000)) {
      return NextResponse.json(
        {
          error:
            "You have already submitted this form recently. Please try again later.",
        },
        { status: 429 }
      );
    }

    // Check email-based rate limit (3 requests per hour per email)
    if (!checkEmailRateLimit(normalizedEmail, 3, 3600000)) {
      return NextResponse.json(
        {
          error:
            "Too many requests from this email address. Please try again later.",
        },
        { status: 429 }
      );
    }

    // Verify reCAPTCHA token
    const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
    if (RECAPTCHA_SECRET_KEY) {
      if (!recaptchaToken) {
        return NextResponse.json(
          { error: "reCAPTCHA verification required" },
          { status: 400 }
        );
      }

      try {
        const recaptchaResponse = await fetch(
          `https://www.google.com/recaptcha/api/siteverify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
          }
        );

        const recaptchaData = await recaptchaResponse.json();

        if (!recaptchaData.success) {
          console.error("reCAPTCHA verification failed:", recaptchaData);
          return NextResponse.json(
            { error: "reCAPTCHA verification failed" },
            { status: 400 }
          );
        }

        // Check score (v3 returns a score between 0.0 and 1.0)
        // Score below 0.5 is suspicious, but you can adjust this threshold
        if (recaptchaData.score < 0.5) {
          console.warn(
            `reCAPTCHA score too low: ${recaptchaData.score}`,
            recaptchaData
          );
          return NextResponse.json(
            { error: "reCAPTCHA verification failed" },
            { status: 400 }
          );
        }

        console.log(
          "reCAPTCHA verified successfully. Score:",
          recaptchaData.score
        );
      } catch (recaptchaError) {
        console.error("Error verifying reCAPTCHA:", recaptchaError);
        return NextResponse.json(
          { error: "reCAPTCHA verification error" },
          { status: 500 }
        );
      }
    } else {
      console.warn(
        "RECAPTCHA_SECRET_KEY not configured. Skipping verification."
      );
    }

    // Send to Google Sheet
    let googleSheetStatus = "not_attempted";
    let googleSheetError = null;

    try {
      console.log("=== ATTEMPTING TO SEND TO GOOGLE SHEET ===");
      const sheetResult = await sendToGoogleSheet(name, email, phone);

      if (sheetResult) {
        googleSheetStatus = "success";
        console.log("✅ Google Sheet updated successfully");
      } else {
        googleSheetStatus = "skipped";
        console.log(
          "⚠️ Google Sheets integration skipped (credentials not configured)"
        );
      }
    } catch (error) {
      googleSheetStatus = "failed";
      googleSheetError = error instanceof Error ? error.message : String(error);
      console.error("❌ Failed to send to Google Sheet:", error);
      console.error("Error details:", googleSheetError);
      // Continue with email sending even if Google Sheets fails
    }

    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "faheemulhassanaziz@gmail.com",
        pass: "pyvg cksu ueom bnlr",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    // ${process.env.Email_Captive}
    const mailoptionsToAdmin = {
      from: "faheemulhassanaziz@gmail.com",
      replyTo: email,
      to: `faheemulhassanaziz@gmail.com`,
      subject: "Innovative Mojo Response",
      text: `Following is the new Client:
      Name: ${name} 
      Email: ${email}
      Phone: ${phone}`,
    };

    const mailoptionsToUser = {
      from: "faheemulhassanaziz@gmail.com",
      to: email,
      subject: "Thanks for requesting a demo with Thank You Doctor.",
      html: `
        <p>Hi ${name},</p>
        
        <p>Thank you for requesting a demo with My Doctor's AI Medical Assistant.</p>
        
        <p>Our AI agent is calling you now to demonstrate how we automate patient intake, triage inquiries, and schedule appointments with clinical precision.</p>
        
        <p><strong>If you miss the call</strong></p>
        
        <p>No problem at all.</p>
        
        <p>You can call our demo line directly at <a href="tel:+15169731565">(516) 973 1565</a> to experience the assistant anytime.</p>
        
        <p>The AI will handle your call immediately, guiding you through a simulated patient experience step by step.</p>
        
        <p><strong>What you'll experience in the demo:</strong></p>
        
        <ul>
          <li><strong>Smart Intake:</strong> How the AI collects patient information and reason for visit.</li>
          <li><strong>Instant Scheduling:</strong> Real-time appointment booking and calendar synchronization.</li>
          <li><strong>Automated Follow-ups:</strong> Post-call SMS and email confirmations.</li>
        </ul>
        
        <p>This demo takes just a few minutes and showcases how our AI reduces administrative burden while improving patient access.</p>
        
        <p>If you have any questions after the demo, simply reply to this email and one of our specialists will be happy to help.</p>
        
        <p>Best regards,</p>
        
        <p>—<br>
        <strong>My Doctor Support Team</strong><br>

        Automating Healthcare Operations<br><br>
        📞 <a href="tel:+15169731565">(516) 973 1565</a><br>
        🌐 <a href="https://medical-appointment-vapi.vercel.app/">https://medical-appointment-vapi.vercel.app/</a></p>
      `,
    };

    // Send emails
    await transport.sendMail(mailoptionsToAdmin);
    await transport.sendMail(mailoptionsToUser);

    return NextResponse.json(
      {
        message: "Form submitted successfully",
        googleSheet: {
          status: googleSheetStatus,
          error: googleSheetError || undefined,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST handler:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Detailed error:", errorMessage);

    return NextResponse.json(
      {
        error: "Failed to send email. Please try again later.",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
