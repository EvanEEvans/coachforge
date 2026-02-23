import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "hello@coachforge.pro";

export async function sendFollowUpEmail(
  to: string,
  clientFirstName: string,
  coachName: string,
  emailBody: string,
  portalUrl: string
) {
  return resend.emails.send({
    from: `${coachName} via CoachForge <${FROM}>`,
    to,
    subject: `Your session recap — ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
    html: `
      <div style="font-family: 'Outfit', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #1C1917;">
        <p style="font-size: 16px;">Hi ${clientFirstName},</p>
        <div style="font-size: 15px; line-height: 1.8; color: #57534E; white-space: pre-wrap;">${emailBody}</div>
        <div style="margin-top: 24px; padding: 20px; background: #E6F4F4; border-radius: 12px;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #0D7377;">Your Client Portal</p>
          <p style="margin: 0 0 12px; font-size: 14px; color: #57534E;">Track your progress, review action items, and see your journey.</p>
          <a href="${portalUrl}" style="display: inline-block; padding: 10px 24px; background: #0D7377; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Open Your Portal</a>
        </div>
        <p style="margin-top: 32px; font-size: 13px; color: #A8A29E;">Sent via CoachForge · <a href="https://coachforge.pro" style="color: #0D7377;">coachforge.pro</a></p>
      </div>
    `,
  });
}

export async function sendNudgeEmail(
  to: string,
  clientFirstName: string,
  coachName: string,
  message: string
) {
  return resend.emails.send({
    from: `${coachName} via CoachForge <${FROM}>`,
    to,
    subject: `Quick check-in from ${coachName}`,
    html: `
      <div style="font-family: 'Outfit', -apple-system, sans-serif; max-width: 500px; margin: 0 auto; color: #1C1917;">
        <p style="font-size: 16px;">Hi ${clientFirstName},</p>
        <p style="font-size: 15px; line-height: 1.8; color: #57534E;">${message}</p>
        <p style="margin-top: 24px; font-size: 13px; color: #A8A29E;">— ${coachName}</p>
      </div>
    `,
  });
}

export async function sendClientInviteEmail(
  to: string,
  clientFirstName: string,
  coachName: string,
  portalUrl: string
) {
  return resend.emails.send({
    from: `${coachName} via CoachForge <${FROM}>`,
    to,
    subject: `${coachName} has set up your coaching portal`,
    html: `
      <div style="font-family: 'Outfit', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #1C1917;">
        <p style="font-size: 16px;">Hi ${clientFirstName},</p>
        <p style="font-size: 15px; line-height: 1.8; color: #57534E;">
          ${coachName} has set up a personal coaching portal for you. Here you'll find your session recaps, action items, and progress tracking all in one place.
        </p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${portalUrl}" style="display: inline-block; padding: 14px 32px; background: #0D7377; color: white; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">Access Your Portal</a>
        </div>
        <p style="font-size: 13px; color: #A8A29E;">Powered by CoachForge · <a href="https://coachforge.pro" style="color: #0D7377;">coachforge.pro</a></p>
      </div>
    `,
  });
}
