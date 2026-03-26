const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOTP(email, code) {
  const mailOptions = {
    from: `"Team2 Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Mã xác thực tài khoản - Team2 Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">Xác thực tài khoản</h2>
        <p>Chào bạn,</p>
        <p>Bạn đã yêu cầu mã xác thực để thực hiện ứng tuyển công việc trên Team2 Platform. Dưới đây là mã OTP của bạn:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #1f2937;">${code}</span>
        </div>
        <p>Mã này có hiệu lực trong vòng <b>10 phút</b>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        <hr style="border: 0; border-top: 1px solid #e1e1e1; margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280; text-align: center;">Đây là email tự động, vui lòng không phản hồi.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('CRITICAL: Email send failed!');
    console.error('Error details:', error.message);
    if (error.code === 'EAUTH') {
      console.error('CAUSE: Gmail login failed. You MUST use an "App Password", not your normal password.');
    }
    throw new Error(`Lỗi gửi mail: ${error.message}`);
  }
}

module.exports = {
  sendOTP,
};
