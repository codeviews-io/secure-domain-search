import React from 'react';
import { Colors } from '../constants';
import { LookupProgress } from '../types';

interface ProgressBarProps {
  progress: LookupProgress;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const colors = Colors.light;
  const percentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  return (
    <div className="progress-container" style={{ backgroundColor: colors.surface }}>
      <div className="progress-text-row">
        <span className="progress-text" style={{ color: colors.textSecondary }}>
          Checking {progress.completed} of {progress.total}
        </span>
        {progress.currentDomain && (
          <span className="progress-current" style={{ color: colors.text }}>
            {progress.currentDomain}
          </span>
        )}
      </div>
      <div className="progress-track" style={{ backgroundColor: colors.surfaceElevated }}>
        <div
          className="progress-fill"
          style={{ backgroundColor: colors.tint, width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
