import React, { useCallback } from 'react';
import { Colors, REGISTRARS } from '../constants';
import { useApp } from '../context';
import {
  ShieldIcon,
  EyeOffIcon,
  LockIcon,
  InfoIcon,
  GithubIcon,
} from '../components/Icons';

export function SettingsPage() {
  const { settings, updateSettings } = useApp();
  const colors = Colors.light;

  const handleRegistrarChange = useCallback(
    async (registrarId: string) => { await updateSettings({ preferredRegistrar: registrarId, hasChosenRegistrar: true }); },
    [updateSettings]
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ color: colors.text }}>Settings</h1>
      </div>

      <div className="panel" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className="settings-grid">
        {/* Preferred Registrar */}
        <div className="settings-section">
          <h2 className="section-title" style={{ color: colors.textSecondary }}>Preferred Registrar</h2>
          <div className="card" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
            {REGISTRARS.map((registrar, index) => {
              const isSelected = settings.preferredRegistrar === registrar.id;
              const isLast = index === REGISTRARS.length - 1;
              return (
                <div
                  key={registrar.id}
                  className="registrar-row"
                  style={{ borderBottom: !isLast ? `1px solid ${colors.border}` : undefined }}
                  onClick={() => handleRegistrarChange(registrar.id)}
                >
                  <span className="registrar-name" style={{ color: colors.text }}>{registrar.name}</span>
                  <div className="radio-outer" style={{
                    borderColor: isSelected ? colors.tint : colors.textSecondary,
                    backgroundColor: isSelected ? colors.tint : 'transparent',
                  }}>
                    {isSelected && <div className="radio-inner" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* About */}
        <div className="settings-section full-width">
          <h2 className="section-title" style={{ color: colors.textSecondary }}>About</h2>
          <div className="about-links">
            <a href="https://opendomain.app/about" target="_blank" rel="noopener noreferrer"
              className="about-link" style={{ borderColor: colors.border, color: colors.text }}>
              About Us
            </a>
            <a href="https://opendomain.app/privacy" target="_blank" rel="noopener noreferrer"
              className="about-link" style={{ borderColor: colors.border, color: colors.text }}>
              Privacy Policy
            </a>
            <a href="https://opendomain.app/terms" target="_blank" rel="noopener noreferrer"
              className="about-link" style={{ borderColor: colors.border, color: colors.text }}>
              Terms of Service
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="about-link" style={{ borderColor: colors.border, color: colors.text }}>
              <GithubIcon size={14} color={colors.text} />
              GitHub
            </a>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
