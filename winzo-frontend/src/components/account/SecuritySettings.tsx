import React, { useState } from 'react';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SecurityQuestion {
  id: string;
  question: string;
  answer: string;
}

interface LoginSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  timestamp: string;
  isCurrent: boolean;
}

const SecuritySettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordForm>>({});

  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([
    { id: '1', question: 'What was the name of your first pet?', answer: '' },
    { id: '2', question: 'What city were you born in?', answer: '' },
    { id: '3', question: 'What was your mother\'s maiden name?', answer: '' }
  ]);

  const [loginSessions] = useState<LoginSession[]>([
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'New York, NY',
      ip: '192.168.1.1',
      timestamp: '2024-01-15 14:30:00',
      isCurrent: true
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'New York, NY',
      ip: '192.168.1.2',
      timestamp: '2024-01-14 18:45:00',
      isCurrent: false
    },
    {
      id: '3',
      device: 'Chrome on Android',
      location: 'Los Angeles, CA',
      ip: '10.0.0.1',
      timestamp: '2024-01-12 09:15:00',
      isCurrent: false
    }
  ]);

  const predefinedQuestions = [
    'What was the name of your first pet?',
    'What city were you born in?',
    'What was your mother\'s maiden name?',
    'What was the make of your first car?',
    'What elementary school did you attend?',
    'What was your childhood nickname?',
    'What is your favorite book?',
    'What was the name of your first teacher?'
  ];

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (passwordErrors[name as keyof PasswordForm]) {
      setPasswordErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validatePassword = (): boolean => {
    const errors: Partial<PasswordForm> = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // Show success notification
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to generate QR code
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowQRCode(true);
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm2FA = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to confirm 2FA setup
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTwoFactorEnabled(true);
      setShowQRCode(false);
    } catch (error) {
      console.error('Failed to confirm 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTwoFactorEnabled(false);
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityQuestionChange = (id: string, field: 'question' | 'answer', value: string) => {
    setSecurityQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, [field]: value } : q)
    );
  };

  const handleTerminateSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // Remove session from list
    } catch (error) {
      console.error('Failed to terminate session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary">Security Settings</h2>
          <p className="text-secondary text-sm mt-1">
            Manage your account security and authentication preferences
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Account Verification Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-primary">Account Verification</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-success-50 border border-success-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-success-600">✓</span>
                  <div>
                    <div className="font-medium text-success-700">Email Verified</div>
                    <div className="text-sm text-success-600">john.doe@email.com</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-success-50 border border-success-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-success-600">✓</span>
                  <div>
                    <div className="font-medium text-success-700">Phone Verified</div>
                    <div className="text-sm text-success-600">+1 (555) 123-4567</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-warning-50 border border-warning-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-warning-600">⚠️</span>
                  <div>
                    <div className="font-medium text-warning-700">Identity Verification</div>
                    <div className="text-sm text-warning-600">Document verification pending</div>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm">
                  Upload Documents
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-primary">Change Password</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label required">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className={`form-input ${passwordErrors.currentPassword ? 'error' : ''}`}
                    placeholder="Enter your current password"
                  />
                  {passwordErrors.currentPassword && (
                    <div className="form-error">{passwordErrors.currentPassword}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label required">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className={`form-input ${passwordErrors.newPassword ? 'error' : ''}`}
                    placeholder="Enter your new password"
                  />
                  {passwordErrors.newPassword && (
                    <div className="form-error">{passwordErrors.newPassword}</div>
                  )}
                  <div className="form-help">
                    Password must be at least 8 characters with uppercase, lowercase, and number
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label required">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`form-input ${passwordErrors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm your new password"
                  />
                  {passwordErrors.confirmPassword && (
                    <div className="form-error">{passwordErrors.confirmPassword}</div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner mr-2"></span>
                      Changing Password...
                    </>
                  ) : (
                    '🔐 Change Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-primary">Two-Factor Authentication</h3>
            <p className="text-sm text-secondary mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="card-body">
            {!twoFactorEnabled ? (
              <div>
                <p className="text-sm text-secondary mb-4">
                  Two-factor authentication adds an extra layer of security by requiring a code 
                  from your phone in addition to your password.
                </p>
                
                {!showQRCode ? (
                  <button
                    onClick={handleEnable2FA}
                    disabled={isLoading}
                    className="btn btn-primary"
                  >
                    {isLoading ? (
                      <>
                        <span className="loading-spinner mr-2"></span>
                        Setting up...
                      </>
                    ) : (
                      '🔒 Enable 2FA'
                    )}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 border border-primary rounded-lg text-center">
                      <div className="w-32 h-32 bg-neutral-200 mx-auto mb-3 flex items-center justify-center rounded">
                        <span className="text-sm text-secondary">QR Code</span>
                      </div>
                      <p className="text-sm text-secondary">
                        Scan this QR code with your authenticator app
                      </p>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        Enter the 6-digit code from your authenticator app
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleConfirm2FA}
                        disabled={isLoading}
                        className="btn btn-primary"
                      >
                        {isLoading ? 'Confirming...' : 'Confirm & Enable'}
                      </button>
                      <button
                        onClick={() => setShowQRCode(false)}
                        className="btn btn-ghost"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 p-3 bg-success-50 border border-success-200 rounded-lg mb-4">
                  <span className="text-success-600">✓</span>
                  <div>
                    <div className="font-medium text-success-700">Two-Factor Authentication Enabled</div>
                    <div className="text-sm text-success-600">Your account is protected with 2FA</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button className="btn btn-secondary btn-sm">
                    🔄 Generate Backup Codes
                  </button>
                  <button
                    onClick={handleDisable2FA}
                    disabled={isLoading}
                    className="btn btn-danger btn-sm"
                  >
                    {isLoading ? 'Disabling...' : '🔓 Disable 2FA'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Questions */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-primary">Security Questions</h3>
            <p className="text-sm text-secondary mt-1">
              Set up security questions for account recovery
            </p>
          </div>
          <div className="card-body">
            <div className="space-y-6">
              {securityQuestions.map((sq, index) => (
                <div key={sq.id} className="space-y-3">
                  <div className="form-group">
                    <label className="form-label">
                      Security Question {index + 1}
                    </label>
                    <select
                      value={sq.question}
                      onChange={(e) => handleSecurityQuestionChange(sq.id, 'question', e.target.value)}
                      className="form-select"
                    >
                      {predefinedQuestions.map((question) => (
                        <option key={question} value={question}>
                          {question}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Answer</label>
                    <input
                      type="text"
                      value={sq.answer}
                      onChange={(e) => handleSecurityQuestionChange(sq.id, 'answer', e.target.value)}
                      className="form-input"
                      placeholder="Enter your answer"
                    />
                  </div>
                </div>
              ))}
              
              <button className="btn btn-primary">
                💾 Save Security Questions
              </button>
            </div>
          </div>
        </div>

        {/* Login History */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-primary">Active Sessions</h3>
            <p className="text-sm text-secondary mt-1">
              Manage your active login sessions
            </p>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {loginSessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    session.isCurrent ? 'border-success-200 bg-success-50' : 'border-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg">
                      {session.device.includes('iPhone') || session.device.includes('Android') ? '📱' : '💻'}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {session.device}
                        {session.isCurrent && (
                          <span className="text-xs bg-success-100 text-success-700 px-2 py-1 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-secondary">
                        {session.location} • {session.ip}
                      </div>
                      <div className="text-xs text-tertiary">
                        Last active: {session.timestamp}
                      </div>
                    </div>
                  </div>
                  
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleTerminateSession(session.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Terminate
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-primary">
              <button className="btn btn-danger btn-sm">
                🚪 Sign Out All Other Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings; 