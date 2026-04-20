import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection on startup
transporter.verify().then(() => {
  console.log('📧 SMTP connection established');
}).catch((err) => {
  console.error('❌ SMTP connection failed:', err.message);
});

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: `"CareerNIT" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Password Reset OTP – CareerNIT',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #5C6BC0, #7E57C2); padding: 32px 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">🚀 CareerNIT</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">NIT Warangal Placement Portal</p>
        </div>
        <div style="padding: 32px 24px; color: #e0e0e0;">
          <h2 style="color: #B39DDB; margin: 0 0 16px; font-size: 20px;">Password Reset Request</h2>
          <p style="margin: 0 0 24px; line-height: 1.6; font-size: 15px; color: #ccc;">
            Use the verification code below to reset your password. This code expires in <strong style="color: #fff;">10 minutes</strong>.
          </p>
          <div style="background: linear-gradient(135deg, rgba(92,107,192,0.2), rgba(126,87,194,0.2)); border: 1px solid rgba(179,157,219,0.3); border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #fff; font-family: 'Courier New', monospace;">${otp}</span>
          </div>
          <p style="margin: 0; font-size: 13px; color: #888; line-height: 1.5;">
            If you didn't request this, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 16px 24px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #666;">© ${new Date().getFullYear()} CareerNIT · NIT Warangal</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendContactEmail = async (
  senderName: string,
  senderEmail: string,
  subject: string,
  message: string
): Promise<void> => {
  const adminEmail = process.env.OTP_EMAIL || process.env.SMTP_USER;

  const mailOptions = {
    from: `"CareerNIT Contact" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    replyTo: senderEmail,
    subject: `[CareerNIT Contact] ${subject}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #5C6BC0, #7E57C2); padding: 32px 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 800;">📬 New Contact Message</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">CareerNIT Contact Form</p>
        </div>
        <div style="padding: 32px 24px; color: #e0e0e0;">
          <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; margin: 0 0 20px;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #888;">FROM</p>
            <p style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #fff;">${senderName}</p>
            <p style="margin: 0; font-size: 14px; color: #B39DDB;">${senderEmail}</p>
          </div>
          <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; margin: 0 0 20px;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #888;">SUBJECT</p>
            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #fff;">${subject}</p>
          </div>
          <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #888;">MESSAGE</p>
            <p style="margin: 0; font-size: 15px; color: #ccc; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 16px 24px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #666;">© ${new Date().getFullYear()} CareerNIT · NIT Warangal</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
