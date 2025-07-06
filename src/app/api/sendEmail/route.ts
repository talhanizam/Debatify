import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid message' }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: 'Debatify Feedback <onboarding@resend.dev>',
      to: 'tlhnizam@gmail.com',
      subject: 'New Message from Debatify',
      text: message,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Resend error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}
