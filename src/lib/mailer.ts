import nodemailer from "nodemailer";

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
  from: string;
}

export function getSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST || "";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || "";
  const secure =
    process.env.SMTP_SECURE === "true" ||
    process.env.SMTP_SECURE === "1" ||
    port === 465;
  const from =
    process.env.SMTP_FROM || '"Arabiyyah Platform" <no-reply@arabiyyah.org>';

  return { host, port, user, pass, secure, from };
}

export function isSmtpConfigured(): boolean {
  const config = getSmtpConfig();
  return Boolean(config.host && (config.pass || config.user));
}

export async function sendPasswordResetOtpEmail({
  to,
  name,
  otp,
  expiresInMinutes = 15,
}: {
  to: string;
  name: string;
  otp: string;
  expiresInMinutes?: number;
}): Promise<{
  sent: boolean;
  devOtp?: string;
  error?: string;
  message: string;
}> {
  const config = getSmtpConfig();

  if (!isSmtpConfigured()) {
    console.warn(
      `⚠️ [Mailer] SMTP is not configured. (SMTP_HOST / SMTP_PASSWORD missing).`
    );
    console.warn(`🔑 [Mailer] Reset OTP for ${to} (${name}): ${otp}`);

    return {
      sent: false,
      devOtp: otp,
      message:
        "SMTP settings are not configured yet. The verification code has been generated in development mode.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
    });

    const subject = `Your Arabiyyah Password Reset Code: ${otp}`;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #047857 0%, #0f766e 100%); padding: 32px 28px; text-align: center;">
              <div style="font-size: 26px; color: #a7f3d0; font-weight: bold; margin-bottom: 6px; font-family: 'Amiri', serif;">
                العربية • Arabiyyah
              </div>
              <div style="color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;">
                Administrative Security Portal
              </div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 30px;">
              <p style="font-size: 15px; line-height: 24px; color: #334155; margin: 0 0 16px 0;">
                Assalamu 'alaykum <strong>${name}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 24px 0;">
                We received a request to reset your password for your administrator account (<strong>${to}</strong>). Use the one-time verification code below to authorize the change:
              </p>

              <!-- OTP Code Box -->
              <div style="text-align: center; margin: 28px 0;">
                <div style="display: inline-block; background-color: #f0fdf4; border: 2px dashed #059669; border-radius: 16px; padding: 18px 36px;">
                  <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #047857; display: inline-block;">
                    ${otp}
                  </span>
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 10px;">
                  Valid for <strong>${expiresInMinutes} minutes</strong>
                </div>
              </div>

              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 14px 18px; margin: 24px 0;">
                <p style="margin: 0; font-size: 12px; line-height: 18px; color: #92400e;">
                  <strong>Security Reminder:</strong> Never share this code with anyone. Arabiyyah administrators will never ask for your one-time verification code.
                </p>
              </div>

              <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 0;">
                If you did not initiate this request, no action is needed and your account remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 30px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 18px;">
              Arabiyyah Platform • Classical Arabic Learning & Scholastic Archive<br>
              Automated authentication message. Please do not reply directly to this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    const text = `
Arabiyyah Platform (العربية) - Password Reset Code
===================================================

Hello ${name},

You requested a password reset for your administrator account (${to}).

Your One-Time Verification Code (OTP) is:
>>> ${otp} <<<

This code will expire in ${expiresInMinutes} minutes.

If you did not request a password reset, please ignore this email.

--
Arabiyyah Platform Security Portal
`;

    await transporter.sendMail({
      from: config.from,
      to,
      subject,
      text,
      html,
    });

    console.log(`✅ [Mailer] Password reset OTP sent to ${to}`);
    return {
      sent: true,
      message: `A 6-digit verification code has been dispatched to ${to}.`,
    };
  } catch (err: unknown) {
    console.error("❌ [Mailer] Failed to send email via SMTP:", err);
    return {
      sent: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to send email through SMTP.",
      message:
        "SMTP email delivery encountered an error. Please verify your SMTP host, port, and credentials in .env.",
    };
  }
}
