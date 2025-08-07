import express from 'express';
import { EmailSender } from '../utils/emailSender';
import { createResponse } from '../utils/helpers';
import { authMiddleware as authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Test email configuration
router.get('/test-config', async (req, res) => {
  try {
    const result = await EmailSender.testEmailConfig();
    
    if (result.success) {
      res.json(createResponse(
        true,
        'Email configuration is valid',
        { message: 'SMTP connection successful' }
      ));
    } else {
      res.status(500).json(createResponse(
        false,
        'Email configuration failed',
        null,
        { error: result.error }
      ));
    }
  } catch (error: any) {
    console.error('Error testing email config:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to test email configuration',
      null,
      { error: error.message }
    ));
  }
});

// Send test email
router.post('/send-test', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json(createResponse(
        false,
        'Email address is required'
      ));
    }

    const result = await EmailSender.sendWelcomeEmail({
      firstName: 'Test',
      lastName: 'User',
      email: email,
      userType: 'Test',
      username: 'testuser',
      password: 'testpassword123',
      clinicName: 'Test Clinic'
    });

    if (result.success) {
      res.json(createResponse(
        true,
        'Test email sent successfully',
        { messageId: result.messageId }
      ));
    } else {
      res.status(500).json(createResponse(
        false,
        'Failed to send test email',
        null,
        { error: result.error }
      ));
    }
  } catch (error: any) {
    console.error('Error sending test email:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to send test email',
      null,
      { error: error.message }
    ));
  }
});

export default router; 