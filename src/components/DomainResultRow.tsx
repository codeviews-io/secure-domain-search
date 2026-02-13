import React from 'react';
import { DomainCheckResult } from '../types';
import { Colors, REGISTRARS } from '../constants';
import { useApp } from '../context';
import { HeartIcon, HeartFilledIcon, ArrowForwardIcon } from './Icons';

interface DomainResultRowProps {
  result: DomainCheckResult;
  onAddToWishlist?: () => void;
  showWishlistButton?: boolean;
  showBuyButton?: boolean;
}

export function DomainResultRow({
  result,
  onAddToWishlist,
  showWishlistButton = true,
  showBuyButton = true,
}: DomainResultRowProps) {
  const { isInWishlist, settings } = useApp();
  const colors = Colors.light;

  const handleBuy = () => {
    const registrar = REGISTRARS.find((r) => r.id === settings.preferredRegistrar);
    if (registrar) {
      window.open(registrar.searchUrl(result.domain), '_blank');
    }
  };

  const inWishlist = isInWishlist(result.domain);
  const isAvailable = result.status === 'available';

  return (
    <div className="domain-result-row" style={{ backgroundColor: colors.surface }}>
      {showWishlistButton && isAvailable && (
        <button
          className="heart-button"
          style={{ backgroundColor: colors.surfaceElevated }}
          onClick={inWishlist ? undefined : onAddToWishlist}
          disabled={inWishlist}
        >
          {inWishlist ? (
            <HeartFilledIcon size={18} color={colors.registered} />
          ) : (
            <HeartIcon size={18} color={colors.textSecondary} />
          )}
        </button>
      )}

      <div className="domain-info">
        <div className="domain-name" style={{ color: colors.text }}>{result.domain}</div>
        {result.error && (
          <div className="domain-error" style={{ color: colors.unknown }}>{result.error}</div>
        )}
      </div>

      {showBuyButton && isAvailable && (
        <button
          className="buy-button"
          style={{ backgroundColor: colors.tint }}
          onClick={handleBuy}
        >
          Buy
          <ArrowForwardIcon size={16} color="#ffffff" />
        </button>
      )}
    </div>
  );
}
