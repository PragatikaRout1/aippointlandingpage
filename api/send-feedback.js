// Email service for sending interview feedback to candidates
// Uses Resend API for reliable email delivery

const EMAIL_SERVICE = {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@aippoint.ai',
    apiUrl: 'https://api.resend.com/emails'
};

function generateFeedbackEmail(candidateName, feedbackData) {
    const { scores, duration, questionsAnswered } = feedbackData;
    
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
                .score-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 30px 0;
                }
                .score-card {
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #0083C3;
                }
                .score-label {
                    font-size: 14px;
                    color: #64748b;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .score-value {
                    font-size: 32px;
                    font-weight: bold;
                    color: #0083C3;
                    margin: 0;
                }
                .info-section {
                    background: #f1f5f9;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                .info-item:last-child {
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
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Interview Completed Successfully</h1>
                </div>
                <div class="content">
                    <p>Hi ${candidateName},</p>
                    <p>Congratulations on completing your AI interview with <strong>aippoint</strong>! Your responses have been successfully submitted and evaluated.</p>
                    
                    <h3>📊 Your Performance Scores</h3>
                    <div class="score-grid">
                        <div class="score-card">
                            <div class="score-label">Communication</div>
                            <div class="score-value">${scores.communication}/100</div>
                        </div>
                        <div class="score-card">
                            <div class="score-label">Technical Skills</div>
                            <div class="score-value">${scores.technical}/100</div>
                        </div>
                        <div class="score-card">
                            <div class="score-label">Confidence</div>
                            <div class="score-value">${scores.confidence}/100</div>
                        </div>
                        <div class="score-card">
                            <div class="score-label">Overall Score</div>
                            <div class="score-value">${scores.overall}/100</div>
                        </div>
                    </div>

                    <div class="info-section">
                        <h4>📋 Interview Details</h4>
                        <div class="info-item">
                            <span><strong>Questions Answered:</strong></span>
                            <span>${questionsAnswered}</span>
                        </div>
                        <div class="info-item">
                            <span><strong>Duration:</strong></span>
                            <span>${duration ? `${duration} minutes` : 'Not recorded'}</span>
                        </div>
                        <div class="info-item">
                            <span><strong>Completed Date:</strong></span>
                            <span>${new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <h3>🎯 What Happens Next?</h3>
                    <ul>
                        <li>📧 Your detailed feedback has been sent to our hiring team</li>
                        <li>👥 Our team will review your interview responses and scores</li>
                        <li>📞 You'll receive follow-up communication within 2-3 business days</li>
                        <li>🚀 High-scoring candidates will be contacted for next steps</li>
                    </ul>

                    <p><strong>Want to improve your scores?</strong></p>
                    <p>Practice common interview questions, work on your technical skills, and focus on clear communication. Our AI system evaluates both technical knowledge and soft skills.</p>

                    <a href="https://aippoint.ai" class="cta-button">Visit aippoint.ai</a>
                </div>
                <div class="footer">
                    <p>Best regards,<br>The aippoint Team</p>
                    <p style="margin-top: 10px; font-size: 12px;">
                        This is an automated message. Please do not reply to this email.
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

        // Validate required fields
        if (!email || !candidateName || !interviewData) {
            return res.status(400).json({
                error: 'Email, candidateName, and interviewData are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        // Check if Resend API key is configured
        if (!EMAIL_SERVICE.apiKey) {
            console.warn('[EMAIL_SERVICE] Resend API key not configured, skipping email send');
            return res.json({
                success: true,
                message: 'Email service not configured, feedback saved successfully',
                emailSent: false
            });
        }

        // Generate email content
        const emailHtml = generateFeedbackEmail(candidateName, interviewData);

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
                subject: `Your AI Interview Results - ${candidateName}`,
                html: emailHtml,
                replyTo: process.env.REPLY_TO_EMAIL || 'support@aippoint.ai'
            })
        });

        if (!emailResponse.ok) {
            const errorData = await emailResponse.json();
            throw new Error(errorData.message || 'Failed to send email');
        }

        const emailResult = await emailResponse.json();

        console.log('[FEEDBACK_EMAIL_SENT]', {
            email: email.toLowerCase().trim(),
            candidateName,
            emailId: emailResult.id,
            timestamp: new Date().toISOString()
        });

        return res.json({
            success: true,
            message: 'Feedback email sent successfully',
            emailId: emailResult.id,
            emailSent: true
        });

    } catch (error) {
        console.error('[FEEDBACK_EMAIL_ERROR]', error);
        return res.status(500).json({
            error: 'Failed to send feedback email',
            details: error.message
        });
    }
}
