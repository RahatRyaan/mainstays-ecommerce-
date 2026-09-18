import nodemailer, { Transporter } from 'nodemailer';
import logger from '../common/logger';

interface EmailResult {
  success: boolean;
  messageId?: string | undefined;
  previewUrl?: string | undefined;
  error?: string | undefined;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isTestAccount = false;

  private async getTransporter(): Promise<Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (host && user && pass) {
      logger.info(`Configuring SMTP mail transport for ${host}:${port} (${user})`);
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass
        }
      });
      this.isTestAccount = false;
      return this.transporter;
    }

    // Fallback to Ethereal Sandbox for Development & Instant Verification
    try {
      logger.info('No custom SMTP configured. Creating Ethereal Test Account for genuine email verification preview...');
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      this.isTestAccount = true;
      logger.info(`Ethereal test inbox initialized for: ${testAccount.user}`);
      return this.transporter;
    } catch (err) {
      logger.warn('Failed to create Ethereal test account, using JSON/stream transport fallback:', err);
      this.transporter = nodemailer.createTransport({
        jsonTransport: true
      });
      return this.transporter;
    }
  }

  /**
   * Send a branded Password Reset OTP Email
   */
  async sendPasswordResetEmail(to: string, name: string, code: string): Promise<EmailResult> {
    try {
      const transporter = await this.getTransporter();
      const from = process.env.SMTP_FROM || '"MAINSTAYS Atelier" <no-reply@mainstays.shop>';
      const appName = 'MAINSTAYS Atelier';

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF7F0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1B1612; }
    .container { max-width: 580px; margin: 40px auto; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E8E0D2; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    .header { background-color: #1B1612; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #FAF7F0; font-size: 22px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; }
    .header p { margin: 6px 0 0 0; color: #D94E34; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; font-weight: 700; }
    .body { padding: 36px 32px; }
    .greeting { font-size: 18px; font-weight: 600; color: #1B1612; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #5C554D; margin-bottom: 24px; }
    .code-container { background-color: #FFFDF9; border: 2px dashed #D94E34; border-radius: 10px; padding: 24px; text-align: center; margin: 28px 0; }
    .code-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #8C827A; margin-bottom: 8px; }
    .code-digits { font-size: 36px; font-weight: 800; letter-spacing: 0.35em; color: #D94E34; font-family: monospace; }
    .expiry { font-size: 12px; color: #8C827A; margin-top: 10px; }
    .security-note { background-color: #FAF7F0; border-left: 4px solid #D94E34; padding: 14px 16px; font-size: 12px; color: #5C554D; border-radius: 0 6px 6px 0; margin-top: 24px; }
    .footer { background-color: #FAF7F0; border-top: 1px solid #E8E0D2; padding: 20px 24px; text-align: center; font-size: 11px; color: #8C827A; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${appName}</h1>
      <p>Secure Member Authentication</p>
    </div>
    <div class="body">
      <div class="greeting">Hello ${name || 'Valued Member'},</div>
      <p class="text">
        We received a request to reset the password for your <strong>${appName}</strong> account (<code>${to}</code>).
        Please use the 6-digit verification security code below to complete your password update.
      </p>
      
      <div class="code-container">
        <div class="code-label">Verification Security Code</div>
        <div class="code-digits">${code}</div>
        <div class="expiry">Expires in <strong>15 minutes</strong> • Single use only</div>
      </div>

      <p class="text">
        If you did not request this password reset, please ignore this email or contact support immediately. Your account remains completely secure.
      </p>

      <div class="security-note">
        <strong>Security Tip:</strong> Never share your verification code with anyone. MAINSTAYS personnel will never ask for your code or password.
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} ${appName}. Handcrafted goods & artisan community.<br>
      This is an automated system email sent to ${to}.
    </div>
  </div>
</body>
</html>
      `;

      const text = `Hello ${name || 'Valued Member'},\n\nYour ${appName} password reset verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.`;

      const info = await transporter.sendMail({
        from,
        to,
        subject: `[${appName}] ${code} is your password reset verification code`,
        text,
        html
      });

      let previewUrl: string | undefined;
      if (this.isTestAccount && info) {
        previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      }

      logger.info(`Password reset email successfully sent to ${to} (Message ID: ${info.messageId})`);
      if (previewUrl) {
        logger.info(`Preview real email inbox: ${previewUrl}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl
      };
    } catch (err: any) {
      logger.error(`Error sending password reset email to ${to}:`, err);
      return {
        success: false,
        error: err.message || 'Failed to dispatch email'
      };
    }
  }

  /**
   * Send a branded Welcome Email upon registration
   */
  async sendWelcomeEmail(to: string, name: string, role: string = 'customer'): Promise<EmailResult> {
    try {
      const transporter = await this.getTransporter();
      const from = process.env.SMTP_FROM || '"MAINSTAYS Atelier" <no-reply@mainstays.shop>';
      const appName = 'MAINSTAYS Atelier';
      const isVendor = role === 'vendor';

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to ${appName}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF7F0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1B1612; }
    .container { max-width: 580px; margin: 40px auto; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E8E0D2; overflow: hidden; }
    .header { background-color: #1B1612; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #FAF7F0; font-size: 22px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; }
    .body { padding: 36px 32px; }
    .greeting { font-size: 18px; font-weight: 600; color: #1B1612; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #5C554D; margin-bottom: 20px; }
    .footer { background-color: #FAF7F0; border-top: 1px solid #E8E0D2; padding: 20px 24px; text-align: center; font-size: 11px; color: #8C827A; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${appName}</h1>
    </div>
    <div class="body">
      <div class="greeting">Welcome to our community, ${name}!</div>
      <p class="text">
        ${isVendor 
          ? 'Your Artisan Maker workshop account has been successfully registered. You can now access your studio dashboard, publish your unique crafted collections, and manage global customer orders.' 
          : 'Your Shopper account has been created. Discover small-batch handmade craft collections, connect directly with independent makers, and enjoy verified secure delivery.'}
      </p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} ${appName} • Sent to ${to}
    </div>
  </div>
</body>
</html>
      `;

      const info = await transporter.sendMail({
        from,
        to,
        subject: `Welcome to ${appName}, ${name}!`,
        text: `Welcome to ${appName}, ${name}! Your ${role} account is now active.`,
        html
      });

      let previewUrl: string | undefined;
      if (this.isTestAccount && info) {
        previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl
      };
    } catch (err: any) {
      logger.error(`Error sending welcome email to ${to}:`, err);
      return {
        success: false,
        error: err.message
      };
    }
  }
}

export const emailService = new EmailService();
