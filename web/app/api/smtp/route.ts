import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { to, subject, text, html } = await req.json();

    const transporter = nodemailer.createTransport({
      host: 'mail.smtp2go.com',
      port: 587,
      secure: false,
      auth: {
        user: 'admin_movie',
        pass: 'WacALj9l1CbKN0CH',
      },
    });

    const info = await transporter.sendMail({
      from: 'amkolev22@codingburgas.bg',
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent:', info.messageId);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Email error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}