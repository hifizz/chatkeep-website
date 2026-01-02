import { NextRequest, NextResponse } from "next/server";
import { handleStripeWebhook } from "~/server/billing/stripe";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 401 });
  }

  const payload = await request.text();

  try {
    await handleStripeWebhook({ payload, signature });
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
