import nodemailer from "nodemailer";

export async function sendResetEmail(email: string, resetLink: string) {
  const transporter = nodemailer.createTransport({
    service: "Gmail", 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  const mailOptions = {
    from: `"IT Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Đặt lại mật khẩu",
    html: `
      <p>Xin chào,</p>
      <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn.</p>
      <p>Vui lòng nhấn vào link dưới đây để đặt lại mật khẩu:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Link này sẽ hết hạn trong vòng 30 phút.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
