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

  return transporter.sendMail(message, (err, info) => {
    if (err) { 
      console.error(err);
      return null;
    }
    else {
      return info.accepted;
    }
  })
};
