import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Email templates
const emailTemplates = {
  welcome: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
    username?: string;
    password?: string;
    clinicName?: string;
  }) => {
    const { firstName, lastName, email, userType, username, password, clinicName } = userData;
    
    const userTypeDisplay = {
      'Clinic': 'Clinic Administrator',
      'Doctor': 'Doctor',
      'Patient': 'Patient',
      'Staff': 'Staff Member'
    }[userType] || userType;

    return {
      subject: `Welcome to EMR System - ${userTypeDisplay} Account Created`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to EMR System</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .welcome-text {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .account-details {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #667eea;
            }
            .detail-row {
              margin: 10px 0;
              display: flex;
              justify-content: space-between;
            }
            .label {
              font-weight: bold;
              color: #555;
            }
            .value {
              color: #333;
            }
            .login-info {
              background: #e8f4fd;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #2196f3;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              margin: 10px 0;
            }
            .important {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to EMR System</h1>
            <p>Your ${userTypeDisplay} account has been successfully created!</p>
          </div>
          
          <div class="content">
            <div class="welcome-text">
              Hello <strong>${firstName} ${lastName}</strong>,
            </div>
            
            <p>Welcome to our Electronic Medical Records (EMR) system! Your account has been successfully created and you can now access the portal.</p>
            
            <div class="account-details">
              <h3>Account Details</h3>
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">${firstName} ${lastName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">${email}</span>
              </div>
              <div class="detail-row">
                <span class="label">User Type:</span>
                <span class="value">${userTypeDisplay}</span>
              </div>
              ${clinicName ? `
              <div class="detail-row">
                <span class="label">Clinic:</span>
                <span class="value">${clinicName}</span>
              </div>
              ` : ''}
            </div>
            
            ${username && password ? `
            <div class="login-info">
              <h3>Login Information</h3>
              <div class="detail-row">
                <span class="label">Username:</span>
                <span class="value">${username}</span>
              </div>
              <div class="detail-row">
                <span class="label">Password:</span>
                <span class="value">${password}</span>
              </div>
              
              <div class="important">
                <strong>Important:</strong> Please change your password after your first login for security purposes.
              </div>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">
                Login to EMR System
              </a>
            </div>
            
            <div class="important">
              <strong>Security Notice:</strong>
              <ul>
                <li>Keep your login credentials secure and confidential</li>
                <li>Never share your password with anyone</li>
                <li>Log out when you're done using the system</li>
                <li>Contact support immediately if you suspect unauthorized access</li>
              </ul>
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <div class="footer">
              <p>This is an automated message from the EMR System.</p>
              <p>Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
};

// Email sender class
export class EmailSender {
  // Send welcome email to new user
  static async sendWelcomeEmail(userData: {
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
    username?: string;
    password?: string;
    clinicName?: string;
  }) {
    try {
      const template = emailTemplates.welcome(userData);
      
      const mailOptions = {
        from: `"EMR System" <${emailConfig.auth.user}>`,
        to: userData.email,
        subject: template.subject,
        html: template.html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error:any) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  static async sendPasswordResetEmail(email: string, resetToken: string) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"EMR System" <${emailConfig.auth.user}>`,
        to: email,
        subject: 'Password Reset Request - EMR System',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #667eea; color: white; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; }
              .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <p>You have requested to reset your password for the EMR System.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" class="button">Reset Password</a>
                <p>If you didn't request this, please ignore this email.</p>
                <p>This link will expire in 1 hour.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error:any) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  // Test email configuration
  static async testEmailConfig() {
    try {
      await transporter.verify();
      console.log('Email configuration is valid');
      return { success: true };
    } catch (error:any) {
      console.error('Email configuration error:', error);
      return { success: false, error: error.message };
    }
  }
} 