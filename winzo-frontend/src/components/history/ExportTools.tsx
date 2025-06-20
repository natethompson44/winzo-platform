import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { BetHistory, BettingAnalytics, ExportOptions } from '../../types/betting';

interface ExportToolsProps {
  bets: BetHistory[];
  analytics: BettingAnalytics | null;
}

const ExportTools: React.FC<ExportToolsProps> = ({
  bets,
  analytics
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeAnalytics: false
  });

  const generateCSV = (data: BetHistory[], includeAnalytics: boolean = false) => {
    const headers = [
      'Date',
      'Sport',
      'Event',
      'Bet Type',
      'Selection',
      'Stake',
      'Odds',
      'Payout',
      'Status',
      'Net Result',
      'League',
      'Market'
    ];

    const csvRows = [headers.join(',')];

    // Add bet data
    data.forEach(bet => {
      const row = [
        bet.date,
        `"${bet.sport}"`,
        `"${bet.event}"`,
        `"${bet.betType}"`,
        `"${bet.selection || ''}"`,
        bet.stake.toString(),
        bet.odds.toString(),
        bet.payout.toString(),
        bet.status,
        (bet.payout - bet.stake).toString(),
        `"${bet.league || ''}"`,
        `"${bet.market || ''}"`
      ];
      csvRows.push(row.join(','));
    });

    // Add analytics summary if requested
    if (includeAnalytics && analytics) {
      csvRows.push('');
      csvRows.push('ANALYTICS SUMMARY');
      csvRows.push(`Total Bets,${analytics.totalBets}`);
      csvRows.push(`Total Stake,${analytics.totalStake}`);
      csvRows.push(`Total Payout,${analytics.totalPayout}`);
      csvRows.push(`Net Profit,${analytics.netProfit}`);
      csvRows.push(`Win Rate,${analytics.winRate}%`);
      csvRows.push(`ROI,${analytics.roi}%`);
      csvRows.push(`Average Stake,${analytics.averageStake}`);
      csvRows.push(`Average Odds,${analytics.averageOdds}`);
    }

    return csvRows.join('\n');
  };

  const generatePDF = async (data: BetHistory[], includeAnalytics: boolean = false) => {
    // Create HTML content for PDF
    const formatCurrency = (amount: number) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    let htmlContent = `
      <html>
        <head>
          <title>Betting History Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: var(--color-primary-600); }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .won { color: green; }
            .lost { color: red; }
            .pending { color: orange; }
            .analytics { margin: 20px 0; }
            .metric { display: inline-block; margin: 10px; padding: 10px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <h1>Betting History Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Sport</th>
                <th>Event</th>
                <th>Bet Type</th>
                <th>Stake</th>
                <th>Odds</th>
                <th>Payout</th>
                <th>Status</th>
                <th>Net Result</th>
              </tr>
            </thead>
            <tbody>
    `;

    data.forEach(bet => {
      const netResult = bet.payout - bet.stake;
      const statusClass = bet.status === 'won' ? 'won' : bet.status === 'lost' ? 'lost' : 'pending';
      
      htmlContent += `
        <tr>
          <td>${new Date(bet.date).toLocaleDateString()}</td>
          <td>${bet.sport}</td>
          <td>${bet.event}</td>
          <td>${bet.betType}</td>
          <td>${formatCurrency(bet.stake)}</td>
          <td>${bet.odds.toFixed(2)}</td>
          <td>${formatCurrency(bet.payout)}</td>
          <td class="${statusClass}">${bet.status.toUpperCase()}</td>
          <td class="${netResult >= 0 ? 'won' : 'lost'}">${formatCurrency(netResult)}</td>
        </tr>
      `;
    });

    htmlContent += '</tbody></table>';

    if (includeAnalytics && analytics) {
      htmlContent += `
        <div class="analytics">
          <h2>Analytics Summary</h2>
          <div class="metric">
            <strong>Total Bets:</strong> ${analytics.totalBets}
          </div>
          <div class="metric">
            <strong>Win Rate:</strong> ${analytics.winRate.toFixed(1)}%
          </div>
          <div class="metric">
            <strong>Net Profit:</strong> ${formatCurrency(analytics.netProfit)}
          </div>
          <div class="metric">
            <strong>ROI:</strong> ${analytics.roi.toFixed(1)}%
          </div>
        </div>
      `;
    }

    htmlContent += '</body></html>';

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportOptions.format === 'csv') {
        const csvContent = generateCSV(bets, exportOptions.includeAnalytics);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `betting-history-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (exportOptions.format === 'pdf') {
        await generatePDF(bets, exportOptions.includeAnalytics);
      }
      
      setShowExportDialog(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-tools">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowExportDialog(true)}
        disabled={bets.length === 0}
      >
        📊 Export Data
      </Button>

      {showExportDialog && (
        <div className="export-dialog-overlay">
          <Card className="export-dialog">
            <div className="dialog-header">
              <h3>Export Betting History</h3>
              <button
                className="close-button"
                onClick={() => setShowExportDialog(false)}
              >
                ×
              </button>
            </div>

            <div className="dialog-content">
              <div className="export-options">
                <div className="option-group">
                  <label className="option-label">Export Format</label>
                  <div className="radio-group">
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="format"
                        value="csv"
                        checked={exportOptions.format === 'csv'}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'csv' | 'pdf' }))}
                      />
                      <span>CSV (Excel compatible)</span>
                    </label>
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="format"
                        value="pdf"
                        checked={exportOptions.format === 'pdf'}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'csv' | 'pdf' }))}
                      />
                      <span>PDF (Print-ready report)</span>
                    </label>
                  </div>
                </div>

                <div className="option-group">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeAnalytics || false}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeAnalytics: e.target.checked }))}
                    />
                    <span>Include analytics summary</span>
                  </label>
                </div>

                <div className="export-summary">
                  <p>
                    <strong>{bets.length}</strong> bets will be exported
                  </p>
                  {exportOptions.includeAnalytics && analytics && (
                    <p>Plus analytics summary with key metrics</p>
                  )}
                </div>
              </div>
            </div>

            <div className="dialog-actions">
              <Button
                variant="ghost"
                onClick={() => setShowExportDialog(false)}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : `Export ${exportOptions.format.toUpperCase()}`}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExportTools; 