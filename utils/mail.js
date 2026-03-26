const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

async function sendVerifyEmail(to, token) {
  const link = `http://localhost:5173/verify-email?token=${token}`
  await transporter.sendMail({
    from: `"Team2 Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Xác minh email của bạn',
    html: `<h2>Xác minh tài khoản</h2><p>Vui lòng click vào link để xác minh:</p><a href="${link}">${link}</a>`,
  })
}

// ADD THIS NEW FUNCTION
async function sendResetPasswordEmail(to, token) {
  const link = `http://localhost:5173/reset-password?token=${token}`
  await transporter.sendMail({
    from: `"Team2 Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Đặt lại mật khẩu của bạn',
    html: `
      <h2>Yêu cầu đặt lại mật khẩu</h2>
      <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
      <p>Vui lòng click vào link bên dưới để thực hiện (Link có hiệu lực trong 15 phút):</p>
      <a href="${link}" style="background: #E2DFD2; padding: 10px; text-decoration: none; color: black; border-radius: 5px;">Đặt lại mật khẩu</a>
      <p>Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
    `,
  })
}

module.exports = { sendVerifyEmail, sendResetPasswordEmail }