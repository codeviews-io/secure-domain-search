import React, { useState } from 'react';
import { AppProvider, useApp } from './context';
import { Colors } from './constants';
import { SearchPage } from './pages/SearchPage';
import { WishlistPage } from './pages/WishlistPage';
import { SettingsPage } from './pages/SettingsPage';
import { InfoPage } from './pages/InfoPage';
import { HeartIcon, SettingsIcon, ShieldIcon, EyeOffIcon, LockIcon, HomeIcon, InfoIcon } from './components';

type Tab = 'search' | 'wishlist' | 'settings' | 'info';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const { wishlist } = useApp();
  const colors = Colors.light;

  const renderPage = () => {
    switch (activeTab) {
      case 'search':
        return <SearchPage />;
      case 'wishlist':
        return <WishlistPage />;
      case 'settings':
        return <SettingsPage />;
      case 'info':
        return <InfoPage />;
    }
  };

  return (
    <div className="shell" style={{ backgroundColor: colors.background }}>
      <header className="topbar" style={{ backgroundColor: colors.headerBg }}>
        <div className="topbar-row">
          <button className="brand brand-button" onClick={() => setActiveTab('search')}>
            <img
              src="/icons/icon48.png"
              alt="Secure Domain Search"
              width={32}
              height={32}
              style={{ borderRadius: '10px' }}
            />
            <div className="brand-text">
              <span className="brand-name" style={{ color: colors.headerText }}>Secure Domain Search</span>
              <span className="brand-tag" style={{ color: colors.headerTextMuted }}>Privacy focused domain availability checker</span>
            </div>
          </button>
          <div className="topbar-actions">
            <button
              className={`icon-button ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
              title="Home"
              aria-label="Home"
            >
              <HomeIcon size={17} color={activeTab === 'search' ? colors.tint : colors.headerTextMuted} />
            </button>
            <button
              className={`icon-button ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
              title="Wishlist"
              aria-label="Wishlist"
            >
              <HeartIcon size={17} color={activeTab === 'wishlist' ? colors.tint : colors.headerTextMuted} />
              {wishlist.length > 0 && (
                <span className="icon-badge" style={{ backgroundColor: colors.registered, color: '#fff' }}>
                  {wishlist.length > 99 ? '99+' : wishlist.length}
                </span>
              )}
            </button>
            <button
              className={`icon-button ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
              title="Info"
              aria-label="Info"
            >
              <InfoIcon size={17} color={activeTab === 'info' ? colors.tint : colors.headerTextMuted} />
            </button>
            <button
              className={`icon-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
              title="Settings"
              aria-label="Settings"
            >
              <SettingsIcon size={17} color={activeTab === 'settings' ? colors.tint : colors.headerTextMuted} />
            </button>
          </div>
        </div>

        <div className="topbar-badges">
          <button
            className="topbar-badge badge-button"
            style={{ color: colors.headerTextMuted, backgroundColor: 'rgba(15, 23, 42, 0.08)' }}
            onClick={() => setActiveTab('info')}
            title="Learn more"
          >
            <ShieldIcon size={12} color={colors.tint} />
            Privacy First
          </button>
          <button
            className="topbar-badge badge-button"
            style={{ color: colors.headerTextMuted, backgroundColor: 'rgba(15, 23, 42, 0.08)' }}
            onClick={() => setActiveTab('info')}
            title="Learn more"
          >
            <EyeOffIcon size={12} color={colors.tint} />
            Direct DNS
          </button>
          <button
            className="topbar-badge badge-button"
            style={{ color: colors.headerTextMuted, backgroundColor: 'rgba(15, 23, 42, 0.08)' }}
            onClick={() => setActiveTab('info')}
            title="Learn more"
          >
            <LockIcon size={12} color={colors.tint} />
            Registry RDAP
          </button>
        </div>
      </header>

      <main className="main">
        <div className="main-inner">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
