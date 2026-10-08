/**
 * Travel Planet (Voyage8) — Transactional Email Templates
 * 
 * Clean, responsive, accessible, and high-deliverability email templates
 * designed for Travel Planet India & Global SaaS Operations.
 */

export interface EmailTemplateBaseOptions {
  name?: string;
  email: string;
  tenantName?: string;
  supportUrl?: string;
  brandPrimaryColor?: string;
  locale?: string;
}

export interface VerificationEmailTemplateOptions extends EmailTemplateBaseOptions {
  verificationUrl: string;
}

export interface PasswordResetEmailTemplateOptions extends EmailTemplateBaseOptions {
  resetUrl: string;
}

export interface WelcomeEmailTemplateOptions extends EmailTemplateBaseOptions {
  loginUrl?: string;
}

export interface SecurityAlertTemplateOptions extends EmailTemplateBaseOptions {
  alertType: 'NEW_LOGIN' | 'PASSWORD_CHANGED' | 'SUSPICIOUS_ACTIVITY' | 'PERMISSION_ELEVATION';
  ipAddress?: string;
  userAgent?: string;
  timestamp?: string;
  actionUrl?: string;
}

export interface EmailChangedTemplateOptions extends EmailTemplateBaseOptions {
  oldEmail: string;
  newEmail: string;
}

// Brand defaults
const BRAND_NAME = 'Travel Planet';
const BRAND_TAGLINE = 'Intelligent Travel Management & Journey OS';
const BRAND_PRIMARY_COLOR = '#0284c7'; // Voyage8 Sky
const DEFAULT_SUPPORT_URL = 'https://travelplanet.tours/support';

/**
 * Base email layout wrapper with modern typography and email client safety
 */
function wrapBaseTemplate(title: string, bodyContent: string, options: EmailTemplateBaseOptions): { html: string; text: string } {
  const brandColor = options.brandPrimaryColor || BRAND_PRIMARY_COLOR;
  const supportUrl = options.supportUrl || DEFAULT_SUPPORT_URL;
  const tenant = options.tenantName ? ` · ${options.tenantName}` : '';

  const html = `
<!DOCTYPE html>
<html lang="${options.locale || 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 24px 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); text-align: left; border-bottom: 3px solid ${brandColor};">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">✈️ ${BRAND_NAME}</span>
                    <span style="font-size: 13px; color: #94a3b8; margin-left: 8px;">${tenant}</span>
                    <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px; letter-spacing: 0.5px; text-transform: uppercase;">${BRAND_TAGLINE}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; text-align: left;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0 0 8px 0;">
                Need assistance with your journeys or account? <a href="${supportUrl}" style="color: ${brandColor}; text-decoration: underline;">Contact 24/7 Travel Support</a>
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                © ${new Date().getFullYear()} Travel Planet OS · Built on H8 Cognitive Architecture · All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Strip tags for plain text fallback
  const text = bodyContent
    .replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*?>(.*?)<\/a>/gi, '$3: $2')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { html, text };
}

/**
 * Verification Email Template
 */
export function renderVerificationEmail(options: VerificationEmailTemplateOptions): { subject: string; html: string; text: string } {
  const greeting = options.name ? `Hello ${options.name},` : 'Hello Traveler,';
  const brandColor = options.brandPrimaryColor || BRAND_PRIMARY_COLOR;

  const bodyContent = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">Verify your email address</h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      ${greeting}
    </p>
    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      Welcome to Travel Planet. To activate your account, access personalized itineraries, and safeguard your bookings, please confirm your email address below.
    </p>
    <div style="margin: 32px 0; text-align: center;">
      <a href="${options.verificationUrl}" style="display: inline-block; padding: 14px 28px; background-color: ${brandColor}; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(2, 132, 199, 0.25);">
        Verify Email Address
      </a>
    </div>
    <p style="margin: 24px 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
      If the button above does not work, copy and paste this link into your browser:
    </p>
    <p style="margin: 0 0 24px 0; font-size: 12px; color: #0284c7; word-break: break-all;">
      <a href="${options.verificationUrl}" style="color: #0284c7; text-decoration: underline;">${options.verificationUrl}</a>
    </p>
    <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
      This verification link is secure and will expire in 24 hours. If you did not create a Travel Planet account, you can safely disregard this message.
    </p>
  `;

  const { html, text } = wrapBaseTemplate('Verify your email — Travel Planet', bodyContent, options);
  return {
    subject: 'Verify your email address — Travel Planet',
    html,
    text: `Verify your email: ${options.verificationUrl}\n\n${text}`,
  };
}

/**
 * Password Reset Email Template
 */
