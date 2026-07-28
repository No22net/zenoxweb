const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM ?? "noreply@zenoxweb.ir";

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`[DEV-EMAIL] To: ${params.to}\nSubject: ${params.subject}\n${params.html}`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("Email send failed", error);
    return false;
  }
}

export function htmlTemplate(body: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    body { font-family: Vazirmatn, sans-serif; direction: rtl; line-height: 1.6; color: #334155; }
    .container { max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; }
    .content { background: white; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; }
    .header { border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { color: #4f46e5; font-size: 24px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
    .btn { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px; }
    .alert { background: #fef3c7; border: 1px solid #fcd34d; color: #92400e; padding: 12px; border-radius: 8px; margin: 15px 0; }
    .success { background: #dcfce7; border: 1px solid #bbf7d0; color: #166534; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      ${body}
      <div class="footer">
        <p>© 2024 ZeNOxWeb | این ایمیل برای شما ارسال شده است.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
