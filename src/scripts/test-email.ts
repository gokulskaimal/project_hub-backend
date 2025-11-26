import dotenv from "dotenv";
import path from "path";
import nodemailer from "nodemailer";

// Load environment variables from .env file
const envPath = path.resolve(__dirname, "../../.env");
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

async function testEmail() {
  console.log("--- Email Configuration Test ---");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("SMTP_SECURE:", process.env.SMTP_SECURE);
  console.log("FROM_EMAIL:", process.env.FROM_EMAIL);

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.error(
      "❌ Missing SMTP configuration. Please check your .env file.",
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  try {
    console.log("Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP Connection verified successfully!");

    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || '"Test" <test@example.com>',
      to: user, // Send to self for testing
      subject: "Test Email from Project Hub Debugger",
      text: "If you receive this, your email configuration is working correctly!",
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
}

testEmail();
