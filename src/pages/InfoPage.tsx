import React from 'react';
import { Colors } from '../constants';
import { ShieldIcon, EyeOffIcon, LockIcon } from '../components/Icons';

export function InfoPage() {
  const colors = Colors.light;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ color: colors.text }}>About Secure Domain Search</h1>
        <p className="page-subtitle" style={{ color: colors.textSecondary }}>
          Privacy‑first availability checks using public DNS‑over‑HTTPS and registry RDAP.
        </p>
      </div>

      <div className="panel" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className="info-section">
          <h2 className="info-section-title" style={{ color: colors.text }}>Why it exists</h2>
          <p className="info-section-text" style={{ color: colors.textSecondary }}>
            Secure Domain Search helps you check availability without using registrar or third-party availability APIs.
          </p>
          <br/>
          <p className="info-section-text" style={{ color: colors.textSecondary }}>
            That reduces the risk of domain frontrunning by avoiding third‑party availability checks.
            Queries go to public DNS‑over‑HTTPS and registry RDAP servers.
          </p>
        </div>

        <div className="info-section">
          <h2 className="info-section-title" style={{ color: colors.text }}>How it works</h2>
          <ol className="info-steps">
            <li className="info-step" style={{ color: colors.textSecondary }}>
              <span className="info-step-index" style={{ backgroundColor: `${colors.tint}16`, color: colors.tint }}>1</span>
              We first check DNS via Cloudflare DoH. If a DNS record exists, the domain is marked unavailable.
            </li>
            <li className="info-step" style={{ color: colors.textSecondary }}>
              <span className="info-step-index" style={{ backgroundColor: `${colors.tint}16`, color: colors.tint }}>2</span>
              If no DNS is found, we perform an RDAP lookup directly with the registry.
            </li>
            <li className="info-step" style={{ color: colors.textSecondary }}>
              <span className="info-step-index" style={{ backgroundColor: `${colors.tint}16`, color: colors.tint }}>3</span>
              Results are returned as Available, Registered, or Unknown.
            </li>
          </ol>
        </div>

        <div className="info-section">
          <h2 className="info-section-title" style={{ color: colors.text }}>What we use</h2>
          <div className="info-pill-grid">
            <div className="info-pill" style={{ borderColor: colors.border }}>
              <ShieldIcon size={16} color={colors.tint} />
              <div>
                <div className="info-pill-title" style={{ color: colors.text }}>Direct DoH</div>
                <div className="info-pill-text" style={{ color: colors.textSecondary }}>
                  DNS lookup through Cloudflare DNS‑over‑HTTPS.
                </div>
              </div>
            </div>
            <div className="info-pill" style={{ borderColor: colors.border }}>
              <EyeOffIcon size={16} color={colors.tint} />
              <div>
                <div className="info-pill-title" style={{ color: colors.text }}>No Registrar APIs</div>
                <div className="info-pill-text" style={{ color: colors.textSecondary }}>
                  We don’t query registrars or third‑party availability APIs.
                </div>
              </div>
            </div>
            <div className="info-pill" style={{ borderColor: colors.border }}>
              <LockIcon size={16} color={colors.tint} />
              <div>
                <div className="info-pill-title" style={{ color: colors.text }}>Registry RDAP</div>
                <div className="info-pill-text" style={{ color: colors.textSecondary }}>
                  We directly query registry RDAP for final availability checks.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h2 className="info-section-title" style={{ color: colors.text }}>Logging</h2>
          <p className="info-section-text" style={{ color: colors.textSecondary }}>
            We don’t operate servers or store search data, requests go directly to public DNS and registry services.
          </p>
        </div>
      </div>
    </div>
  );
}
