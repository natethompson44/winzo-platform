import React from 'react';

export interface LiveIndicatorProps {
  isLive: boolean;
  showPulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  isLive,
  showPulse = true,
  size = 'md',
  className = ''
}) => {
  if (!isLive) {
    return null;
  }

  return (
    <div className={`live-indicator ${className}`.trim()}>
      {showPulse && (
        <div className="pulse" aria-hidden="true"></div>
      )}
      <span className="live-text">LIVE</span>
    </div>
  );
};

export default LiveIndicator; 