interface EmailTemplateParams {
  code?: string;
  recipientName?: string;
  appName?: string;
  type?: 'login' | 'signup' | 'invitation';
  inviterName?: string;
  organizationName?: string;
}

export function createVerificationEmailTemplate(params: EmailTemplateParams): {
  subject: string;
  text: string;
  html: string;
} {
  const { 
    code, 
    recipientName = 'User', 
    appName = 'Caesar Solutions', 
    type = 'login',
    inviterName,
    organizationName 
  } = params;
  
  if (type === 'invitation') {
    return createInvitationTemplate(params);
  }
  
  const subject = type === 'login' 
    ? `🔐 Your ${appName} login code: ${code}`
    : `🎉 Welcome to ${appName}! Verify your email: ${code}`;
    
  const text = `Hello ${recipientName},\n\nYour verification code is: ${code}\n\nIf you didn't request this code, please ignore this email.\n\nBest regards,\n${appName} Team`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Code - ${appName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 30px;
          text-align: center;
          border-bottom: 1px solid #e9ecef;
        }
        .header-icon {
          font-size: 24px;
          margin-bottom: 10px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #333;
        }
        .header p {
          margin: 5px 0 0 0;
          color: #6c757d;
          font-size: 14px;
          font-weight: 500;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #333;
        }
        .intro-text {
          color: #6c757d;
          margin-bottom: 30px;
          font-size: 16px;
        }
        .code-container {
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          padding: 25px;
          text-align: center;
          margin: 30px 0;
          background-color: #f8f9fa;
        }
        .code-label {
          font-size: 12px;
          color: #6c757d;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 1px;
          margin-bottom: 15px;
        }
        .verification-code {
          font-size: 36px;
          font-weight: 700;
          color: #333;
          letter-spacing: 6px;
          font-family: 'Courier New', monospace;
          margin-bottom: 15px;
        }
        .expiry-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #dc3545;
          font-size: 14px;
          font-weight: 500;
        }
        .expiry-notice::before {
          content: "⏰";
          font-size: 14px;
        }
        .instructions-box {
          background-color: #ffffff;
          border-left: 4px solid #007bff;
          padding: 20px;
          margin: 30px 0;
          border-radius: 0 8px 8px 0;
        }
        .instructions-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 15px;
        }
        .instructions-title::before {
          content: "📋";
          font-size: 16px;
        }
        .instructions-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .instructions-list li {
          padding: 8px 0;
          color: #6c757d;
          font-size: 14px;
          position: relative;
          padding-left: 25px;
        }
        .instructions-list li::before {
          content: counter(step-counter);
          counter-increment: step-counter;
          position: absolute;
          left: 0;
          top: 8px;
          background-color: #007bff;
          color: white;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
        }
        .security-notice {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
        }
        .security-notice-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
        }
        .security-notice-header::before {
          content: "🛡️";
          font-size: 14px;
        }
        .security-notice-text {
          color: #6c757d;
          font-size: 14px;
          margin: 0;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          color: #6c757d;
          font-size: 12px;
          border-top: 1px solid #e9ecef;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-icon">🔐</div>
          <h1>${appName}</h1>
          <p>Secure Access Verification</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            Hello ${recipientName}! 👋
          </div>
          
          <p class="intro-text">
            We received a request to access your account. To continue, please use the verification code below:
          </p>
          
          <div class="code-container">
            <div class="code-label">Your Verification Code</div>
            <div class="verification-code">${code}</div>
          </div>
          
          <div class="instructions-box">
            <div class="instructions-title">How to use this code:</div>
            <ol class="instructions-list" style="counter-reset: step-counter;">
              <li>Return to the ${appName} login page</li>
              <li>Enter this 6-digit code in the verification field</li>
              <li>Click "Login" to complete the process</li>
            </ol>
          </div>
          
          <div class="security-notice">
            <div class="security-notice-header">Security Notice:</div>
            <p class="security-notice-text">
              If you didn't request this login code, please ignore this email. Never share this code with anyone.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 ${appName}. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject,
    text,
    html
  };
}

