// Enhanced confirmation email service for Vercel serverless functions
// Uses Resend API for reliable email delivery with improved templates

const EMAIL_SERVICE = {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@aippoint.ai',
    apiUrl: 'https://api.resend.com/emails'
};

function generateConfirmationEmail(candidateName, email) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    margin: 0; 
                    padding: 20px; 
                    background-color: #f8fafc;
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background: white; 
                    border-radius: 12px; 
                    overflow: hidden; 
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header { 
                    background: linear-gradient(135deg, #0083C3 0%, #00a8cc 100%); 
                    color: white; 
                    padding: 40px 30px; 
                    text-align: center; 
                }
                .header h1 { 
                    margin: 0; 
                    font-size: 28px; 
                    font-weight: 600;
                }
                .content { 
                    padding: 40px 30px; 
                    background: #ffffff;
                }
                .checklist {
                    background: #f0f9ff;
                    border-left: 4px solid #0083C3;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 6px;
                }
                .checklist h3 {
                    margin-top: 0;
                    color: #0083C3;
                }
                .checklist ul {
                    margin-bottom: 0;
                }
                .footer {
                    background: #f8fafc;
                    padding: 20px 30px;
                    text-align: center;
                    border-top: 1px solid #e2e8f0;
                }
                .footer p {
                    margin: 0;
                    color: #64748b;
                    font-size: 14px;
                }
                .cta-button {
                    display: inline-block;
                    background: #0083C3;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 500;
                    margin-top: 20px;
                }
                .status-badge {
                    display: inline-block;
                    background: #10b981;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    margin-left: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Interview Submitted Successfully</h1>
                </div>
                <div class="content">
                    <p>Hi ${candidateName || 'there'},</p>
                    <p>Thank you for completing your AI interview with <strong>aippoint</strong>. Your responses have been successfully submitted and are now under review.</p>
                    
                    <div class="checklist">
                        <h3>📋 What's Next?</h3>
                        <ul>
                            <li>✅ Your interview responses are saved securely</li>
                            <li>✅ Our AI system is analyzing your performance</li>
                            <li>✅ Detailed feedback will be generated</li>
                            <li>✅ Results will be sent to your email</li>
                        </ul>
                    </div>

                    <h3>🎯 Timeline</h3>
                    <ul>
                        <li><strong>Immediate:</strong> Interview submission confirmed <span class="status-badge">Done</span></li>
                        <li><strong>Within 1 hour:</strong> AI analysis completed</li>
                        <li><strong>Within 24 hours:</strong> Detailed feedback sent to your email</li>
                        <li><strong>Within 2-3 days:</strong> Human review and next steps</li>
                    </ul>

                    <h3>📊 What We Evaluate</h3>
                    <p>Our AI system evaluates multiple dimensions:</p>
                    <ul>
                        <li>💬 <strong>Communication Skills</strong> - Clarity, articulation, and confidence</li>
                        <li>🔧 <strong>Technical Knowledge</strong> - Domain expertise and problem-solving</li>
                        <li>🎭 <strong>Soft Skills</strong> - Professionalism and interpersonal abilities</li>
                        <li>📈 <strong>Overall Performance</strong> - Comprehensive assessment score</li>
                    </ul>

                    <p><strong>Questions about your results?</strong></p>
                    <p>Keep an eye on your inbox for detailed feedback. If you don't receive our email within 24 hours, please check your spam folder or contact us.</p>

                    <a href="https://aippoint.ai" class="cta-button">Visit aippoint.ai</a>
                </div>
                <div class="footer">
                    <p>Best regards,<br>The aippoint Team</p>
                    <p style="margin-top: 10px; font-size: 12px;">
                        This is an automated message. Please do not reply to this email.<br>
                        Interview submitted on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
}

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, candidateName, interviewData } = req.body;

        // Validate email format
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if Resend API key is configured
        if (!EMAIL_SERVICE.apiKey) {
            console.warn('[EMAIL_SERVICE] Resend API key not configured, skipping email send');
            return res.json({
                success: true,
                message: 'Email service not configured, interview submitted successfully',
                emailSent: false
            });
        }

        // Generate email content
        const emailHtml = generateConfirmationEmail(candidateName, email);

        // Send email using Resend
        const emailResponse = await fetch(EMAIL_SERVICE.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${EMAIL_SERVICE.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: EMAIL_SERVICE.fromEmail,
                to: email,
                subject: `Interview Confirmation - aippoint AI Interview`,
                html: emailHtml,
                replyTo: process.env.REPLY_TO_EMAIL || 'support@aippoint.ai'
            })
        });

        if (!emailResponse.ok) {
            const errorData = await emailResponse.json();
            throw new Error(errorData.message || 'Failed to send email');
        }

        const emailResult = await emailResponse.json();

        console.log('[CONFIRMATION_EMAIL_SENT]', {
            email: email.toLowerCase().trim(),
            candidateName,
            emailId: emailResult.id,
            timestamp: new Date().toISOString()
        });

        return res.status(200).json({ 
            success: true, 
            message: 'Confirmation email sent successfully',
            emailId: emailResult.id,
            emailSent: true
        });

    } catch (error) {
        console.error('[EMAIL_ERROR]', error);
        return res.status(500).json({ 
            error: 'Failed to send email', 
            details: error.message 
        });
    }
}

