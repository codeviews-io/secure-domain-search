import React, { useEffect } from 'react';
import { Colors } from '../constants';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, onClose, duration = 2500 }: ToastProps) {
  const colors = Colors.light;

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="toast" style={{ backgroundColor: colors.surfaceElevated, color: colors.text }}>
      {message}
    </div>
  );
}
