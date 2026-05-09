import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, subject, body } = await req.json();

    const adminHtml = `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#2563eb;padding:32px 40px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">📬 新しいお問い合わせ</h1>
            <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px;">SHARE Quest お問い合わせフォームより</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">お名前</p>
                <p style="margin:4px 0 0;font-size:15px;color:#1e293b;font-weight:600;">${name}</p>
              </td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">メールアドレス</p>
                <p style="margin:4px 0 0;font-size:15px;color:#2563eb;">${email}</p>
              </td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">件名</p>
                <p style="margin:4px 0 0;font-size:15px;color:#1e293b;font-weight:600;">${subject}</p>
              </td></tr>
              <tr><td style="padding:10px 0;">
                <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">内容</p>
                <p style="margin:8px 0 0;font-size:15px;color:#334155;line-height:1.7;white-space:pre-wrap;">${body}</p>
              </td></tr>
            </table>
            <div style="margin-top:28px;">
              <a href="mailto:${email}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">このメールに返信する</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">© 2026 SHARE Quest — このメールはお問い合わせフォームから自動送信されました</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "SHARE Quest <onboarding@resend.dev>",
        to: "share.quest.official@gmail.com",
        reply_to: email,
        subject: `【お問い合わせ】${subject}`,
        html: adminHtml,
      }),
    });

    const result = await res.json();
    console.log("Resend response:", JSON.stringify(result));

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
