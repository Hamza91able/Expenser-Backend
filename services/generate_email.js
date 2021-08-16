const nodemailer = require("nodemailer");

var smtpConfiq = {
  service: "Gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

module.exports = {
  generateEmail: async (email, subject, html) => {
    try {
      const transporter = nodemailer.createTransport(smtpConfiq);
      const mailOptions = {
        from: prcess.env.SMPT_FROM,
        to: email,
        subject,
        text: "",
        html,
      };
      await transporter.sendMail(mailOptions);
      return true;
    } catch (err) {
      return true;
    }
  },
};
