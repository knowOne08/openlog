// Nodemailer SMTP mail utility
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendUserWelcomeEmail({ to, name, tempPassword, loginUrl }) {
    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: 'Your OpenLog Account Credentials',
        html: `<p>Hello ${name},</p>
      <p>Your OpenLog account has been created. Please use the following credentials to log in for the first time:</p>
      <ul>
        <li><b>Email:</b> ${to}</li>
        <li><b>Temporary Password:</b> ${tempPassword}</li>
      </ul>
      <p>Login here: <a href="${loginUrl}">${loginUrl}</a></p>
      <p>For security, please change your password after logging in.</p>
      <p>Best regards,<br/>OpenLog Team</p>`
    };
    await transporter.sendMail(mailOptions);
}
