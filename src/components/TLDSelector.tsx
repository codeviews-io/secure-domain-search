import React, { useState } from 'react';
import { Colors, SUPPORTED_TLDS } from '../constants';

interface TLDSelectorProps {
  selectedTLDs: string[];
  onSelectionChange: (tlds: string[]) => void;
}

export function TLDSelector({ selectedTLDs, onSelectionChange }: TLDSelectorProps) {
  const colors = Colors.light;
  const [isExpanded, setIsExpanded] = useState(false);

  const columnsPerRow = 4;
  const initialRows = 2;
  const initialVisibleCount = columnsPerRow * initialRows;

  const visibleTLDs = isExpanded
    ? SUPPORTED_TLDS
    : SUPPORTED_TLDS.slice(0, initialVisibleCount);

  const hasMore = SUPPORTED_TLDS.length > initialVisibleCount;
  const remainingCount = SUPPORTED_TLDS.length - initialVisibleCount;

  const toggleTLD = (tld: string) => {
    if (selectedTLDs.includes(tld)) {
      if (selectedTLDs.length > 1) {
        onSelectionChange(selectedTLDs.filter((t) => t !== tld));
      }
    } else {
      onSelectionChange([...selectedTLDs, tld]);
    }
  };

  const selectAll = () => {
    onSelectionChange(SUPPORTED_TLDS.map((t) => t.tld));
  };

  const selectNone = () => {
    onSelectionChange([SUPPORTED_TLDS[0].tld]);
  };

  return (
    <div className="tld-selector">
      <div className="tld-header">
        <span className="tld-label" style={{ color: colors.text }}>Extensions</span>
        <div className="tld-quick-actions">
          <button
            className="tld-quick-action"
            style={{ backgroundColor: colors.surface, color: colors.tint }}
            onClick={selectAll}
          >
            All
          </button>
          <button
            className="tld-quick-action"
            style={{ backgroundColor: colors.surface, color: colors.textSecondary }}
            onClick={selectNone}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="tld-grid">
        {visibleTLDs.map((tld) => {
          const isSelected = selectedTLDs.includes(tld.tld);
          return (
            <button
              key={tld.tld}
              className={`tld-chip ${isSelected ? 'selected' : ''}`}
              style={{
                backgroundColor: colors.surface,
                color: isSelected ? colors.tint : colors.text,
                borderColor: isSelected ? colors.tint : 'transparent',
              }}
              onClick={() => toggleTLD(tld.tld)}
            >
              {tld.label}
            </button>
          );
        })}
      </div>

      {hasMore && (
        <button
          className="tld-more-button"
          style={{ color: colors.tint }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show less' : `+${remainingCount} more`}
        </button>
      )}
    </div>
  );
}
