import React, { useState } from 'react';

interface ResponsibleGamingSettings {
  depositLimits: {
    daily: string;
    weekly: string;
    monthly: string;
  };
  lossLimits: {
    daily: string;
    weekly: string;
    monthly: string;
  };
  sessionTimeLimit: string;
  realityCheckInterval: string;
  selfExclusionPeriod: string;
  enableRealityCheck: boolean;
  enableSessionAlerts: boolean;
}

const ResponsibleGaming: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSelfExclusionModal, setShowSelfExclusionModal] = useState(false);
  const [settings, setSettings] = useState<ResponsibleGamingSettings>({
    depositLimits: {
      daily: '100.00',
      weekly: '500.00',
      monthly: '2000.00'
    },
    lossLimits: {
      daily: '50.00',
      weekly: '200.00',
      monthly: '800.00'
    },
    sessionTimeLimit: '120',
    realityCheckInterval: '30',
    selfExclusionPeriod: '',
    enableRealityCheck: true,
    enableSessionAlerts: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ResponsibleGamingSettings] as any,
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success notification
    } catch (error) {
      console.error('Failed to save responsible gaming settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelfExclusion = async (period: string) => {
    setIsLoading(true);
    try {
      // Simulate API call for self-exclusion
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowSelfExclusionModal(false);
      // Show confirmation and redirect
    } catch (error) {
      console.error('Failed to set self-exclusion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const supportResources = [
    {
      name: 'National Council on Problem Gambling',
      phone: '1-800-522-4700',
      website: 'ncpgambling.org',
      description: '24/7 confidential help line'
    },
    {
      name: 'Gamblers Anonymous',
      phone: '1-855-222-5542',
      website: 'gamblersanonymous.org',
      description: 'Support groups and recovery program'
    },
    {
      name: 'GamCare',
      phone: '0808 8020 133',
      website: 'gamcare.org.uk',
      description: 'Free support and counseling'
    },
    {
      name: 'BeGambleAware',
      website: 'begambleaware.org',
      description: 'Information and support tools'
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary">Responsible Gaming</h2>
          <p className="text-secondary text-sm mt-1">
            Set limits and controls to help maintain healthy gaming habits
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Deposit Limits */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-primary">Deposit Limits</h3>
            <p className="text-sm text-secondary mt-1">
              Set maximum amounts you can deposit to your account
            </p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="form-group">
                <label htmlFor="depositLimits.daily" className="form-label">
                  Daily Limit ($)
                </label>
                <input
                  type="number"
                  id="depositLimits.daily"
                  name="depositLimits.daily"
                  value={settings.depositLimits.daily}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  step="0.01"
                  placeholder="100.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="depositLimits.weekly" className="form-label">
                  Weekly Limit ($)
                </label>
                <input
                  type="number"
                  id="depositLimits.weekly"
                  name="depositLimits.weekly"
                  value={settings.depositLimits.weekly}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  step="0.01"
                  placeholder="500.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="depositLimits.monthly" className="form-label">
                  Monthly Limit ($)
                </label>
                <input
                  type="number"
                  id="depositLimits.monthly"
                  name="depositLimits.monthly"
                  value={settings.depositLimits.monthly}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  step="0.01"
                  placeholder="2000.00"
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <p className="text-sm text-warning-700">
                💡 <strong>Note:</strong> Limit increases take effect after 24 hours. 
                Limit decreases are effective immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Loss Limits */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-primary">Loss Limits</h3>
            <p className="text-sm text-secondary mt-1">
              Set maximum amounts you can lose in a given period
            </p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="form-group">
                <label htmlFor="lossLimits.daily" className="form-label">
                  Daily Loss Limit ($)
                </label>
                <input
                  type="number"
                  id="lossLimits.daily"
                  name="lossLimits.daily"
                  value={settings.lossLimits.daily}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  step="0.01"
                  placeholder="50.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lossLimits.weekly" className="form-label">
                  Weekly Loss Limit ($)
                </label>
                <input
                  type="number"
                  id="lossLimits.weekly"
                  name="lossLimits.weekly"
                  value={settings.lossLimits.weekly}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  step="0.01"
                  placeholder="200.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lossLimits.monthly" className="form-label">
                  Monthly Loss Limit ($)
                </label>
                <input
                  type="number"
                  id="lossLimits.monthly"
                  name="lossLimits.monthly"
                  value={settings.lossLimits.monthly}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  step="0.01"
                  placeholder="800.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Session Controls */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-primary">Session Controls</h3>
            <p className="text-sm text-secondary mt-1">
              Manage your gaming session duration and alerts
            </p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="sessionTimeLimit" className="form-label">
                  Session Time Limit (minutes)
                </label>
                <select
                  id="sessionTimeLimit"
                  name="sessionTimeLimit"
                  value={settings.sessionTimeLimit}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">No limit</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                  <option value="240">4 hours</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="realityCheckInterval" className="form-label">
                  Reality Check Interval (minutes)
                </label>
                <select
                  id="realityCheckInterval"
                  name="realityCheckInterval"
                  value={settings.realityCheckInterval}
                  onChange={handleInputChange}
                  className="form-select"
                  disabled={!settings.enableRealityCheck}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableRealityCheck"
                  checked={settings.enableRealityCheck}
                  onChange={handleInputChange}
                  className="form-checkbox"
                />
                <div>
                  <div className="font-medium">Enable Reality Check</div>
                  <div className="text-sm text-secondary">
                    Regular reminders showing your session time and spending
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableSessionAlerts"
                  checked={settings.enableSessionAlerts}
                  onChange={handleInputChange}
                  className="form-checkbox"
                />
                <div>
                  <div className="font-medium">Enable Session Alerts</div>
                  <div className="text-sm text-secondary">
                    Notifications when approaching time or spending limits
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Self-Exclusion */}
        <div className="card border-error-200">
          <div className="card-header bg-error-50">
            <h3 className="font-semibold text-error-700">Self-Exclusion</h3>
            <p className="text-sm text-error-600 mt-1">
              Temporarily or permanently exclude yourself from gaming
            </p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <p className="text-sm text-secondary">
                Self-exclusion will prevent you from accessing your account for the selected period. 
                This action cannot be undone early.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setShowSelfExclusionModal(true)}
                  className="btn btn-secondary btn-sm"
                >
                  24 Hours
                </button>
                <button
                  onClick={() => setShowSelfExclusionModal(true)}
                  className="btn btn-secondary btn-sm"
                >
                  1 Week
                </button>
                <button
                  onClick={() => setShowSelfExclusionModal(true)}
                  className="btn btn-secondary btn-sm"
                >
                  1 Month
                </button>
                <button
                  onClick={() => setShowSelfExclusionModal(true)}
                  className="btn btn-danger btn-sm"
                >
                  Permanent
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Support Resources */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-primary">Support Resources</h3>
            <p className="text-sm text-secondary mt-1">
              Professional help and support organizations
            </p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportResources.map((resource, index) => (
                <div key={index} className="p-4 border border-primary rounded-lg">
                  <h4 className="font-medium text-primary mb-2">{resource.name}</h4>
                  <p className="text-sm text-secondary mb-2">{resource.description}</p>
                  <div className="space-y-1">
                    {resource.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <span>📞</span>
                        <a href={`tel:${resource.phone}`} className="text-interactive-primary hover:underline">
                          {resource.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <span>🌐</span>
                      <a
                        href={`https://${resource.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-interactive-primary hover:underline"
                      >
                        {resource.website}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <>
                <span className="loading-spinner mr-2"></span>
                Saving...
              </>
            ) : (
              '💾 Save Settings'
            )}
          </button>
        </div>
      </div>

      {/* Self-Exclusion Confirmation Modal */}
      {showSelfExclusionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal">
          <div className="card max-w-md w-full mx-4">
            <div className="card-header bg-error-50 border-b border-error-200">
              <h3 className="font-semibold text-error-700">⚠️ Confirm Self-Exclusion</h3>
            </div>
            <div className="card-body">
              <p className="text-sm text-secondary mb-4">
                Are you sure you want to self-exclude from your account? This action cannot be reversed early.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSelfExclusion('24h')}
                  disabled={isLoading}
                  className="btn btn-danger flex-1"
                >
                  {isLoading ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowSelfExclusionModal(false)}
                  disabled={isLoading}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsibleGaming; 