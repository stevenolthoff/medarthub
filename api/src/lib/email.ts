import nodemailer from 'nodemailer';
import config from '../../config/config';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpPort === 465,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPassword,
  },
});

export const sendEmail = async (options: MailOptions) => {
  if (!config.smtpHost || !config.smtpUser || !config.smtpPassword) {
    console.error('❌ Cannot send email: SMTP not configured.');
    if (config.nodeEnv === 'development') {
      console.log('--- DEV EMAIL ---');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log('--- HTML ---');
      console.log(options.html);
      console.log('-----------------');
      return { success: true, messageId: 'dev-mode-email' };
    }
    throw new Error('Email service is not configured.');
  }

  const mailOptions = { from: config.emailFrom, ...options };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw new Error('Failed to send email.');
  }
};

export const sendInviteEmail = async (to: string, name: string, inviteCode: string) => {
  const subject = 'Your Invitation to Medical Artists';
  const signupUrl = new URL('/signup', config.webBaseUrl);
  signupUrl.searchParams.set('code', inviteCode);
  const text = `Hi ${name},\n\nYour request for early access to Medical Artists has been approved!\n\nTo create your account, use the invite code: ${inviteCode}\n\nOr click this link to sign up:\n${signupUrl}\n\nThis invite is valid for 7 days.\n\nWelcome aboard,\nThe Medical Artists Team`;
  const html = `<p>Hi ${name},</p><p>Your request for early access to Medical Artists has been approved!</p><p>To create your account, use the invite code: <strong>${inviteCode}</strong></p><p>Or click the button below:</p><p><a href="${signupUrl.toString()}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Create Your Account</a></p><p>This invite is valid for 7 days.</p><p>Welcome aboard,<br>The Medical Artists Team</p>`;

  return sendEmail({ to, subject, text, html });
};

