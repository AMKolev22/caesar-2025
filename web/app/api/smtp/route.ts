import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { to, subject, text, html } = await req.json();

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: '934982001@smtp-brevo.com',
        pass: 'RSaOf5UcDPFYXBC7',
      },
    });

    const info = await transporter.sendMail({
      from: 'poleka84@gmail.com',
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent:', info.messageId);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } 
  catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}