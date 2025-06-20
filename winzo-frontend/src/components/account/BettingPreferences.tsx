import React, { useState } from 'react';

interface BettingPreferencesForm {
  defaultStake: string;
  quickStakeAmounts: string[];
  oddsFormat: 'decimal' | 'fractional' | 'american';
  autoAcceptOddsChanges: boolean;
  enableNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  betConfirmations: boolean;
  winLossUpdates: boolean;
  promotionalOffers: boolean;
  favoritesSports: string[];
  favoritesTeams: string[];
}

const BettingPreferences: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<BettingPreferencesForm>({
    defaultStake: '10.00',
    quickStakeAmounts: ['5.00', '10.00', '25.00', '50.00', '100.00'],
    oddsFormat: 'decimal',
    autoAcceptOddsChanges: false,
    enableNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    betConfirmations: true,
    winLossUpdates: true,
    promotionalOffers: true,
    favoritesSports: ['Football', 'Basketball', 'Baseball'],
    favoritesTeams: ['Lakers', 'Yankees', 'Chiefs']
  });

  const [newStakeAmount, setNewStakeAmount] = useState('');
  const [newSport, setNewSport] = useState('');
  const [newTeam, setNewTeam] = useState('');

  const availableSports = [
    'Football', 'Basketball', 'Baseball', 'Soccer', 'Tennis', 
    'Hockey', 'Golf', 'Boxing', 'UFC', 'Cricket'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addStakeAmount = () => {
    if (newStakeAmount && !preferences.quickStakeAmounts.includes(newStakeAmount)) {
      setPreferences(prev => ({
        ...prev,
        quickStakeAmounts: [...prev.quickStakeAmounts, newStakeAmount].sort((a, b) => parseFloat(a) - parseFloat(b))
      }));
      setNewStakeAmount('');
    }
  };

  const removeStakeAmount = (amount: string) => {
    setPreferences(prev => ({
      ...prev,
      quickStakeAmounts: prev.quickStakeAmounts.filter(stake => stake !== amount)
    }));
  };

  const addFavoriteSport = () => {
    if (newSport && !preferences.favoritesSports.includes(newSport)) {
      setPreferences(prev => ({
        ...prev,
        favoritesSports: [...prev.favoritesSports, newSport]
      }));
      setNewSport('');
    }
  };

  const removeFavoriteSport = (sport: string) => {
    setPreferences(prev => ({
      ...prev,
      favoritesSports: prev.favoritesSports.filter(s => s !== sport)
    }));
  };

  const addFavoriteTeam = () => {
    if (newTeam && !preferences.favoritesTeams.includes(newTeam)) {
      setPreferences(prev => ({
        ...prev,
        favoritesTeams: [...prev.favoritesTeams, newTeam]
      }));
      setNewTeam('');
    }
  };

  const removeFavoriteTeam = (team: string) => {
    setPreferences(prev => ({
      ...prev,
      favoritesTeams: prev.favoritesTeams.filter(t => t !== team)
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success notification
    } catch (error) {
      console.error('Failed to save betting preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary">Betting Preferences</h2>
          <p className="text-secondary text-sm mt-1">
            Customize your betting experience and default settings
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Default Stake Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-primary">Default Stake Settings</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="defaultStake" className="form-label">
                  Default Stake Amount ($)
                </label>
                <input
                  type="number"
                  id="defaultStake"
                  name="defaultStake"
                  value={preferences.defaultStake}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  step="0.01"
                  placeholder="10.00"
                />
                <div className="form-help">
                  This amount will be pre-filled when placing bets
                </div>
              </div>
            </div>

            {/* Quick Stake Amounts */}
            <div className="mt-6">
              <label className="form-label">Quick Stake Amounts</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {preferences.quickStakeAmounts.map((amount) => (
                  <span
                    key={amount}
                    className="inline-flex items-center gap-1 bg-secondary px-3 py-1 rounded text-sm"
                  >
                    ${amount}
                    <button
                      onClick={() => removeStakeAmount(amount)}
                      className="text-error-600 hover:text-error-700 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newStakeAmount}
                  onChange={(e) => setNewStakeAmount(e.target.value)}
                  placeholder="Add amount"
                  className="form-input form-input-sm flex-1"
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={addStakeAmount}
                  className="btn btn-secondary btn-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Odds Display Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-primary">Odds Display Format</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-4 border border-primary rounded-lg cursor-pointer hover:bg-secondary">
                <input
                  type="radio"
                  name="oddsFormat"
                  value="decimal"
                  checked={preferences.oddsFormat === 'decimal'}
                  onChange={handleInputChange}
                  className="form-radio"
                />
                <div>
                  <div className="font-medium">Decimal</div>
                  <div className="text-sm text-secondary">1.85, 2.50, 3.75</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-primary rounded-lg cursor-pointer hover:bg-secondary">
                <input
                  type="radio"
                  name="oddsFormat"
                  value="fractional"
                  checked={preferences.oddsFormat === 'fractional'}
                  onChange={handleInputChange}
                  className="form-radio"
                />
                <div>
                  <div className="font-medium">Fractional</div>
                  <div className="text-sm text-secondary">17/20, 3/2, 11/4</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-primary rounded-lg cursor-pointer hover:bg-secondary">
                <input
                  type="radio"
                  name="oddsFormat"
                  value="american"
                  checked={preferences.oddsFormat === 'american'}
                  onChange={handleInputChange}
                  className="form-radio"
                />
                <div>
                  <div className="font-medium">American</div>
                  <div className="text-sm text-secondary">-118, +150, +275</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Auto-Accept Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-primary">Betting Behavior</h3>
          </div>
          <div className="card-body">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="autoAcceptOddsChanges"
                checked={preferences.autoAcceptOddsChanges}
                onChange={handleInputChange}
                className="form-checkbox"
              />
              <div>
                <div className="font-medium">Auto-accept odds changes</div>
                <div className="text-sm text-secondary">
                  Automatically accept better odds without confirmation
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-primary">Notification Preferences</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableNotifications"
                  checked={preferences.enableNotifications}
                  onChange={handleInputChange}
                  className="form-checkbox"
                />
                <div className="font-medium">Enable all notifications</div>
              </label>

              {preferences.enableNotifications && (
                <div className="ml-6 space-y-3 border-l-2 border-primary pl-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={preferences.emailNotifications}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    <div>Email notifications</div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="smsNotifications"
                      checked={preferences.smsNotifications}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    <div>SMS notifications</div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="betConfirmations"
                      checked={preferences.betConfirmations}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    <div>Bet placement confirmations</div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="winLossUpdates"
                      checked={preferences.winLossUpdates}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    <div>Win/loss updates</div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="promotionalOffers"
                      checked={preferences.promotionalOffers}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    <div>Promotional offers and bonuses</div>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Favorite Sports */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-primary">Favorite Sports</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-wrap gap-2 mb-4">
              {preferences.favoritesSports.map((sport) => (
                <span
                  key={sport}
                  className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 px-3 py-1 rounded text-sm"
                >
                  {sport}
                  <button
                    onClick={() => removeFavoriteSport(sport)}
                    className="text-primary-600 hover:text-primary-800 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                value={newSport}
                onChange={(e) => setNewSport(e.target.value)}
                className="form-select flex-1"
              >
                <option value="">Select a sport</option>
                {availableSports
                  .filter(sport => !preferences.favoritesSports.includes(sport))
                  .map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))
                }
              </select>
              <button
                onClick={addFavoriteSport}
                disabled={!newSport}
                className="btn btn-secondary btn-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Favorite Teams */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-primary">Favorite Teams</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-wrap gap-2 mb-4">
              {preferences.favoritesTeams.map((team) => (
                <span
                  key={team}
                  className="inline-flex items-center gap-1 bg-accent-100 text-accent-700 px-3 py-1 rounded text-sm"
                >
                  {team}
                  <button
                    onClick={() => removeFavoriteTeam(team)}
                    className="text-accent-600 hover:text-accent-800 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                placeholder="Enter team name"
                className="form-input flex-1"
              />
              <button
                onClick={addFavoriteTeam}
                disabled={!newTeam}
                className="btn btn-secondary btn-sm"
              >
                Add
              </button>
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
              '💾 Save Preferences'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BettingPreferences; 