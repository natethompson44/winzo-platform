const express = require('express')
const router = express.Router()
const { User, Transaction, sequelize } = require('../models')
const auth = require('../middleware/auth')
const { Op } = require('sequelize')

/**
 * GET /api/wallet/balance - Get user wallet balance
 */
router.get('/balance', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'walletBalance', 'updated_at']
    })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    res.json({
      success: true,
      data: {
        balance: user.walletBalance,
        username: user.username,
        lastUpdated: user.updated_at
      }
    })
  } catch (error) {
    console.error('Error fetching wallet balance:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet balance',
      message: error.message
    })
  }
})

/**
 * POST /api/wallet/deposit - Add funds to wallet
 */
router.post('/deposit', auth, async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const { amount, paymentMethod = 'demo' } = req.body
    const userId = req.user.id
    // Validate amount
    if (!amount || amount <= 0 || amount > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Deposit amount must be between $1 and $10,000'
      })
    }
    const user = await User.findByPk(userId, { transaction })
    if (!user) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    // Update balance
    const newBalance = user.walletBalance + amount
    await user.update({ walletBalance: newBalance }, { transaction })
    // Create transaction record
    await Transaction.create({
      user_id: userId,
      type: 'deposit',
      amount,
      description: `Deposit via ${paymentMethod}`,
      balance_after: newBalance,
      payment_method: paymentMethod
    }, { transaction })
    await transaction.commit()
    res.json({
      success: true,
      message: 'Deposit successful',
      data: {
        amount,
        newBalance,
        paymentMethod
      }
    })
    console.log(` User ${userId} deposited $${amount}`)
  } catch (error) {
    await transaction.rollback()
    console.error(' Error processing deposit:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process deposit',
      message: error.message
    })
  }
})

/**
 * POST /api/wallet/withdraw - Withdraw funds from wallet
 */
router.post('/withdraw', auth, async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const { amount, paymentMethod = 'demo' } = req.body
    const userId = req.user.id
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Withdrawal amount must be greater than 0'
      })
    }
    const user = await User.findByPk(userId, { transaction })
    if (!user) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    // Check sufficient balance
    if (user.walletBalance < amount) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds',
        available: user.walletBalance,
        requested: amount
      })
    }
    // Update balance
    const newBalance = user.walletBalance - amount
    await user.update({ walletBalance: newBalance }, { transaction })
    // Create transaction record
    await Transaction.create({
      user_id: userId,
      type: 'withdrawal',
      amount: -amount,
      description: `Withdrawal via ${paymentMethod}`,
      balance_after: newBalance,
      payment_method: paymentMethod
    }, { transaction })
    await transaction.commit()
    res.json({
      success: true,
      message: 'Withdrawal successful',
      data: {
        amount,
        newBalance,
        paymentMethod
      }
    })
    console.log(` User ${userId} withdrew $${amount}`)
  } catch (error) {
    await transaction.rollback()
    console.error(' Error processing withdrawal:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process withdrawal',
      message: error.message
    })
  }
})

/**
 * GET /api/wallet/transactions - Get transaction history
 */
router.get('/transactions', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const {
      type = null,
      limit = 50,
      offset = 0,
      startDate = null,
      endDate = null
    } = req.query
    // Build where clause
    const whereClause = { user_id: userId }
    if (type) {
      whereClause.type = type
    }
    if (startDate) {
      whereClause.created_at = {
        ...whereClause.created_at,
        [Op.gte]: new Date(startDate)
      }
    }
    if (endDate) {
      whereClause.created_at = {
        ...whereClause.created_at,
        [Op.lte]: new Date(endDate)
      }
    }
    const transactions = await Transaction.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
    res.json({
      success: true,
      data: transactions.rows,
      pagination: {
        total: transactions.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: transactions.count > (parseInt(offset) + parseInt(limit))
      }
    })
  } catch (error) {
    console.error(' Error fetching transactions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message
    })
  }
})

module.exports = router
