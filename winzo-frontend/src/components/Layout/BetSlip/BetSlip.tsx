import React from 'react';
import { createResponsiveComponent } from '../../responsive/ResponsiveComponentFactory';
import { MobileBetSlip } from './BetSlip.mobile';
import { DesktopBetSlip } from './BetSlip.desktop';

export interface BetSlipProps {
  className?: string;
  onClose?: () => void;
}

// Create the responsive BetSlip component
const ResponsiveBetSlip = createResponsiveComponent<BetSlipProps>({
  variants: {
    mobile: MobileBetSlip,
    tablet: MobileBetSlip, // Use mobile variant for tablet in portrait
    desktop: DesktopBetSlip,
    wide: DesktopBetSlip,
    fallback: DesktopBetSlip
  },
  strategy: 'immediate' // No lazy loading needed for bet slip
});

// Export the unified BetSlip component
export const BetSlip: React.FC<BetSlipProps> = (props) => {
  return <ResponsiveBetSlip {...props} />;
};

// Also export individual variants for direct use if needed
export { MobileBetSlip, DesktopBetSlip };
export { BetSlipCore } from './BetSlipCore';

export default BetSlip;