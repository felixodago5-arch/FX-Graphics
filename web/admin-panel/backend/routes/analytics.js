const express = require('express');
const router = express.Router();
const Analytics = require('../models/analytics');
const Content = require('../models/content');
const User = require('../models/user');
const { auth, adminAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Track event (public endpoint, uses session ID)
router.post('/track', async (req, res) => {
  try {
    const { eventType, contentId, page, metadata } = req.body;
    
    // Get or create session ID from cookies
    let sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      res.cookie('sessionId', sessionId, {
        httpOnly: false, // Allow client-side access for "pick up where you left off"
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
      });
    }
    
    // Get user ID if authenticated
    const userId = req.userId || null;
    
    // Detect device info
    const userAgent = req.headers['user-agent'] || '';
    let device = 'desktop';
    if (/mobile|android|iphone|ipad/i.test(userAgent)) device = 'mobile';
    else if (/tablet|ipad/i.test(userAgent)) device = 'tablet';
    
    const analytics = new Analytics({
      userId,
      sessionId,
      eventType,
      contentId,
      page,
      referrer: req.headers.referer,
      device,
      browser: userAgent,
      location: {
        ip: req.ip || req.connection.remoteAddress
      },
      metadata
    });
    
    await analytics.save();
    
    // Update content stats if contentId provided
    if (contentId && eventType === 'view') {
      await Content.findByIdAndUpdate(contentId, { $inc: { 'stats.views': 1 } });
    } else if (contentId && eventType === 'download') {
      await Content.findByIdAndUpdate(contentId, { $inc: { 'stats.downloads': 1 } });
    } else if (contentId && eventType === 'share') {
      await Content.findByIdAndUpdate(contentId, { $inc: { 'stats.shares': 1 } });
    }
    
    res.json({ success: true, sessionId });
  } catch (error) {
    console.error('Track error:', error);
    res.status(500).json({ message: 'Tracking failed', error: error.message });
  }
});

// Get analytics dashboard data (admin only)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    // Get overview stats
    const totalEvents = await Analytics.countDocuments(query);
    const uniqueSessions = await Analytics.distinct('sessionId', query).then(sessions => sessions.length);
    const uniqueUsers = await Analytics.distinct('userId', { ...query, userId: { $ne: null } }).then(users => users.length);
    
    // Event types breakdown
    const eventTypes = await Analytics.aggregate([
      { $match: query },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Device breakdown
    const deviceBreakdown = await Analytics.aggregate([
      { $match: query },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Daily activity (last 30 days)
    const dailyActivity = await Analytics.aggregate([
      {
        $match: {
          ...query,
          timestamp: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Top content
    const topContent = await Analytics.aggregate([
      { $match: { ...query, contentId: { $ne: null } } },
      { $group: { _id: '$contentId', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);
    
    // Populate content details
    const topContentIds = topContent.map(item => item._id);
    const contents = await Content.find({ _id: { $in: topContentIds } }).select('title fileUrl type');
    const topContentWithDetails = topContent.map(item => {
      const content = contents.find(c => c._id.toString() === item._id.toString());
      return {
        contentId: item._id,
        views: item.views,
        title: content?.title || 'Unknown',
        type: content?.type || 'unknown'
      };
    });
    
    res.json({
      overview: {
        totalEvents,
        uniqueSessions,
        uniqueUsers
      },
      eventTypes,
      deviceBreakdown,
      dailyActivity,
      topContent: topContentWithDetails
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user session data (for "pick up where you left off")
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const recentViews = await Analytics.find({ sessionId, eventType: 'view' })
      .populate('contentId', 'title fileUrl thumbnail type')
      .sort({ timestamp: -1 })
      .limit(limit);
    
    res.json({ recentViews });
  } catch (error) {
    console.error('Session analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

