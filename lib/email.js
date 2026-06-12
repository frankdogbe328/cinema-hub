const nodemailer = require('nodemailer');

let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

const FROM = process.env.EMAIL_FROM || 'CinemaHub <noreply@cinemahub.com>';

async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.log(`📧 [dev] email to ${to}: ${subject}`);
    return false;
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
    return true;
  } catch (err) {
    console.warn(`⚠️  Email send failed: ${err.message}`);
    return false;
  }
}

async function sendOtp(email, otp) {
  return sendEmail({
    to: email,
    subject: 'CinemaHub — Your verification code',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0f;color:#fff;padding:32px;border-radius:12px">
        <h2 style="color:#e50914;margin:0 0 8px">CinemaHub</h2>
        <p>Use this code to verify your email:</p>
        <p style="font-size:32px;letter-spacing:8px;font-weight:800">${otp}</p>
        <p style="color:#9aa">This code expires in 10 minutes. If you didn't request it, ignore this email.</p>
      </div>
    `,
  });
}

async function sendPasswordReset(email, resetUrl) {
  return sendEmail({
    to: email,
    subject: 'CinemaHub — Reset your password',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0f;color:#fff;padding:32px;border-radius:12px">
        <h2 style="color:#e50914;margin:0 0 8px">CinemaHub</h2>
        <p>Click the link below to reset your password. It expires in 1 hour.</p>
        <p><a href="${resetUrl}" style="display:inline-block;background:#e50914;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Reset password</a></p>
        <p style="color:#9aa;font-size:12px">Or copy: ${resetUrl}</p>
      </div>
    `,
  });
}

module.exports = { sendEmail, sendOtp, sendPasswordReset };
