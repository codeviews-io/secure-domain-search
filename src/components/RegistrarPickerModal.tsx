import React from 'react';
import { Colors, REGISTRARS } from '../constants';

interface RegistrarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (registrarId: string) => void;
}

export function RegistrarPickerModal({ isOpen, onClose, onSelect }: RegistrarPickerModalProps) {
  const colors = Colors.light;

  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" style={{ backgroundColor: colors.overlay }}>
      <div className="registrar-modal" style={{ backgroundColor: colors.surface }}>
        <div className="registrar-modal-header">
          <h3 className="registrar-modal-title" style={{ color: colors.text }}>Choose your registrar</h3>
          <p className="registrar-modal-subtitle" style={{ color: colors.textSecondary }}>
            We’ll use this by default next time. You can change it later in Settings.
          </p>
        </div>

        <div className="registrar-modal-list">
          {REGISTRARS.map((registrar) => (
            <button
              key={registrar.id}
              className="registrar-modal-row"
              style={{ borderColor: colors.border, color: colors.text }}
              onClick={() => onSelect(registrar.id)}
            >
              {registrar.name}
            </button>
          ))}
        </div>

        <div className="registrar-modal-actions">
          <button className="registrar-modal-cancel" onClick={onClose}>Not now</button>
        </div>
      </div>
    </div>
  );
}
