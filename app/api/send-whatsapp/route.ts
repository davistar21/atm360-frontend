import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: Request) {
  try {
    const { to, message } = await req.json();

    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER!;

    const client = twilio(accountSid, authToken);

    const sent = await client.messages.create({
      from: fromNumber,
      to: `whatsapp:${to}`,
      body: message,
    });

    return NextResponse.json({ success: true, sid: sent.sid });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err?.message : "Failed to send message",
      },
      { status: 500 }
    );
  }
}
