import React, { useState, useCallback, useMemo } from 'react';
import { Colors, REGISTRARS } from '../constants';
import { useApp } from '../context';
import { Toast } from '../components/Toast';
import { RegistrarPickerModal } from '../components/RegistrarPickerModal';
import {
  HeartIcon,
  ArrowForwardIcon,
  CopyIcon,
  DownloadIcon,
  TrashIcon,
} from '../components/Icons';

export function WishlistPage() {
  const { settings, wishlist, removeFromWishlist, updateSettings } = useApp();
  const colors = Colors.light;

  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pendingBuyDomain, setPendingBuyDomain] = useState<string | null>(null);

  const sortedWishlist = useMemo(() => [...wishlist].sort((a, b) => b.addedAt - a.addedAt), [wishlist]);

  const toggleSelection = useCallback((domain: string) => {
    setSelectedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain); else next.add(domain);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedDomains.size === wishlist.length) {
      setSelectedDomains(new Set());
    } else {
      setSelectedDomains(new Set(wishlist.map((w) => w.domain)));
    }
  }, [wishlist, selectedDomains.size]);

  const openRegistrar = useCallback((domain: string, registrarId: string) => {
    const reg = REGISTRARS.find((r) => r.id === registrarId);
    if (reg) window.open(reg.searchUrl(domain), '_blank');
  }, []);

  const handleBuy = useCallback((domain: string) => {
    if (!settings.hasChosenRegistrar) {
      setPendingBuyDomain(domain);
      return;
    }
    openRegistrar(domain, settings.preferredRegistrar);
  }, [openRegistrar, settings.hasChosenRegistrar, settings.preferredRegistrar]);

  const handleSelectRegistrar = useCallback(async (registrarId: string) => {
    await updateSettings({ preferredRegistrar: registrarId, hasChosenRegistrar: true });
    if (pendingBuyDomain) {
      openRegistrar(pendingBuyDomain, registrarId);
    }
    setPendingBuyDomain(null);
  }, [openRegistrar, pendingBuyDomain, updateSettings]);

  const handleCloseRegistrarModal = useCallback(() => setPendingBuyDomain(null), []);

  const handleDelete = useCallback(() => {
    if (selectedDomains.size === 0) return;
    setConfirmDelete(true);
  }, [selectedDomains.size]);

  const confirmDeleteAction = useCallback(async () => {
    const count = selectedDomains.size;
    await removeFromWishlist([...selectedDomains]);
    setSelectedDomains(new Set());
    setConfirmDelete(false);
    setToast(`${count} domain${count !== 1 ? 's' : ''} removed`);
  }, [selectedDomains, removeFromWishlist]);

  const handleCopy = useCallback(async () => {
    const domains = selectedDomains.size > 0 ? [...selectedDomains] : wishlist.map((w) => w.domain);
    if (domains.length === 0) return;
    await navigator.clipboard.writeText(domains.join('\n'));
    setToast(`${domains.length} domain${domains.length !== 1 ? 's' : ''} copied`);
  }, [selectedDomains, wishlist]);

  const handleExportCSV = useCallback(() => {
    const items = selectedDomains.size > 0
      ? wishlist.filter((w) => selectedDomains.has(w.domain))
      : wishlist;
    if (items.length === 0) return;

    const csv = ['Domain,Added Date', ...items.map((d) => `${d.domain},${new Date(d.addedAt).toLocaleDateString()}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'open-domain-wishlist.csv';
    a.click();
    URL.revokeObjectURL(url);
    setToast('CSV downloaded');
  }, [selectedDomains, wishlist]);

  const allSelected = wishlist.length > 0 && selectedDomains.size === wishlist.length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ color: colors.text }}>Wishlist</h1>
        <p className="page-subtitle" style={{ color: colors.textSecondary }}>
          {wishlist.length} saved domain{wishlist.length !== 1 ? 's' : ''}
        </p>
      </div>

      {wishlist.length > 0 && (
        <div className="panel" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          {/* Toolbar */}
          <div className="wishlist-toolbar">
            <div className="wishlist-toolbar-left">
              {selectedDomains.size > 0 && (
                <span className="selection-info" style={{ color: colors.text }}>
                  {selectedDomains.size} selected
                </span>
              )}
            </div>
            <div className="wishlist-toolbar-right">
              <button
                className="toolbar-btn"
                style={{ borderColor: colors.border, color: colors.text }}
                onClick={handleCopy}
                title={selectedDomains.size > 0 ? 'Copy selected' : 'Copy all'}
              >
                <CopyIcon size={14} color={colors.textSecondary} />
                {selectedDomains.size > 0 ? 'Copy' : 'Copy All'}
              </button>
              <button
                className="toolbar-btn"
                style={{ borderColor: colors.tint, color: colors.tint }}
                onClick={handleExportCSV}
                title="Export as CSV"
              >
                <DownloadIcon size={14} color={colors.tint} />
                Export CSV
              </button>
              {selectedDomains.size > 0 && (
                <button
                  className="toolbar-btn danger"
                  style={{ color: colors.registered }}
                  onClick={handleDelete}
                >
                  <TrashIcon size={14} color={colors.registered} />
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="wishlist-table-wrap">
            <table className="wishlist-table">
              <thead>
                <tr>
                <th className="col-check" style={{ borderBottomColor: colors.border }}>
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                </th>
                <th style={{ color: colors.textSecondary, borderBottomColor: colors.border }}>Domain</th>
                <th className="col-actions" style={{ color: colors.textSecondary, borderBottomColor: colors.border }}>Actions</th>
              </tr>
            </thead>
            <tbody>
                {sortedWishlist.map((item) => {
                  const isSelected = selectedDomains.has(item.domain);
                  return (
                    <tr key={item.domain} style={{ backgroundColor: isSelected ? `${colors.tint}08` : 'transparent' }}>
                      <td className="col-check" style={{}}>
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(item.domain)}
                        />
                      </td>
                      <td style={{}}>
                        <span className="wishlist-domain" style={{ color: colors.text }} title={item.domain}>
                          {item.domain}
                        </span>
                        <div className="wishlist-domain-meta" style={{ color: colors.textSecondary }}>
                          Added{' '}
                          <span className="wishlist-date" style={{ color: colors.textSecondary }}>
                        {new Date(item.addedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="col-actions" style={{}}>
                        <button
                          className="row-action-btn buy-btn"
                          style={{ backgroundColor: colors.tint }}
                          onClick={() => handleBuy(item.domain)}
                        >
                          Buy <ArrowForwardIcon size={12} color="#fff" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {wishlist.length === 0 && (
        <div className="panel empty-state" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <div className="empty-icon-container" style={{ backgroundColor: colors.surfaceElevated }}>
            <HeartIcon size={28} color={colors.textSecondary} />
          </div>
          <h2 className="empty-title" style={{ color: colors.text }}>No saved domains</h2>
          <p className="empty-text" style={{ color: colors.textSecondary }}>
            Add domains from search results to save them here
          </p>
        </div>
      )}

      {/* Confirm dialog */}
      {confirmDelete && (
        <div className="confirm-overlay" style={{ backgroundColor: colors.overlay }}>
          <div className="confirm-dialog" style={{ backgroundColor: colors.surfaceElevated }}>
            <h3 className="confirm-title" style={{ color: colors.text }}>Remove domains</h3>
            <p className="confirm-message" style={{ color: colors.textSecondary }}>
              Remove {selectedDomains.size} domain{selectedDomains.size !== 1 ? 's' : ''} from your wishlist?
            </p>
            <div className="confirm-actions">
              <button className="confirm-btn cancel-confirm" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="confirm-btn danger" onClick={confirmDeleteAction}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <RegistrarPickerModal
        isOpen={pendingBuyDomain !== null}
        onClose={handleCloseRegistrarModal}
        onSelect={handleSelectRegistrar}
      />
    </div>
  );
}