export function createInvitationTemplate(params: EmailTemplateParams): {
  subject: string;
  text: string;
  html: string;
} {
  const { 
    recipientName = 'there', 
    appName = 'Caesar Solutions', 
    inviterName = 'A team member',
    organizationName
  } = params;
  
  const subject = `🎉 You're invited to join ${organizationName || appName}!`;
  
  const text = `Hello ${recipientName},\n\n${inviterName} has invited you to join ${organizationName || appName}!\n\nCreate your account at: https://caesar-2025.vercel.app/auth/register\n\nWe're excited to have you on board!\n\nBest regards,\n${appName} Team`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You're Invited - ${appName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          padding: 30px;
          text-align: center;
          color: white;
        }
        .header-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 5px;
        }
        .header p {
          margin: 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #333;
          text-align: center;
        }
        .invitation-text {
          color: #6c757d;
          margin-bottom: 30px;
          font-size: 18px;
          text-align: center;
          line-height: 1.7;
        }
        .inviter-highlight {
          color: #28a745;
          font-weight: 600;
        }
        .organization-highlight {
          color: #007bff;
          font-weight: 600;
        }
        .cta-container {
          text-align: center;
          margin: 40px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          text-decoration: none;
          padding: 18px 40px;
          border-radius: 50px;
          font-size: 18px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
        }
        .features-box {
          background-color: #f8f9fa;
          border-radius: 12px;
          padding: 30px;
          margin: 30px 0;
        }
        .features-title {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin-bottom: 20px;
          text-align: center;
        }
        .features-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .features-list li {
          padding: 10px 0;
          color: #6c757d;
          font-size: 16px;
          position: relative;
          padding-left: 35px;
        }
        .features-list li::before {
          content: "✨";
          position: absolute;
          left: 0;
          top: 10px;
          font-size: 18px;
        }
        .help-section {
          background-color: #e3f2fd;
          border-left: 4px solid #2196f3;
          padding: 20px;
          margin: 30px 0;
          border-radius: 0 8px 8px 0;
        }
        .help-title {
          font-size: 16px;
          font-weight: 600;
          color: #1976d2;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .help-title::before {
          content: "💡";
          font-size: 16px;
        }
        .help-text {
          color: #1565c0;
          font-size: 14px;
          margin: 0;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          color: #6c757d;
          font-size: 12px;
          border-top: 1px solid #e9ecef;
        }
        .url-fallback {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          text-align: center;
        }
        .url-fallback-label {
          font-size: 12px;
          color: #6c757d;
          margin-bottom: 8px;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .url-fallback-link {
          color: #007bff;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          word-break: break-all;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-icon">🎉</div>
          <h1>You're Invited!</h1>
          <p>Join our team and get started today</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            Hello ${recipientName}! 👋
          </div>
          
          <p class="invitation-text">
            <span class="inviter-highlight">${inviterName}</span> has invited you to join 
            <span class="organization-highlight">${organizationName || appName}</span>!<br>
            We're excited to have you on board and can't wait to see what we'll accomplish together.
          </p>
          
          <div class="cta-container">
            <a href="https://caesar-2025.vercel.app/auth/register" class="cta-button">
              Create Your Account 🚀
            </a>
          </div>
          
          <div class="url-fallback">
            <div class="url-fallback-label">Or copy and paste this link:</div>
            <div class="url-fallback-link">https://caesar-2025.vercel.app/auth/register</div>
          </div>
          
          <div class="features-box">
            <div class="features-title">What you'll get access to:</div>
            <ul class="features-list">
              <li>Secure and intuitive platform interface</li>
              <li>Collaborative tools and team features</li>
              <li>Real-time updates and notifications</li>
              <li>Professional support and resources</li>
            </ul>
          </div>
          
          <div class="help-section">
            <div class="help-title">Need help getting started?</div>
            <p class="help-text">
              Once you create your account, you'll receive a welcome guide to help you get familiar with the platform. 
              If you have any questions, our support team is always ready to help!
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 ${appName}. All rights reserved.</p>
          <p>This invitation was sent by ${inviterName}. If you believe this was sent in error, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject,
    text,
    html
  };
}