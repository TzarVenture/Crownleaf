import { NextResponse } from "next/server";
import { WP_URL } from "@/lib/site";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rateLimit";
import { clean, isEmail } from "@/lib/validation";

const respond = (message, status, extra = {}) =>
  NextResponse.json({ success: status < 400, message, ...extra }, { status });

export async function POST(request) {
  const limit = rateLimit(`enquiry:${getClientIp(request)}`, { limit: 4, windowMs: 10 * 60_000 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  try {
    const body = await request.json();

    // Honeypot: real visitors never fill this hidden field. Pretend success so bots do not retry.
    if (clean(body?.website)) return respond("Your enquiry has been sent successfully.", 200);

    const name = clean(body?.name, 100);
    const email = clean(body?.email, 254);
    const phone = clean(body?.phone, 25);
    const company = clean(body?.company, 120);
    const budget = clean(body?.budget, 60);
    const quantity = clean(body?.quantity, 30);

    if (!name || !email) return respond("Name and Email are required.", 400);
    if (!isEmail(email)) return respond("Please enter a valid email address.", 400);
    if (phone && !/^[+\d][\d\s\-().]{6,24}$/.test(phone)) return respond("Please enter a valid phone number.", 400);
    if (!body?.consent) return respond("Please agree to the terms to proceed.", 400);

    // Payload for WordPress Contact Form 7 (Form ID: 78 - Bulk Enquiry)
    const formData = new FormData();
    formData.append("_wpcf7", "78");
    formData.append("_wpcf7_unit_tag", "wpcf7-f78-p212-o1");
    formData.append("your-name", name);
    formData.append("your-email", email);
    formData.append("your-phone", phone);
    formData.append("your-company", company);
    formData.append("your-budget", budget);
    formData.append("your-gifts", quantity);
    formData.append(
      "agree[]",
      "By proceeding, I agree to T&C and Privacy Policy. Yes, I would like to receive updates via WhatsApp."
    );

    const wpResponse = await fetch(`${WP_URL}/wp-json/contact-form-7/v1/contact-forms/78/feedback`, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });
    const wpResult = await wpResponse.json();

    if (wpResult.status === "mail_sent") {
      return respond(wpResult.message || "Your enquiry has been sent successfully.", 200);
    }

    return respond(wpResult.message || "Failed to send message. Please try again.", 422, {
      invalid_fields: wpResult.invalid_fields || [],
    });
  } catch (error) {
    console.error("Enquiry API route error:", error);
    return respond("An unexpected error occurred. Please try again later.", 500);
  }
}
