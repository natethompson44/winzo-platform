const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { adminAuth, logAdminAction } = require('../middleware/adminAuth')
const User = require('../models/User')
const Bet = require('../models/Bet')
const Transaction = require('../models/Transaction')

// Apply admin authentication to all routes
router.use(adminAuth)

/**
 * GET /api/admin/dashboard
 * Get admin dashboard overview statistics
 */
router.get('/dashboard', logAdminAction('VIEW_DASHBOARD'), async (req, res) => {
  try {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    // User statistics
    const totalUsers = await User.count()
    const activeUsers = await User.count({ where: { is_active: true } })
    const newUsersToday = await User.count({
      where: {
        created_at: {
          [Op.gte]: today.setHours(0, 0, 0, 0)
        }
      }
    })

    // Betting statistics
    const totalBets = await Bet.count()
    const activeBets = await Bet.count({ where: { status: 'active' } })
    const settledBets = await Bet.count({ where: { status: 'settled' } })

    // Revenue calculations
    const totalRevenue = await Bet.sum('stake_amount', {
      where: { status: 'settled' }
    }) || 0

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newToday: newUsersToday,
          inactive: totalUsers - activeUsers
        },
        bets: {
          total: totalBets,
          active: activeBets,
          settled: settledBets
        },
        revenue: {
          total: parseFloat(totalRevenue.toFixed(2))
        }
      }
    })
  } catch (error) {
    console.error('Admin dashboard error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    })
  }
})

/**
 * GET /api/admin/users
 * Get paginated list of users with search and filter capabilities
 */
router.get('/users', logAdminAction('VIEW_USERS'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = '',
      role = '',
      status = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query

    const offset = (page - 1) * limit
    const whereClause = {}

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ]
    }

    // Add role filter
    if (role) {
      whereClause.role = role
    }

    // Add status filter
    if (status === 'active') {
      whereClause.is_active = true
    } else if (status === 'inactive') {
      whereClause.is_active = false
    }

    const { rows: users, count: totalUsers } = await User.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: {
        exclude: ['password_hash']
      }
    })

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: totalUsers,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalUsers / limit)
        }
      }
    })
  } catch (error) {
    console.error('Admin get users error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    })
  }
})

/**
 * PUT /api/admin/users/:id
 * Update user information (balance, status, role)
 */
router.put('/users/:id', logAdminAction('UPDATE_USER'), async (req, res) => {
  try {
    const userId = req.params.id
    const {
      wallet_balance,
      is_active,
      role,
      first_name,
      last_name,
      email,
      phone
    } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    const updateData = {}
    if (wallet_balance !== undefined) updateData.wallet_balance = wallet_balance
    if (is_active !== undefined) updateData.is_active = is_active
    if (role !== undefined) updateData.role = role
    if (first_name !== undefined) updateData.first_name = first_name
    if (last_name !== undefined) updateData.last_name = last_name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone

    await user.update(updateData)

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    })

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    })
  } catch (error) {
    console.error('Admin update user error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    })
  }
})

/**
 * GET /api/admin/bets
 * Get paginated list of all bets with search and filter capabilities
 */
router.get('/bets', logAdminAction('VIEW_BETS'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      status = '',
      userId = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query

    const offset = (page - 1) * limit
    const whereClause = {}

    if (status) {
      whereClause.status = status
    }
    if (userId) {
      whereClause.user_id = userId
    }

    const { rows: bets, count: totalBets } = await Bet.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['id', 'username', 'email']
      }],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.json({
      success: true,
      data: {
        bets,
        pagination: {
          total: totalBets,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalBets / limit)
        }
      }
    })
  } catch (error) {
    console.error('Admin get bets error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bets'
    })
  }
})

/**
 * PUT /api/admin/bets/:id
 * Manually settle bet
 */
router.put('/bets/:id', logAdminAction('SETTLE_BET'), async (req, res) => {
  try {
    const betId = req.params.id
    const { result, actual_payout, notes } = req.body

    const bet = await Bet.findByPk(betId, {
      include: [{ model: User }]
    })

    if (!bet) {
      return res.status(404).json({
        success: false,
        error: 'Bet not found'
      })
    }

    if (bet.status === 'settled') {
      return res.status(400).json({
        success: false,
        error: 'Bet is already settled'
      })
    }

    // Update bet
    await bet.update({
      status: 'settled',
      result, // 'win', 'loss', 'void'
      actual_payout: actual_payout || 0,
      settled_at: new Date(),
      notes: notes || null
    })

    // Update user balance if bet won
    if (result === 'win' && actual_payout > 0) {
      await bet.User.increment('wallet_balance', { by: actual_payout })

      // Create transaction record
      await Transaction.create({
        user_id: bet.user_id,
        type: 'bet_win',
        amount: actual_payout,
        status: 'completed',
        description: `Bet win payout - Bet ID: ${betId}`,
        reference_id: betId
      })
    }

    const updatedBet = await Bet.findByPk(betId, {
      include: [{ model: User, attributes: ['id', 'username', 'email'] }]
    })

    res.json({
      success: true,
      message: 'Bet settled successfully',
      data: updatedBet
    })
  } catch (error) {
    console.error('Admin settle bet error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to settle bet'
    })
  }
})

