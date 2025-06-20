const express = require('express')
const { Op } = require('sequelize')
const { sequelize } = require('../models')
const Bet = require('../models/Bet')
const SportsEvent = require('../models/SportsEvent')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

/**
 * GET /api/analytics/charts - Get chart data for performance graphs
 */
router.get('/charts', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const { timeRange = '6months', chartType = 'all' } = req.query

    // Calculate date range
    const now = new Date()
    let startDate
    switch (timeRange) {
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
        break
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    }

    // Get all bets for the user in the time range
    const bets = await Bet.findAll({
      where: {
        user_id: userId,
        placed_at: {
          [Op.gte]: startDate
        }
      },
      include: [{
        model: SportsEvent,
        as: 'sportsEvent',
        attributes: ['sport_key', 'home_team', 'away_team', 'commence_time']
      }],
      order: [['placed_at', 'ASC']]
    })

    // Prepare chart data
    const chartData = {}

    // 1. Profit over time chart
    if (chartType === 'all' || chartType === 'profit') {
      chartData.profitOverTime = generateProfitOverTimeData(bets, timeRange)
    }

    // 2. Win/Loss distribution
    if (chartType === 'all' || chartType === 'distribution') {
      chartData.winLossDistribution = generateWinLossDistribution(bets)
    }

    // 3. Sports breakdown
    if (chartType === 'all' || chartType === 'sports') {
      chartData.sportsBreakdown = generateSportsBreakdown(bets)
    }

    // 4. Bet type performance
    if (chartType === 'all' || chartType === 'bettypes') {
      chartData.betTypePerformance = generateBetTypePerformance(bets)
    }

    // 5. Stake distribution
    if (chartType === 'all' || chartType === 'stakes') {
      chartData.stakeDistribution = generateStakeDistribution(bets)
    }

    // 6. Monthly performance
    if (chartType === 'all' || chartType === 'monthly') {
      chartData.monthlyPerformance = generateMonthlyPerformance(bets)
    }

    res.json({
      success: true,
      message: 'Chart data retrieved successfully',
      data: chartData,
      metadata: {
        timeRange,
        totalBets: bets.length,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString()
        }
      }
    })
  } catch (error) {
    console.error('Error fetching chart data:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * GET /api/analytics/summary - Get advanced analytics summary
 */
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const { period = 'all' } = req.query

    // Calculate date range
    let whereClause = { user_id: userId }
    if (period !== 'all') {
      const now = new Date()
      let startDate
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
      }
      if (startDate) {
        whereClause.placed_at = { [Op.gte]: startDate }
      }
    }

    // Get comprehensive betting data
    const bets = await Bet.findAll({
      where: whereClause,
      include: [{
        model: SportsEvent,
        as: 'sportsEvent',
        attributes: ['sport_key', 'home_team', 'away_team', 'commence_time']
      }],
      order: [['placed_at', 'ASC']]
    })

    // Calculate comprehensive analytics
    const analytics = await calculateComprehensiveAnalytics(bets)

    res.json({
      success: true,
      message: 'Analytics summary retrieved successfully',
      data: analytics,
      metadata: {
        period,
        totalBets: bets.length,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching analytics summary:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * GET /api/analytics/export - Export analytics data (CSV format)
 */
router.get('/export', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const { format = 'csv', includeCharts = false } = req.query

    // Get all user bets
    const bets = await Bet.findAll({
      where: { user_id: userId },
      include: [{
        model: SportsEvent,
        as: 'sportsEvent',
        attributes: ['sport_key', 'home_team', 'away_team', 'commence_time']
      }],
      order: [['placed_at', 'DESC']]
    })

    if (format === 'csv') {
      const csvData = generateCSVExport(bets, includeCharts)
      
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="winzo-analytics-${new Date().toISOString().split('T')[0]}.csv"`)
      res.send(csvData)
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format'
      })
    }
  } catch (error) {
    console.error('Error exporting analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Helper Functions

function generateProfitOverTimeData(bets, timeRange) {
  const groupedData = {}
  let runningProfit = 0
  
  bets.forEach(bet => {
    const date = new Date(bet.placed_at)
    let dateKey
    
    // Group by appropriate time period
    switch (timeRange) {
      case '1month':
        dateKey = date.toISOString().split('T')[0] // Daily
        break
      case '3months':
      case '6months':
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` // Monthly
        break
      case '1year':
        dateKey = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}` // Quarterly
        break
      default:
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }
    
    if (!groupedData[dateKey]) {
      groupedData[dateKey] = { profit: 0, bets: 0 }
    }
    
    const betProfit = bet.status === 'won' ? 
      parseFloat(bet.potential_payout || 0) - parseFloat(bet.stake || 0) :
      bet.status === 'lost' ? -parseFloat(bet.stake || 0) : 0
    
    groupedData[dateKey].profit += betProfit
    groupedData[dateKey].bets += 1
    runningProfit += betProfit
  })
  
  return Object.keys(groupedData).sort().map(date => ({
    date,
    profit: groupedData[date].profit,
    bets: groupedData[date].bets,
    runningProfit
  }))
}

function generateWinLossDistribution(bets) {
  const distribution = { won: 0, lost: 0, pending: 0 }
  bets.forEach(bet => {
    distribution[bet.status]++
  })
  return distribution
}

function generateSportsBreakdown(bets) {
  const breakdown = {}
  bets.forEach(bet => {
    const sport = bet.sportsEvent?.sport_key || 'Unknown'
    if (!breakdown[sport]) {
      breakdown[sport] = { bets: 0, profit: 0, winRate: 0 }
    }
    breakdown[sport].bets++
    
    if (bet.status === 'won') {
      breakdown[sport].profit += parseFloat(bet.potential_payout || 0) - parseFloat(bet.stake || 0)
    } else if (bet.status === 'lost') {
      breakdown[sport].profit -= parseFloat(bet.stake || 0)
    }
  })
  
  // Calculate win rates
  Object.keys(breakdown).forEach(sport => {
    const sportBets = bets.filter(bet => (bet.sportsEvent?.sport_key || 'Unknown') === sport)
    const wins = sportBets.filter(bet => bet.status === 'won').length
    const settled = sportBets.filter(bet => bet.status !== 'pending').length
    breakdown[sport].winRate = settled > 0 ? (wins / settled) * 100 : 0
  })
  
  return breakdown
}

function generateBetTypePerformance(bets) {
  const performance = {}
  bets.forEach(bet => {
    const betType = bet.bet_type || 'straight'
    if (!performance[betType]) {
      performance[betType] = { bets: 0, profit: 0, winRate: 0 }
    }
    performance[betType].bets++
    
    if (bet.status === 'won') {
      performance[betType].profit += parseFloat(bet.potential_payout || 0) - parseFloat(bet.stake || 0)
    } else if (bet.status === 'lost') {
      performance[betType].profit -= parseFloat(bet.stake || 0)
    }
  })
  
  // Calculate win rates
  Object.keys(performance).forEach(betType => {
    const typeBets = bets.filter(bet => (bet.bet_type || 'straight') === betType)
    const wins = typeBets.filter(bet => bet.status === 'won').length
    const settled = typeBets.filter(bet => bet.status !== 'pending').length
    performance[betType].winRate = settled > 0 ? (wins / settled) * 100 : 0
  })
  
  return performance
}

function generateStakeDistribution(bets) {
  const ranges = {
    'under_10': { min: 0, max: 10, count: 0 },
    '10_25': { min: 10, max: 25, count: 0 },
    '25_50': { min: 25, max: 50, count: 0 },
    '50_100': { min: 50, max: 100, count: 0 },
    'over_100': { min: 100, max: Infinity, count: 0 }
  }
  
  bets.forEach(bet => {
    const stake = parseFloat(bet.stake || 0)
    Object.keys(ranges).forEach(range => {
      const { min, max } = ranges[range]
      if (stake >= min && stake < max) {
        ranges[range].count++
      }
    })
  })
  
  return ranges
}

function generateMonthlyPerformance(bets) {
  const monthly = {}
  bets.forEach(bet => {
    const date = new Date(bet.placed_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthly[monthKey]) {
      monthly[monthKey] = { bets: 0, profit: 0, stake: 0 }
    }
    
    monthly[monthKey].bets++
    monthly[monthKey].stake += parseFloat(bet.stake || 0)
    
    if (bet.status === 'won') {
      monthly[monthKey].profit += parseFloat(bet.potential_payout || 0) - parseFloat(bet.stake || 0)
    } else if (bet.status === 'lost') {
      monthly[monthKey].profit -= parseFloat(bet.stake || 0)
    }
  })
  
  return monthly
}

async function calculateComprehensiveAnalytics(bets) {
  const totalBets = bets.length
  const totalStake = bets.reduce((sum, bet) => sum + parseFloat(bet.stake || 0), 0)
  const wonBets = bets.filter(bet => bet.status === 'won')
  const lostBets = bets.filter(bet => bet.status === 'lost')
  const pendingBets = bets.filter(bet => bet.status === 'pending')
  
  const totalWinnings = wonBets.reduce((sum, bet) => sum + parseFloat(bet.potential_payout || 0), 0)
  const netProfit = totalWinnings - totalStake
  const winRate = (wonBets.length + lostBets.length) > 0 ? (wonBets.length / (wonBets.length + lostBets.length)) * 100 : 0
  const roi = totalStake > 0 ? (netProfit / totalStake) * 100 : 0
  
  // Calculate streaks
  let currentStreak = { type: 'none', count: 0 }
  let longestWinStreak = 0
  let longestLoseStreak = 0
  let tempWinStreak = 0
  let tempLoseStreak = 0
  
  bets.slice().reverse().forEach(bet => {
    if (bet.status === 'won') {
      tempWinStreak++
      tempLoseStreak = 0
      longestWinStreak = Math.max(longestWinStreak, tempWinStreak)
      if (currentStreak.type !== 'win') {
        currentStreak = { type: 'win', count: tempWinStreak }
      }
    } else if (bet.status === 'lost') {
      tempLoseStreak++
      tempWinStreak = 0
      longestLoseStreak = Math.max(longestLoseStreak, tempLoseStreak)
      if (currentStreak.type !== 'loss') {
        currentStreak = { type: 'loss', count: tempLoseStreak }
      }
    }
  })
  
  return {
    totalBets,
    totalStake,
    totalWinnings,
    netProfit,
    winRate,
    roi,
    averageStake: totalBets > 0 ? totalStake / totalBets : 0,
    averageOdds: bets.length > 0 ? bets.reduce((sum, bet) => sum + parseFloat(bet.odds || 0), 0) / bets.length : 0,
    betsWon: wonBets.length,
    betsLost: lostBets.length,
    betsPending: pendingBets.length,
    longestWinStreak,
    longestLoseStreak,
    currentStreak,
    biggestWin: wonBets.length > 0 ? Math.max(...wonBets.map(bet => parseFloat(bet.potential_payout || 0) - parseFloat(bet.stake || 0))) : 0,
    biggestLoss: lostBets.length > 0 ? Math.max(...lostBets.map(bet => parseFloat(bet.stake || 0))) : 0,
    profitByMonth: generateMonthlyPerformance(bets),
    sportBreakdown: generateSportsBreakdown(bets),
    betTypeBreakdown: generateBetTypePerformance(bets)
  }
}

function generateCSVExport(bets, includeCharts) {
  const headers = [
    'Date',
    'Sport',
    'Event',
    'Bet Type',
    'Market',
    'Selection',
    'Stake',
    'Odds',
    'Potential Payout',
    'Actual Payout',
    'Status',
    'Profit/Loss'
  ]
  
  let csvContent = headers.join(',') + '\n'
  
  bets.forEach(bet => {
    const profitLoss = bet.status === 'won' ? 
      parseFloat(bet.potential_payout || 0) - parseFloat(bet.stake || 0) :
      bet.status === 'lost' ? -parseFloat(bet.stake || 0) : 0
    
    const row = [
      new Date(bet.placed_at).toISOString().split('T')[0],
      bet.sportsEvent?.sport_key || 'Unknown',
      `"${bet.sportsEvent?.home_team || 'Unknown'} vs ${bet.sportsEvent?.away_team || 'Unknown'}"`,
      bet.bet_type || 'straight',
      bet.market_type || 'h2h',
      `"${bet.selected_team || 'Unknown'}"`,
      bet.stake || 0,
      bet.odds || 0,
      bet.potential_payout || 0,
      bet.status === 'won' ? bet.potential_payout || 0 : 0,
      bet.status,
      profitLoss
    ]
    
    csvContent += row.join(',') + '\n'
  })
  
  if (includeCharts) {
    csvContent += '\n\n--- ANALYTICS SUMMARY ---\n'
    const analytics = calculateComprehensiveAnalytics(bets)
    csvContent += `Total Bets,${analytics.totalBets}\n`
    csvContent += `Win Rate,${analytics.winRate.toFixed(2)}%\n`
    csvContent += `Net Profit,${analytics.netProfit.toFixed(2)}\n`
    csvContent += `ROI,${analytics.roi.toFixed(2)}%\n`
  }
  
  return csvContent
}

module.exports = router
