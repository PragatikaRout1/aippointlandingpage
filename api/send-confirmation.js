// Separate endpoint for sending confirmation emails
// This can be deployed as a separate serverless function

const EMAIL_SERVICE = {
  apiKey: process.env.RESEND_API_KEY || 'your-api-key',
  fromEmail: process.env.FROM_EMAIL || 'noreply@aippoint.ai',
  apiUrl: 'https://api.resend.com/emails'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, candidateName } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Send email using Resend (replace with your email service)
    const emailResponse = await fetch(EMAIL_SERVICE.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_SERVICE.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: EMAIL_SERVICE.fromEmail,
        to: email,
        subject: 'Your AI Interview Has Been Successfully Submitted',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #0083C3; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Interview Submitted Successfully</h1>
              </div>
              <div class="content">
                <p>Hi ${candidateName || 'there'},</p>
                <p>Thank you for completing your AI interview with aippoint. Your responses have been successfully submitted and are now under review.</p>
                <p><strong>What happens next?</strong></p>
                <ul>
                  <li>Our team will review your interview responses</li>
                  <li>You'll receive feedback and next steps via email</li>
                  <li>We typically respond within 2-3 business days</li>
                </ul>
                <p>If you have any questions, feel free to reach out to us.</p>
                <p>Best regards,<br>The aippoint Team</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(errorData.message || 'Failed to send email');
    }

    console.log('[CONFIRMATION EMAIL]', JSON.stringify({
      email: email.toLowerCase().trim(),
      timestamp: new Date().toISOString(),
      status: 'sent'
    }));

    return res.status(200).json({ success: true, message: 'Confirmation email sent' });
  } catch (error) {
    console.error('[EMAIL ERROR]', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}

