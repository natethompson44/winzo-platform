const { User, Transaction } = require('../models')
const Bet = require('../models/Bet')
const sequelize = require('../../config/database')

/**
 * WalletService manages all WINZO Wallet operations including balance updates,
 * bet processing, transaction history, and financial integrity. This service
 * ensures secure handling of user funds and maintains accurate balance tracking
 * across all betting activities on the WINZO platform.
 */
class WalletService {
  /**
   * Get user's current WINZO Wallet balance
   * @param {string} userId - User ID
   * @returns {Promise<number>} Current wallet balance
   */
  async getBalance (userId) {
    try {
      const user = await User.findByPk(userId)
      if (!user) {
        throw new Error('WINZO user not found')
      }

      return parseFloat(user.walletBalance)
    } catch (error) {
      console.error('WINZO Wallet: Error getting balance:', error.message)
      throw new Error('Failed to retrieve WINZO Wallet balance')
    }
  }

  /**
   * Add funds to user's WINZO Wallet
   * @param {string} userId - User ID
   * @param {number} amount - Amount to add
   * @param {string} reason - Reason for credit (e.g., 'bet_win', 'admin_credit')
   * @returns {Promise<Object>} Updated balance and transaction details
   */
  async addFunds (userId, amount, reason = 'manual_credit') {
    const t = await sequelize.transaction()
    try {
      const user = await User.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE })
      if (!user) {
        throw new Error('WINZO user not found')
      }

      const previousBalance = parseFloat(user.walletBalance)
      const newBalance = previousBalance + parseFloat(amount)

      await user.update({ walletBalance: newBalance }, { transaction: t })

      await t.commit()

      console.log(`WINZO Wallet: Added $${amount} to user ${user.username} (${reason})`)
      console.log(`WINZO Wallet: Balance updated from $${previousBalance} to $${newBalance}`)

      return {
        userId,
        username: user.username,
        previousBalance,
        amount: parseFloat(amount),
        newBalance,
        reason,
        timestamp: new Date()
      }
    } catch (error) {
      await t.rollback()
      console.error('WINZO Wallet: Error adding funds:', error.message)
      throw new Error('Failed to add funds to WINZO Wallet')
    }
  }

  /**
   * Deduct funds from user's WINZO Wallet
   * @param {string} userId - User ID
   * @param {number} amount - Amount to deduct
   * @param {string} reason - Reason for debit (e.g., 'bet_placed', 'admin_debit')
   * @returns {Promise<Object>} Updated balance and transaction details
   */
  async deductFunds (userId, amount, reason = 'manual_debit') {
    const t = await sequelize.transaction()
    try {
      const user = await User.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE })
      if (!user) {
        throw new Error('WINZO user not found')
      }

      const previousBalance = parseFloat(user.walletBalance)
      const deductAmount = parseFloat(amount)

      if (previousBalance < deductAmount) {
        throw new Error('Insufficient WINZO Wallet balance')
      }

      const newBalance = previousBalance - deductAmount
      await user.update({ walletBalance: newBalance }, { transaction: t })

      await t.commit()

      console.log(`WINZO Wallet: Deducted $${amount} from user ${user.username} (${reason})`)
      console.log(`WINZO Wallet: Balance updated from $${previousBalance} to $${newBalance}`)

      return {
        userId,
        username: user.username,
        previousBalance,
        amount: deductAmount,
        newBalance,
        reason,
        timestamp: new Date()
      }
    } catch (error) {
      await t.rollback()
      console.error('WINZO Wallet: Error deducting funds:', error.message)
      throw new Error('Failed to deduct funds from WINZO Wallet')
    }
  }

  /**
   * Process bet placement - deduct stake from WINZO Wallet
   * @param {string} userId - User ID
   * @param {number} betAmount - Amount to bet
   * @returns {Promise<Object>} Transaction details
   */
  async processBetPlacement (userId, betAmount) {
    try {
      const result = await this.deductFunds(userId, betAmount, 'bet_placed')

      console.log(`WINZO: Processed bet placement of $${betAmount} for user ${result.username}`)

      return result
    } catch (error) {
      console.error('WINZO: Error processing bet placement:', error.message)
      throw error
    }
  }

  /**
   * Process bet settlement - add winnings to WINZO Wallet
   * @param {string} userId - User ID
   * @param {number} payout - Amount to pay out
   * @param {string} betId - Bet ID for reference
   * @returns {Promise<Object>} Transaction details
   */
  async processBetWin (userId, payout, betId) {
    try {
      const result = await this.addFunds(userId, payout, `bet_win_${betId}`)

      console.log(`WINZO: Processed bet win payout of $${payout} for user ${result.username}`)

      return result
    } catch (error) {
      console.error('WINZO: Error processing bet win:', error.message)
      throw error
    }
  }

  /**
   * Get user's betting statistics and wallet activity
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User betting and wallet statistics
   */
  async getUserStats (userId) {
    try {
      const user = await User.findByPk(userId)
      if (!user) {
        throw new Error('WINZO user not found')
      }

      // Get betting statistics
      const totalBets = await Bet.count({ where: { user_id: userId } })
      const pendingBets = await Bet.count({ where: { user_id: userId, status: 'pending' } })
      const wonBets = await Bet.count({ where: { user_id: userId, status: 'won' } })
      const lostBets = await Bet.count({ where: { user_id: userId, status: 'lost' } })

      // Calculate total amounts
      const totalWagered = await Bet.sum('amount', { where: { user_id: userId } }) || 0
      const totalWinnings = await Bet.sum('actualPayout', {
        where: { user_id: userId, status: 'won' }
      }) || 0

      // Get recent bets
      const recentBets = await Bet.findAll({
        where: { user_id: userId },
        order: [['placedAt', 'DESC']],
        limit: 10,
        include: ['sportsEvent']
      })

      return {
        userId,
        username: user.username,
        walletBalance: parseFloat(user.walletBalance),
        betting: {
          totalBets,
          pendingBets,
          wonBets,
          lostBets,
          winRate: totalBets > 0 ? ((wonBets / (wonBets + lostBets)) * 100).toFixed(2) : 0,
          totalWagered: parseFloat(totalWagered),
          totalWinnings: parseFloat(totalWinnings),
          netProfit: parseFloat(totalWinnings) - parseFloat(totalWagered)
        },
        recentBets: recentBets.map(bet => ({
          id: bet.id,
          event: bet.sportsEvent ? `${bet.sportsEvent.homeTeam} vs ${bet.sportsEvent.awayTeam}` : bet.game,
          market: bet.market,
          outcome: bet.outcome,
          amount: parseFloat(bet.amount),
          odds: bet.odds,
          status: bet.status,
          placedAt: bet.placedAt
        }))
      }
    } catch (error) {
      console.error('WINZO: Error getting user stats:', error.message)
      throw new Error('Failed to retrieve WINZO user statistics')
    }
  }

  /**
   * Validate if user has sufficient balance for a bet
   * @param {string} userId - User ID
   * @param {number} betAmount - Amount to validate
   * @returns {Promise<boolean>} Whether user has sufficient balance
   */
  async validateBalance (userId, betAmount) {
    try {
      const balance = await this.getBalance(userId)
      return balance >= parseFloat(betAmount)
    } catch (error) {
      console.error('WINZO Wallet: Error validating balance:', error.message)
      return false
    }
  }
}

module.exports = new WalletService()
