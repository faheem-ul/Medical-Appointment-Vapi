import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

// Function to get contacts from GoHighLevel
async function getContactsFromGHL(limit: number = 10, startAfter?: string) {
  const GHL_API_KEY = process.env.GHL_API_KEY;
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    console.warn("GHL credentials not configured. Cannot fetch contacts.");
    console.warn(
      `GHL_API_KEY exists: ${!!GHL_API_KEY}, GHL_LOCATION_ID exists: ${!!GHL_LOCATION_ID}`
    );
    return null;
  }

  try {
    let apiUrl = `https://rest.gohighlevel.com/v1/contacts/?locationId=${GHL_LOCATION_ID}&limit=${limit}`;
    if (startAfter) {
      apiUrl += `&startAfter=${startAfter}`;
    }

    console.log("Fetching contacts from GHL:", {
      url: apiUrl,
      locationId: GHL_LOCATION_ID,
      limit,
    });

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
    });

    const responseText = await response.text();
    console.log("GHL Get Contacts Response Status:", response.status);
    console.log("GHL Get Contacts Response:", responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { rawResponse: responseText };
      }
      console.error("GHL API Error Details:", errorData);
      throw new Error(
        `GHL API error: ${response.status} ${
          response.statusText
        } - ${JSON.stringify(errorData)}`
      );
    }

    const data = JSON.parse(responseText);
    console.log("=== GHL CONTACTS DATA ===");
    console.log("Total contacts:", data.contacts?.length || 0);
    console.log("Contacts:", JSON.stringify(data, null, 2));
    console.log("=== END GHL CONTACTS DATA ===");
    return data;
  } catch (error) {
    console.error("Error fetching contacts from GHL:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

// Function to send contact to GoHighLevel
async function sendToGHL(name: string, email: string, phone: string) {
  const GHL_API_KEY = process.env.GHL_API_KEY;
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    console.warn("GHL credentials not configured. Skipping GHL integration.");
    console.warn(
      `GHL_API_KEY exists: ${!!GHL_API_KEY}, GHL_LOCATION_ID exists: ${!!GHL_LOCATION_ID}`
    );
    return null;
  }

  try {
    // Split name into firstName and lastName
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || name;
    const lastName = nameParts.slice(1).join(" ") || "";

    // Format phone number (ensure it's in the correct format)
    const formattedPhone = phone.startsWith("+")
      ? phone
      : `+1${phone.replace(/\D/g, "")}`;

    const requestBody = {
      firstName,
      lastName,
      email,
      phone: formattedPhone,
      tags: ["outbound"],
    };

    // Try with locationId in URL query parameter
    const apiUrl = `https://rest.gohighlevel.com/v1/contacts/?locationId=${GHL_LOCATION_ID}`;

    console.log("=== SENDING CONTACT TO GHL ===");
    console.log("URL:", apiUrl);
    console.log("Location ID:", GHL_LOCATION_ID);
    console.log("Request Body:", JSON.stringify(requestBody, null, 2));
    console.log("Timestamp:", new Date().toISOString());

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log("=== GHL API RESPONSE ===");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log(
      "Response Headers:",
      Object.fromEntries(response.headers.entries())
    );
    console.log("Response Body:", responseText);
    console.log("Timestamp:", new Date().toISOString());

    // Handle different response statuses
    if (response.status === 200 || response.status === 201) {
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        data = { rawResponse: responseText };
      }

      // Check if contact was created or updated
      if (data.contact && data.contact.id) {
        console.log("✅ Contact successfully processed in GHL");
        console.log("Contact ID:", data.contact.id);
        console.log("Contact Email:", data.contact.email);
        console.log("Contact Phone:", data.contact.phone);
        console.log("Is New Contact:", response.status === 201);
        console.log("Full Contact Data:", JSON.stringify(data, null, 2));
      } else {
        console.warn("⚠️ Response indicates success but no contact ID found");
        console.warn("Response data:", JSON.stringify(data, null, 2));
      }

      return data;
    }

    // Handle error responses
    let errorData;
    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = { rawResponse: responseText };
    }

    console.error("❌ GHL API Error:");
    console.error("Status:", response.status);
    console.error("Error Data:", JSON.stringify(errorData, null, 2));

    // Check if it's a duplicate contact error
    if (response.status === 422 || response.status === 409) {
      console.warn(
        "⚠️ Possible duplicate contact - GHL may have updated existing contact"
      );
      // Some GHL APIs return 422 for duplicates but still process the contact
      // Try to parse if there's any contact data in the error response
      if (errorData.contact || errorData.data) {
        console.log(
          "Contact may have been updated:",
          errorData.contact || errorData.data
        );
        return errorData.contact || errorData.data;
      }
    }

    throw new Error(
      `GHL API error: ${response.status} ${
        response.statusText
      } - ${JSON.stringify(errorData)}`
    );
  } catch (error) {
    console.error("=== ERROR SENDING TO GHL ===");
    console.error("Error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    console.error("Timestamp:", new Date().toISOString());
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

    // Send to GoHighLevel
    let ghlResult = null;
    let ghlError = null;
    let ghlContactId = null;
    let ghlStatus = "not_attempted";

    try {
      console.log("=== ATTEMPTING TO SEND TO GHL ===");
      console.log("Name:", name);
      console.log("Email:", email);
      console.log("Phone:", phone);

      ghlResult = await sendToGHL(name, email, phone);

      if (ghlResult) {
        ghlStatus = "success";
        // Extract contact ID if available
        if (ghlResult.contact?.id) {
          ghlContactId = ghlResult.contact.id;
        } else if (ghlResult.id) {
          ghlContactId = ghlResult.id;
        }
        console.log(
          "✅ GHL contact processed successfully. Contact ID:",
          ghlContactId
        );
      } else {
        ghlStatus = "skipped";
        console.log("⚠️ GHL integration skipped (credentials not configured)");
      }
    } catch (error) {
      ghlStatus = "failed";
      ghlError = error instanceof Error ? error.message : String(error);
      console.error("❌ Failed to send to GHL:", error);
      console.error("Error details:", ghlError);
      // Continue with email sending even if GHL fails
    }

    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "support@innovativemojo.com",
        pass: "vfps wphk rrsx wing",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    // ${process.env.Email_Captive}
    const mailoptionsToAdmin = {
      from: "support@innovativemojo.com",
      replyTo: email,
      to: `support@innovativemojo.com, developer@innovativemojo.com`,
      subject: "Innovative Mojo Response",
      text: `Following is the new Client:
      Name: ${name} 
      Email: ${email}
      Phone: ${phone}`,
    };

    const mailoptionsToUser = {
      from: "support@innovativemojo.com",
      to: email,
      subject: "Thanks for requesting a demo with Innovative MOJO",
      html: `
        <p>Hi ${name},</p>
        
        <p>Thanks for requesting a demo with Innovative MOJO.</p>
        
        <p>Our AI agent is calling you now to walk you through a live demo of how we build digital workforces that answer calls, qualify leads, and automate follow-ups for your business.</p>
        
        <p><strong>If you miss the call</strong></p>
        
        <p>No problem at all.</p>
        
        <p>You can call us directly at <a href="tel:+18182759714">(818) 275-9714</a> to hear the demo anytime.</p>
        
        <p>The AI will pick up immediately and walk you through the experience step by step.</p>
        
        <p><strong>What you'll see in the demo</strong></p>
        
        <ul>
          <li>How the AI answers and handles real business calls</li>
          <li>How it qualifies leads and books appointments</li>
          <li>How it follows up automatically via email and SMS</li>
          <li>How it integrates into your existing workflow</li>
        </ul>
        
        <p>This demo takes just a few minutes and shows exactly how the system works in real time.</p>
        
        <p>If you have questions after the demo, simply reply to this email and our team will take it from there.</p>
        
        <p>Looking forward to showing you what's possible.</p>
        
        <p>—<br>
        Innovative MOJO<br>
        We Build Digital Workforces — Not Websites<br><br>
        📞 <a href="tel:+18182759714">(818) 275-9714</a><br>
        🌐 <a href="https://innovativemojo.com">https://innovativemojo.com</a></p>
      `,
    };

    // Send emails
    await transport.sendMail(mailoptionsToAdmin);
    await transport.sendMail(mailoptionsToUser);

    return NextResponse.json(
      {
        message: "Form submitted successfully",
        ghl: {
          status: ghlStatus,
          contactCreated: ghlResult !== null,
          contactId: ghlContactId || undefined,
          error: ghlError || undefined,
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

// GET handler to fetch contacts from GHL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const startAfter = searchParams.get("startAfter") || undefined;

    console.log("=== GET CONTACTS REQUEST ===");
    console.log("Limit:", limit);
    console.log("Start After:", startAfter);

    const contactsData = await getContactsFromGHL(limit, startAfter);

    if (!contactsData) {
      return NextResponse.json(
        {
          error: "GHL credentials not configured",
          contacts: [],
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        contacts: contactsData.contacts || [],
        meta: contactsData.meta || {},
        total: contactsData.contacts?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET handler:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Detailed error:", errorMessage);

    return NextResponse.json(
      {
        error: "Failed to fetch contacts from GHL",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
        contacts: [],
      },
      { status: 500 }
    );
  }
}
