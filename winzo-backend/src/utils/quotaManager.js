/**
 * STRATEGIC API QUOTA MANAGEMENT SYSTEM
 * 
 * Prevents API quota exhaustion by implementing smart resource management
 */

class QuotaManager {
  constructor() {
    this.quotaLimit = 500; // The Odds API monthly limit
    this.quotaUsed = 0;
    this.priorities = {
      'epl': 1, // Highest priority
      'americanfootball_nfl': 1,
      'spain_la_liga': 2,
      'germany_bundesliga': 2,
      'italy_serie_a': 2
    };
  }

  canMakeRequest(sportKey) {
    const quotaRemaining = this.quotaLimit - this.quotaUsed;
    const priority = this.priorities[sportKey] || 5;
    
    // If quota is very low, only allow highest priority sports
    if (quotaRemaining <= 50) {
      return priority === 1;
    }
    
    return true;
  }

  recordRequest(sportKey) {
    this.quotaUsed++;
    console.log(`📊 Quota: ${this.quotaUsed}/${this.quotaLimit} used`);
  }

  getQuotaStatus() {
    const remaining = this.quotaLimit - this.quotaUsed;
    const percentage = Math.round((this.quotaUsed / this.quotaLimit) * 100);
    
    return {
      used: this.quotaUsed,
      remaining,
      percentage
    };
  }
}

const quotaManager = new QuotaManager();
module.exports = quotaManager; 