/**
 * GET /api/admin/transactions
 * Get paginated list of all transactions
 */
router.get('/transactions', logAdminAction('VIEW_TRANSACTIONS'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      type = '',
      status = '',
      userId = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query

    const offset = (page - 1) * limit
    const whereClause = {}

    if (type) whereClause.type = type
    if (status) whereClause.status = status
    if (userId) whereClause.user_id = userId

    const { rows: transactions, count: totalTransactions } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['id', 'username', 'email']
      }],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total: totalTransactions,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalTransactions / limit)
        }
      }
    })
  } catch (error) {
    console.error('Admin get transactions error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    })
  }
})

/**
 * GET /api/admin/analytics
 * Get comprehensive platform analytics
 */
router.get('/analytics', logAdminAction('VIEW_ANALYTICS'), async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query

    let dateFilter
    const now = new Date()

    switch (timeframe) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // User growth analytics
    const userGrowth = await User.findAll({
      attributes: [
        [User.sequelize.fn('DATE', User.sequelize.col('created_at')), 'date'],
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      where: {
        created_at: { [Op.gte]: dateFilter }
      },
      group: [User.sequelize.fn('DATE', User.sequelize.col('created_at'))],
      order: [[User.sequelize.fn('DATE', User.sequelize.col('created_at')), 'ASC']]
    })

    // Betting volume analytics
    const bettingVolume = await Bet.findAll({
      attributes: [
        [Bet.sequelize.fn('DATE', Bet.sequelize.col('created_at')), 'date'],
        [Bet.sequelize.fn('COUNT', Bet.sequelize.col('id')), 'bet_count'],
        [Bet.sequelize.fn('SUM', Bet.sequelize.col('stake_amount')), 'total_volume']
      ],
      where: {
        created_at: { [Op.gte]: dateFilter }
      },
      group: [Bet.sequelize.fn('DATE', Bet.sequelize.col('created_at'))],
      order: [[Bet.sequelize.fn('DATE', Bet.sequelize.col('created_at')), 'ASC']]
    })

    // Revenue analytics
    const revenueData = await Bet.findAll({
      attributes: [
        [Bet.sequelize.fn('DATE', Bet.sequelize.col('created_at')), 'date'],
        [Bet.sequelize.fn('SUM', Bet.sequelize.col('stake_amount')), 'revenue'],
        [Bet.sequelize.fn('SUM', Bet.sequelize.col('potential_payout')), 'potential_payouts']
      ],
      where: {
        created_at: { [Op.gte]: dateFilter },
        status: 'settled'
      },
      group: [Bet.sequelize.fn('DATE', Bet.sequelize.col('created_at'))],
      order: [[Bet.sequelize.fn('DATE', Bet.sequelize.col('created_at')), 'ASC']]
    })

    // Top users by betting volume
    const topUsers = await User.findAll({
      attributes: [
        'id', 'username', 'email',
        [User.sequelize.fn('COUNT', User.sequelize.col('Bets.id')), 'bet_count'],
        [User.sequelize.fn('SUM', User.sequelize.col('Bets.stake_amount')), 'total_volume']
      ],
      include: [{
        model: Bet,
        attributes: [],
        where: { created_at: { [Op.gte]: dateFilter } }
      }],
      group: ['User.id'],
      order: [[User.sequelize.fn('SUM', User.sequelize.col('Bets.stake_amount')), 'DESC']],
      limit: 10
    })

    res.json({
      success: true,
      data: {
        timeframe,
        userGrowth,
        bettingVolume,
        revenueData,
        topUsers
      }
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data'
    })
  }
})

/**
 * POST /api/admin/announcements
 * Create platform announcements
 */
router.post('/announcements', logAdminAction('CREATE_ANNOUNCEMENT'), async (req, res) => {
  try {
    const { title, message, type = 'info', target = 'all' } = req.body

    // For now, we'll just return success - in a real implementation,
    // you'd want to store this in a database and have a notification system
    const announcement = {
      id: Date.now(), // Simple ID for demo
      title,
      message,
      type,
      target,
      created_by: req.user.id,
      created_at: new Date()
    }

    console.log('Admin created announcement:', announcement)

    res.json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    })
  } catch (error) {
    console.error('Admin create announcement error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create announcement'
    })
  }
})

module.exports = router
