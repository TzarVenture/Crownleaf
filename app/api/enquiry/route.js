import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, budget, quantity, consent } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and Email are required." },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { success: false, message: "Please agree to the terms to proceed." },
        { status: 400 }
      );
    }

    // Prepare payload for WordPress Contact Form 7 (Form ID: 78 - Bulk Enquiry)
    const formData = new FormData();
    formData.append("_wpcf7", "78");
    formData.append("_wpcf7_unit_tag", "wpcf7-f78-p212-o1");
    formData.append("your-name", name);
    formData.append("your-email", email);
    formData.append("your-phone", phone || "");
    formData.append("your-company", company || "");
    formData.append("your-budget", budget || "");
    formData.append("your-gifts", quantity || "");
    formData.append(
      "agree[]",
      "By proceeding, I agree to T&C and Privacy Policy. Yes, I would like to receive updates via WhatsApp."
    );

    const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://crownleaf.co";
    const cf7Endpoint = `${wpUrl}/wp-json/contact-form-7/v1/contact-forms/78/feedback`;

    const wpResponse = await fetch(cf7Endpoint, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    const wpResult = await wpResponse.json();

    if (wpResult.status === "mail_sent") {
      return NextResponse.json({
        success: true,
        message: wpResult.message || "Your enquiry has been sent successfully.",
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: wpResult.message || "Failed to send message. Please try again.",
        invalid_fields: wpResult.invalid_fields || [],
      },
      { status: 422 }
    );
  } catch (error) {
    console.error("Enquiry API Route Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
