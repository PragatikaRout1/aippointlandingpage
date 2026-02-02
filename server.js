// Express server for interview API endpoints
// Run with: node server.js

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Storage file path
const STORAGE_FILE = path.join(__dirname, 'interview-attempts.json');

// In-memory store (loaded from file)
let attemptsStore = new Map();

// Load attempts from file on startup
async function loadAttempts() {
    try {
        const data = await fs.readFile(STORAGE_FILE, 'utf8');
        const parsed = JSON.parse(data);
        attemptsStore = new Map(Object.entries(parsed));
        console.log('Loaded interview attempts from file');
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('No existing attempts file, starting fresh');
        } else {
            console.error('Error loading attempts:', error);
        }
    }
}

// Save attempts to file
async function saveAttempts() {
    try {
        const data = Object.fromEntries(attemptsStore);
        await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving attempts:', error);
    }
}

// Interview Attempts API
app.post('/api/interview-attempts/check', async (req, res) => {
    try {
        const { email, action } = req.body;

        // Validate email format
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Get current attempt count
        const currentAttempts = attemptsStore.get(normalizedEmail) || {
            count: 0,
            attempts: []
        };

        if (action === 'check') {
            // Check if user can start interview
            const canStart = currentAttempts.count < 3;
            return res.status(200).json({
                canStart,
                attempts: currentAttempts.count,
                maxAttempts: 3,
                message: canStart 
                    ? null 
                    : 'You have reached the maximum number of interview attempts for this email address.'
            });
        }

        if (action === 'increment') {
            // Increment attempt count
            const newCount = currentAttempts.count + 1;
            
            if (newCount > 3) {
                return res.status(403).json({
                    error: 'Maximum attempts reached',
                    attempts: currentAttempts.count,
                    maxAttempts: 3
                });
            }

            // Log attempt
            const attemptLog = {
                email: normalizedEmail,
                timestamp: new Date().toISOString(),
                attemptNumber: newCount
            };

            attemptsStore.set(normalizedEmail, {
                count: newCount,
                attempts: [...currentAttempts.attempts, attemptLog]
            });

            // Save to file
            await saveAttempts();

            // Log server-side for audit
            console.log('[INTERVIEW ATTEMPT]', JSON.stringify({
                email: normalizedEmail,
                attemptCount: newCount,
                timestamp: attemptLog.timestamp,
                status: 'started'
            }));

            return res.status(200).json({
                success: true,
                attempts: newCount,
                maxAttempts: 3
            });
        }

        return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        console.error('[API ERROR]', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Contact Form Email API
app.post('/api/send-contact-email', async (req, res) => {
    try {
        const { name, email, company, message, formType, formData } = req.body;

        // Email service configuration
        const EMAIL_SERVICE = {
            apiKey: process.env.RESEND_API_KEY,
            fromEmail: process.env.FROM_EMAIL || 'noreply@aippoint.ai',
            apiUrl: 'https://api.resend.com/emails'
        };

        // Create email content based on form type
        let emailSubject = '';
        let emailContent = '';

        if (formType === 'pricing') {
            emailSubject = 'New Pricing Inquiry - AI Interview Platform';
            emailContent = `
                <h2>New Pricing Form Submission</h2>
                <p><strong>Name:</strong> ${name || 'N/A'}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Company:</strong> ${company || 'N/A'}</p>
                <p><strong>Hires per year:</strong> ${formData?.hires || 'N/A'}</p>
                <p><strong>Primary focus:</strong> ${formData?.focus || 'N/A'}</p>
                <p><strong>Country:</strong> ${formData?.country || 'N/A'}</p>
                <p><strong>Message:</strong> ${message || 'No additional message'}</p>
                <hr>
                <p><em>Submitted on: ${new Date().toLocaleString()}</em></p>
            `;
        } else {
            emailSubject = 'New Contact Form Submission - AI Interview Platform';
            emailContent = `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name || 'N/A'}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Company:</strong> ${company || 'N/A'}</p>
                <p><strong>Message:</strong> ${message || 'No message provided'}</p>
                <hr>
                <p><em>Submitted on: ${new Date().toLocaleString()}</em></p>
            `;
        }

        // Send email to hr@aippoint.ai
        if (EMAIL_SERVICE.apiKey && EMAIL_SERVICE.apiKey !== 'your-api-key') {
            try {
                const emailResponse = await fetch(EMAIL_SERVICE.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${EMAIL_SERVICE.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: EMAIL_SERVICE.fromEmail,
                        to: 'hr@aippoint.ai',
                        subject: emailSubject,
                        html: emailContent
                    })
                });

                if (!emailResponse.ok) {
                    const errorData = await emailResponse.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to send email');
                }

                console.log('[CONTACT EMAIL SENT]', JSON.stringify({
                    to: 'hr@aippoint.ai',
                    from: email,
                    subject: emailSubject,
                    timestamp: new Date().toISOString(),
                    status: 'sent',
                    service: 'Resend'
                }));

                return res.status(200).json({ 
                    success: true, 
                    message: 'Email sent successfully' 
                });
            } catch (emailError) {
                console.error('[EMAIL SERVICE ERROR]', emailError);
                // Fall through to log-only mode
            }
        }

        // Log-only mode (no email service configured)
        console.log('[CONTACT EMAIL LOGGED]', JSON.stringify({
            to: 'hr@aippoint.ai',
            from: email,
            subject: emailSubject,
            timestamp: new Date().toISOString(),
            status: 'logged (no email service configured)',
            note: 'Set RESEND_API_KEY environment variable to enable email sending'
        }));

        return res.status(200).json({ 
            success: true, 
            message: 'Form submitted (email logged - configure RESEND_API_KEY to send emails)' 
        });
    } catch (error) {
        console.error('[CONTACT EMAIL ERROR]', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to process form submission' 
        });
    }
});

// Send Confirmation Email API
app.post('/api/send-confirmation', async (req, res) => {
    try {
        const { email, candidateName } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Email service configuration
        const EMAIL_SERVICE = {
            apiKey: process.env.RESEND_API_KEY,
            fromEmail: process.env.FROM_EMAIL || 'noreply@aippoint.ai',
            apiUrl: 'https://api.resend.com/emails'
        };

        // Email HTML template
        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #0083C3; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    ul { margin: 16px 0; padding-left: 24px; }
                    li { margin-bottom: 8px; }
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
        `;

        // If Resend API key is configured, send real email
        if (EMAIL_SERVICE.apiKey && EMAIL_SERVICE.apiKey !== 'your-api-key') {
            try {
                const emailResponse = await fetch(EMAIL_SERVICE.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${EMAIL_SERVICE.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: EMAIL_SERVICE.fromEmail,
                        to: normalizedEmail,
                        subject: 'Your AI Interview Has Been Successfully Submitted',
                        html: emailHtml
                    })
                });

                if (!emailResponse.ok) {
                    const errorData = await emailResponse.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to send email');
                }

                console.log('[CONFIRMATION EMAIL SENT]', JSON.stringify({
                    email: normalizedEmail,
                    timestamp: new Date().toISOString(),
                    status: 'sent',
                    service: 'Resend'
                }));

                return res.status(200).json({ 
                    success: true, 
                    message: 'Confirmation email sent' 
                });
            } catch (emailError) {
                console.error('[EMAIL SERVICE ERROR]', emailError);
                // Fall through to log-only mode
            }
        }

        // Log-only mode (no email service configured)
        console.log('[CONFIRMATION EMAIL LOGGED]', JSON.stringify({
            email: normalizedEmail,
            candidateName: candidateName || 'N/A',
            timestamp: new Date().toISOString(),
            status: 'logged (no email service configured)',
            note: 'Set RESEND_API_KEY environment variable to enable email sending'
        }));

        // Return success even in log-only mode (don't fail the interview submission)
        return res.status(200).json({ 
            success: true, 
            message: 'Interview submitted (email logged - configure RESEND_API_KEY to send emails)' 
        });
    } catch (error) {
        console.error('[EMAIL ERROR]', error);
        // Don't fail the interview submission if email fails
        return res.status(200).json({ 
            success: true, 
            message: 'Interview submitted (email service unavailable)' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
    await loadAttempts();
    
    app.listen(PORT, () => {
        console.log(`\n🚀 Interview API Server running on http://localhost:${PORT}`);
        console.log(`📧 Email service: ${process.env.RESEND_API_KEY ? 'Enabled (Resend)' : 'Disabled (log-only mode)'}`);
        console.log(`💾 Storage: ${STORAGE_FILE}`);
        console.log(`\nEndpoints:`);
        console.log(`  POST /api/interview-attempts/check`);
        console.log(`  POST /api/send-confirmation`);
        console.log(`  GET  /api/health\n`);
    });
}

startServer().catch(console.error);

