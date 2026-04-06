const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  const transport = getTransporter();
  const info = await transport.sendMail({
    from: process.env.EMAIL_FROM || '"Financial Habit Builder" <noreply@financialhabitbuilder.com>',
    to,
    subject,
    html,
    attachments,
  });
  return info;
};

module.exports = { sendEmail };
