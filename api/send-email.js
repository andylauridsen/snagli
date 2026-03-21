// api/send-email.js
// Vercel serverless function — keeps Resend API key server-side

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, to, username, confirmUrl } = req.body;
  const RESEND_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_KEY) return res.status(500).json({ error: 'Email not configured' });

  let subject, html;

  if (type === 'confirm') {
    subject = '✅ Confirm your Snagli account';
    html = `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8f7ff">
        <div style="text-align:center;margin-bottom:28px">
          <span style="font-size:36px;font-weight:900;color:#FF4D6D">snagli.</span>
        </div>
        <div style="background:#fff;border-radius:16px;padding:28px;border:1px solid #e8e8f0">
          <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a2e">Welcome, ${username}! 👋</h2>
          <p style="color:#4a4a6a;font-size:15px;line-height:1.6;margin:0 0 20px">
            You're one tap away from finding trending collectibles before everyone else does.
            Confirm your email to activate your account.
          </p>
          <a href="${confirmUrl}" style="display:block;text-align:center;background:#FF4D6D;color:#fff;text-decoration:none;padding:14px 20px;border-radius:10px;font-weight:800;font-size:16px">
            Confirm My Account →
          </a>
          <p style="color:#9090b0;font-size:12px;margin:16px 0 0;text-align:center">
            Link expires in 24 hours. Didn't sign up? Ignore this email.
          </p>
        </div>
        <p style="text-align:center;color:#9090b0;font-size:11px;margin-top:20px">
          Snagli — Find It First · <a href="https://snagli.com" style="color:#9090b0">snagli.com</a>
        </p>
      </div>
    `;
  } else if (type === 'welcome') {
    subject = '🎉 You\'re in — welcome to Snagli!';
    html = `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8f7ff">
        <div style="text-align:center;margin-bottom:28px">
          <span style="font-size:36px;font-weight:900;color:#FF4D6D">snagli.</span>
        </div>
        <div style="background:#fff;border-radius:16px;padding:28px;border:1px solid #e8e8f0">
          <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a2e">You're in, ${username}! 🎉</h2>
          <p style="color:#4a4a6a;font-size:15px;line-height:1.6;margin:0 0 20px">
            Your account is confirmed. Time to find some stuff.
          </p>
          <div style="background:#f8f7ff;border-radius:10px;padding:16px;margin-bottom:20px">
            <div style="font-size:13px;color:#4a4a6a;font-weight:700;margin-bottom:8px">YOUR HANDLE</div>
            <div style="font-size:18px;font-weight:900;color:#FF4D6D">@${username}</div>
            <div style="font-size:12px;color:#9090b0;margin-top:4px">This is what your crew will see on your pins</div>
          </div>
          <a href="https://snagli.com" style="display:block;text-align:center;background:#FF4D6D;color:#fff;text-decoration:none;padding:14px 20px;border-radius:10px;font-weight:800;font-size:16px">
            Open Snagli →
          </a>
        </div>
        <p style="text-align:center;color:#9090b0;font-size:11px;margin-top:20px">
          Snagli — Find It First · <a href="https://snagli.com" style="color:#9090b0">snagli.com</a>
        </p>
      </div>
    `;
  } else {
    return res.status(400).json({ error: 'Unknown email type' });
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Snagli <hello@snagli.com>',
        to: [to],
        subject,
        html
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data });
    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
