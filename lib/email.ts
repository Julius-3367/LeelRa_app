import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === "SG.placeholder") {
    console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
    return;
  }

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
}

export function approvalEmailTemplate(
  recipientName: string,
  requestTitle: string,
  status: string,
  adminNotes?: string
): string {
  const statusColor =
    status === "APPROVED"
      ? "#2E7D32"
      : status === "REJECTED"
      ? "#c0392b"
      : "#F9A825";
  const statusLabel =
    status === "APPROVED"
      ? "Approved"
      : status === "REJECTED"
      ? "Rejected"
      : "Under Consideration";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Poppins', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: #1B5E20; padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0; color: #a5d6a7; }
        .body { padding: 30px; }
        .status-badge { display: inline-block; background: ${statusColor}; color: white; padding: 8px 20px; border-radius: 4px; font-weight: bold; margin: 15px 0; }
        .notes { background: #f5f5f5; border-left: 4px solid ${statusColor}; padding: 15px; margin: 15px 0; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .accent { color: #F9A825; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LeelRa App</h1>
          <p>Ainamoi Constituency Activity Management</p>
        </div>
        <div class="body">
          <h2>Hello ${recipientName},</h2>
          <p>Your activity request <strong>"${requestTitle}"</strong> has been reviewed.</p>
          <div class="status-badge">${statusLabel}</div>
          ${adminNotes ? `<div class="notes"><strong>Admin Notes:</strong><br>${adminNotes}</div>` : ""}
          <p>Log in to <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="accent">LeelRa App</a> to view the full details.</p>
        </div>
        <div class="footer">
          <p>LeelRa App &bull; Wakili Geoffrey Langat &bull; Ainamoi Constituency</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function passwordResetEmailTemplate(
  recipientName: string,
  resetUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Poppins', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: #1B5E20; padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .body { padding: 30px; }
        .button { display: inline-block; background: #2E7D32; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LeelRa App</h1>
          <p>Password Reset Request</p>
        </div>
        <div class="body">
          <h2>Hello ${recipientName},</h2>
          <p>You requested a password reset. Click the button below to set a new password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p><strong>This link expires in 1 hour.</strong></p>
          <p>If you did not request this, please ignore this email. Your password will not change.</p>
        </div>
        <div class="footer">
          <p>LeelRa App &bull; Wakili Geoffrey Langat &bull; Ainamoi Constituency</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function eventReminderEmailTemplate(
  recipientName: string,
  eventTitle: string,
  eventDate: string,
  eventTime: string,
  venue: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Poppins', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: #1B5E20; padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .body { padding: 30px; }
        .event-card { background: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .event-detail { display: flex; gap: 10px; margin: 8px 0; color: #333; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LeelRa App</h1>
          <p>Event Reminder — Tomorrow</p>
        </div>
        <div class="body">
          <h2>Hello ${recipientName},</h2>
          <p>This is a reminder about an upcoming event tomorrow:</p>
          <div class="event-card">
            <h3>${eventTitle}</h3>
            <div class="event-detail">📅 <span>${eventDate}</span></div>
            <div class="event-detail">🕐 <span>${eventTime}</span></div>
            <div class="event-detail">📍 <span>${venue}</span></div>
          </div>
          <p>Log in to <a href="${process.env.NEXT_PUBLIC_APP_URL}">LeelRa App</a> to view full details.</p>
        </div>
        <div class="footer">
          <p>LeelRa App &bull; Wakili Geoffrey Langat &bull; Ainamoi Constituency</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
