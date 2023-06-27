const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: String(process.env.STAMP_EXPRESS_SMTP_HOST) || 'localhost',
    port: 587,
    secure: Boolean(
      Number(process.env.STAMP_EXPRESS_SMTP_SECURE)
    ),
    auth: {
      user: String(process.env.STAMP_EXPRESS_SMTP_USER),
      pass: String(process.env.STAMP_EXPRESS_SMTP_PASS)
    },
    tls: {
      ciphers: 'DEFAULT@SECLEVEL=0',
      rejectUnauthorized: Boolean(
        Number(process.env.STAMP_EXPRESS_SMTP_REJECT_UNAUTH)
      )
    }
  });

exports.sendCreds = async (email, username, password) => {
  const message = {
    from: String(process.env.STAMP_EXPRESS_SMTP_FROM),
    to: email,
    subject: "You have reseted your password",
    text: `login: ${username}\npassword: ${password}`
  };

  return await transporter.sendMail(message)
    .then(info => info.messageId)
    .catch(err => {console.error(err); return null;})
};