export function renderPasswordResetEmail(options: PasswordResetEmailTemplateOptions): { subject: string; html: string; text: string } {
  const greeting = options.name ? `Hello ${options.name},` : 'Hello,';
  const brandColor = options.brandPrimaryColor || BRAND_PRIMARY_COLOR;

  const bodyContent = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">Reset your Travel Planet password</h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      ${greeting}
    </p>
    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      We received a request to reset the password associated with your Travel Planet account (<strong>${options.email}</strong>). Click the button below to choose a new password.
    </p>
    <div style="margin: 32px 0; text-align: center;">
      <a href="${options.resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #0f172a; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(15, 23, 42, 0.25);">
        Reset Password
      </a>
    </div>
    <p style="margin: 24px 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
      If the button above does not work, copy and paste this link into your browser:
    </p>
    <p style="margin: 0 0 24px 0; font-size: 12px; color: #0284c7; word-break: break-all;">
      <a href="${options.resetUrl}" style="color: #0284c7; text-decoration: underline;">${options.resetUrl}</a>
    </p>
    <div style="margin-top: 24px; padding: 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
      <p style="margin: 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
        <strong>Security notice:</strong> This link expires in 1 hour. If you did not request a password reset, your credentials are still secure; please disregard this email.
      </p>
    </div>
  `;

  const { html, text } = wrapBaseTemplate('Password Reset Request — Travel Planet', bodyContent, options);
  return {
    subject: 'Reset your password — Travel Planet',
    html,
    text: `Reset your password: ${options.resetUrl}\n\n${text}`,
  };
}

/**
 * Welcome Email Template
 */
export function renderWelcomeEmail(options: WelcomeEmailTemplateOptions): { subject: string; html: string; text: string } {
  const greeting = options.name ? `Welcome aboard, ${options.name}!` : 'Welcome aboard!';
  const brandColor = options.brandPrimaryColor || BRAND_PRIMARY_COLOR;
  const loginUrl = options.loginUrl || 'https://travelplanet.tours/login';

  const bodyContent = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">${greeting}</h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      Your Travel Planet account is confirmed and ready. You now have full access to intelligent journey planning, seamless booking management, and verified travel documents.
    </p>
    <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #334155;">
      <li><strong>My Travel Space:</strong> Real-time journey countdowns, e-tickets, and live status.</li>
      <li><strong>Digital Document Vault:</strong> Secure storage for passports, visas, and vouchers.</li>
      <li><strong>AI Travel Assistant:</strong> 24/7 intelligent suggestions and dynamic itinerary customization.</li>
    </ul>
    <div style="margin: 32px 0; text-align: center;">
      <a href="${loginUrl}" style="display: inline-block; padding: 14px 28px; background-color: ${brandColor}; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px;">
        Go to Your Travel Dashboard
      </a>
    </div>
  `;

  const { html, text } = wrapBaseTemplate('Welcome to Travel Planet', bodyContent, options);
  return {
    subject: 'Welcome to Travel Planet — Your Journey Begins',
    html,
    text,
  };
}

/**
 * Security Alert Template
 */
export function renderSecurityAlertEmail(options: SecurityAlertTemplateOptions): { subject: string; html: string; text: string } {
  const alertTitles = {
    NEW_LOGIN: 'New login detected on your account',
    PASSWORD_CHANGED: 'Your account password was updated',
    SUSPICIOUS_ACTIVITY: 'Unusual access attempt detected',
    PERMISSION_ELEVATION: 'Administrative privileges updated',
  };

  const title = alertTitles[options.alertType] || 'Security notification';
  const timestamp = options.timestamp || new Date().toUTCString();

  const bodyContent = `
    <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #b91c1c;">⚠️ ${title}</h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      This is a security alert regarding your Travel Planet account (<strong>${options.email}</strong>).
    </p>
    <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px; font-size: 13px; line-height: 1.8; color: #334155;">
      <div><strong>Event:</strong> ${title}</div>
      <div><strong>Time:</strong> ${timestamp}</div>
      ${options.ipAddress ? `<div><strong>IP Address:</strong> ${options.ipAddress}</div>` : ''}
      ${options.userAgent ? `<div><strong>Device / Browser:</strong> ${options.userAgent}</div>` : ''}
    </div>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #334155;">
      If you authorized this activity, no further action is required. If this was not you, please secure your account immediately.
    </p>
    ${options.actionUrl ? `
    <div style="margin: 24px 0; text-align: center;">
      <a href="${options.actionUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;">
        Secure Account Now
      </a>
    </div>` : ''}
  `;

  const { html, text } = wrapBaseTemplate(`Security Alert — Travel Planet`, bodyContent, options);
  return {
    subject: `Security Alert: ${title} — Travel Planet`,
    html,
    text,
  };
}

/**
 * Email Changed Template
 */
export function renderEmailChangedEmail(options: EmailChangedTemplateOptions): { subject: string; html: string; text: string } {
  const bodyContent = `
    <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">Your email address has been changed</h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      The primary email address for your Travel Planet account was recently updated from <strong>${options.oldEmail}</strong> to <strong>${options.newEmail}</strong>.
    </p>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #64748b;">
      If you performed this change, you may safely ignore this email. If you did not request this update, please contact our support team immediately.
    </p>
  `;

  const { html, text } = wrapBaseTemplate('Email Address Updated — Travel Planet', bodyContent, options);
  return {
    subject: 'Your email address has been updated — Travel Planet',
    html,
    text,
  };
}
