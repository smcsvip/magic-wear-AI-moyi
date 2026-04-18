// 邮件发送工具函数
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// 发送欢迎邮件
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: userEmail,
    subject: '你好呀，我是你魔衣小管家 💌',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Hi ${userName}，欢迎来到魔衣 MagicWear！</h2>
        <p style="color: #666; line-height: 1.6;">从现在起，我就是你的专属小管家了。</p>
        <p style="color: #666; line-height: 1.6;">使用魔衣过程中，有问题随时沟通，微信：smc433。</p>
        <p style="color: #666; line-height: 1.6;">明天早上我会给你发一条早安消息，记得查收哦。</p>
        <br/>
        <p style="color: #999; font-size: 14px;">—— 你的魔衣 MagicWear</p>
      </div>
    `,
  })
}
