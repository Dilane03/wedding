const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendInvitationEmail(guest) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: guest.email,
    subject: '🎉 Invitation au mariage',
    html: `<p>Bonjour ${guest.name},</p><p>Vous êtes invité à notre mariage !</p>`
  });
}

module.exports = { sendInvitationEmail };
