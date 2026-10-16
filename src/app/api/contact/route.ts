import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/site";

type ContactBody = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  type?: unknown;
};

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: Request) {
  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = asTrimmedString(body.name);
  const email = asTrimmedString(body.email);
  const message = asTrimmedString(body.message);
  const subject =
    asTrimmedString(body.subject) ??
    (name ? `Portfolio inquiry from ${name}` : null);
  const type = asTrimmedString(body.type);

  if (!name || !email || !message || !subject) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.CONTACT_FROM_EMAIL;
  const toAddress = process.env.CONTACT_TO_EMAIL ?? siteConfig.author.email;

  if (!resendKey || !fromAddress) {
    return NextResponse.json(
      { error: "Email delivery is not configured." },
      { status: 503 },
    );
  }

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    type ? `Type: ${type}` : null,
    `Subject: ${subject}`,
    "",
    message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  let resendRes: Response;
  try {
    resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toAddress],
        reply_to: email,
        subject,
        text,
      }),
    });
  } catch (error) {
    console.error("Resend request failed:", error);
    return NextResponse.json(
      { error: "Email delivery is temporarily unavailable." },
      { status: 502 },
    );
  }

  const resendData = (await resendRes.json().catch(() => null)) as {
    id?: unknown;
    message?: unknown;
  } | null;

  if (!resendRes.ok) {
    console.error("Resend error:", resendData?.message ?? resendRes.statusText);
    return NextResponse.json(
      { error: "Resend rejected the message." },
      { status: 502 },
    );
  }

  if (typeof resendData?.id !== "string" || !resendData.id) {
    console.error("Resend response did not include an email id.");
    return NextResponse.json(
      { error: "Resend did not accept the message." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, id: resendData.id });
}
