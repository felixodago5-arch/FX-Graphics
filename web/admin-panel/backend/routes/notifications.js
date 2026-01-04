const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { auth, adminAuth } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Configure email transporter (optional, uses environment variables)
const createTransporter = () => {
  if (!process.env.EMAIL_HOST) {
    return null; // Email service not configured
  }
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send notification to clients
router.post('/send', adminAuth, async (req, res) => {
  try {
    const { subject, message, html, clientIds, sendToAll, attachment } = req.body;
    
    if (!subject || (!message && !html)) {
      return res.status(400).json({ message: 'Subject and message/html are required' });
    }
    
    // Get recipient clients
    let clients = [];
    if (sendToAll) {
      clients = await User.find({ role: 'client', status: 'active' })
        .select('email profile.name profile.preferences');
    } else if (clientIds && clientIds.length > 0) {
      clients = await User.find({ 
        _id: { $in: clientIds }, 
        role: 'client', 
        status: 'active' 
      }).select('email profile.name profile.preferences');
    } else {
      return res.status(400).json({ message: 'Must specify clientIds or sendToAll' });
    }
    
    const transporter = createTransporter();
    if (!transporter) {
      // Email not configured, return success with warning
      return res.json({
        success: true,
        message: 'Email service not configured. Notifications saved but not sent.',
        recipients: clients.length,
        emailConfigured: false
      });
    }
    
    // Send emails
    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };
    
    for (const client of clients) {
      // Check client preferences
      if (client.profile?.preferences?.notifications === false) {
        results.failed++;
        results.errors.push({ email: client.email, reason: 'Notifications disabled' });
        continue;
      }
      
      try {
        const mailOptions = {
          from: `"${process.env.EMAIL_FROM_NAME || 'Portfolio Admin'}" <${process.env.EMAIL_USER}>`,
          to: client.email,
          subject: subject,
          text: message,
          html: html || message.replace(/\n/g, '<br>'),
          attachments: attachment ? [attachment] : []
        };
        
        await transporter.sendMail(mailOptions);
        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({ email: client.email, reason: error.message });
      }
    }
    
    res.json({
      success: true,
      recipients: clients.length,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
      emailConfigured: true
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Failed to send notifications', error: error.message });
  }
});

// Get notification preferences for clients
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('profile.preferences');
    res.json({ preferences: user.profile?.preferences || { notifications: true, theme: 'light' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update notification preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { preferences } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user.profile) user.profile = {};
    user.profile.preferences = {
      ...user.profile.preferences,
      ...preferences
    };
    
    await user.save();
    res.json({ preferences: user.profile.preferences });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update preferences', error: error.message });
  }
});

// Test email configuration (admin only)
router.post('/test-email', adminAuth, async (req, res) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return res.status(400).json({ 
        message: 'Email service not configured. Please set EMAIL_* environment variables.' 
      });
    }
    
    const testEmail = req.body.email || process.env.EMAIL_USER;
    
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Portfolio Admin'}" <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: 'Test Email from Portfolio Admin',
      text: 'This is a test email from your portfolio admin panel.',
      html: '<p>This is a test email from your portfolio admin panel.</p>'
    });
    
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ message: 'Failed to send test email', error: error.message });
  }
});

module.exports = router;

