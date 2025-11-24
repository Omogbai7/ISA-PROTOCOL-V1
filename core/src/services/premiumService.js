import License from '../models/License.js';
import User from '../models/User.js';

export class PremiumService {
  // Generate a new license
  static async generateLicense(type, createdBy = 'system', metadata = {}) {
    const durationMap = {
      trial: 7,
      monthly: 30,
      yearly: 365,
      lifetime: 36500 // 100 years
    };

    const durationDays = durationMap[type] || 30;
    const code = License.generateCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365); // Code valid for 1 year

    const license = new License({
      code,
      type,
      durationDays,
      expiresAt,
      createdBy,
      metadata
    });

    await license.save();
    return license;
  }

  // Activate license for a user
  static async activateLicense(code, phoneNumber) {
    const license = await License.findOne({ code });

    if (!license) {
      throw new Error('Invalid license code');
    }

    if (license.isActivated) {
      throw new Error('License already activated');
    }

    if (new Date() > license.expiresAt) {
      throw new Error('License has expired');
    }

    // Activate the license
    await license.activate(phoneNumber);

    // Update user premium status
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({ phoneNumber });
    }

    await user.activatePremium(license.durationDays);

    return {
      success: true,
      user,
      license,
      message: `Premium activated successfully! Valid for ${license.durationDays} days.`
    };
  }

  // Check if user has active premium
  static async checkPremiumStatus(phoneNumber) {
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return { isPremium: false, message: 'User not found' };
    }

    const isActive = user.isPremiumActive();

    return {
      isPremium: isActive,
      expiresAt: user.premiumExpiry,
      daysRemaining: isActive
        ? Math.ceil((user.premiumExpiry - new Date()) / (1000 * 60 * 60 * 24))
        : 0
    };
  }

  // Get all licenses (admin only)
  static async getAllLicenses(filters = {}) {
    return await License.find(filters).sort({ createdAt: -1 });
  }

  // Bulk generate licenses
  static async bulkGenerateLicenses(count, type, createdBy = 'system') {
    const licenses = [];

    for (let i = 0; i < count; i++) {
      const license = await this.generateLicense(type, createdBy);
      licenses.push(license);
    }

    return licenses;
  }

  // Revoke premium from user
  static async revokePremium(phoneNumber) {
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      throw new Error('User not found');
    }

    user.isPremium = false;
    user.premiumExpiry = null;
    await user.save();

    return user;
  }
}
