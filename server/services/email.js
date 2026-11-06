import nodemailer from "nodemailer";
import { config } from "../config/env.js";

function getResetUrl(token) {
  const clientOrigin = config.clientOrigins[0] || "http://localhost:5173";
  const resetUrl = new URL("/reset-password", clientOrigin);
  resetUrl.searchParams.set("token", token);
  return resetUrl.toString();
}

export async function sendPasswordResetEmail(email, token) {
  const resetUrl = getResetUrl(token);
  const smtpSettings = [
    config.smtpHost,
    config.smtpUser,
    config.smtpPassword,
    config.smtpFrom,
  ];

  if (smtpSettings.every((value) => !value)) {
    if (config.nodeEnv === "production") {
      throw new Error("SMTP must be configured to send student password reset emails.");
    }
    console.info(`Development-only student password reset link: ${resetUrl}`);
    return;
  }

  if (smtpSettings.some((value) => !value)) {
    throw new Error("Configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM together.");
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  });

  await transporter.sendMail({
    from: config.smtpFrom,
    to: email,
    subject: "Reset your LabSim student password",
    text: `Use this one-time link to reset your LabSim password. It expires in 30 minutes:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>Use this one-time link to reset your LabSim password. It expires in 30 minutes:</p><p><a href="${resetUrl}">Reset student password</a></p><p>If you did not request this, you can ignore this email.</p>`,
  });
}
