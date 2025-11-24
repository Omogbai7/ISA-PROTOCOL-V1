import express from 'express';
import { PremiumService } from '../services/premiumService.js';
import { authenticateApiKey, requireOwner } from '../middleware/auth.js';

const router = express.Router();

// Generate license (owner only)
router.post('/generate', authenticateApiKey, async (req, res) => {
  try {
    const { type, count = 1, createdBy = 'system', metadata = {} } = req.body;

    if (!['trial', 'monthly', 'yearly', 'lifetime'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid license type'
      });
    }

    let licenses;

    if (count > 1) {
      licenses = await PremiumService.bulkGenerateLicenses(count, type, createdBy);
    } else {
      licenses = [await PremiumService.generateLicense(type, createdBy, metadata)];
    }

    res.json({
      success: true,
      licenses: licenses.map(l => ({
        code: l.code,
        type: l.type,
        durationDays: l.durationDays,
        expiresAt: l.expiresAt
      }))
    });
  } catch (error) {
    console.error('License generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Activate license
router.post('/activate', authenticateApiKey, async (req, res) => {
  try {
    const { code, phoneNumber } = req.body;

    if (!code || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Code and phone number required'
      });
    }

    const result = await PremiumService.activateLicense(code, phoneNumber);

    res.json({
      success: true,
      message: result.message,
      user: {
        phoneNumber: result.user.phoneNumber,
        isPremium: result.user.isPremium,
        premiumExpiry: result.user.premiumExpiry
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Check premium status
router.post('/status', authenticateApiKey, async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number required'
      });
    }

    const status = await PremiumService.checkPremiumStatus(phoneNumber);

    res.json({
      success: true,
      status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all licenses (admin)
router.get('/licenses', authenticateApiKey, async (req, res) => {
  try {
    const { isActivated, type } = req.query;

    const filters = {};
    if (isActivated !== undefined) {
      filters.isActivated = isActivated === 'true';
    }
    if (type) {
      filters.type = type;
    }

    const licenses = await PremiumService.getAllLicenses(filters);

    res.json({
      success: true,
      licenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Revoke premium (owner only)
router.post('/revoke', authenticateApiKey, async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number required'
      });
    }

    const user = await PremiumService.revokePremium(phoneNumber);

    res.json({
      success: true,
      message: 'Premium revoked successfully',
      user: {
        phoneNumber: user.phoneNumber,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
