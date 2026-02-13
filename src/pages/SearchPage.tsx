import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Colors, REGISTRARS } from '../constants';
import { useApp } from '../context';
import { DomainCheckResult, LookupProgress } from '../types';
import {
  checkDomains,
  generateDomainCombinations,
  isValidDomainName,
  sortResultsByStatus,
} from '../services';
import { TLDSelector, ProgressBar, RegistrarPickerModal } from '../components';
import {
  SearchIcon,
  CloseIcon,
  AlertCircleIcon,
  HeartIcon,
  HeartFilledIcon,
  ArrowForwardIcon,
  InfoIcon,
} from '../components/Icons';

type ResultTab = 'available' | 'unavailable';

export function SearchPage() {
  const { settings, selectedTLDs, setSelectedTLDs, addToWishlist, isInWishlist, updateSettings } = useApp();
  const colors = Colors.light;

  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<DomainCheckResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState<LookupProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>('available');
  const [viewMode, setViewMode] = useState<'form' | 'results'>('form');
  const [pendingBuyDomain, setPendingBuyDomain] = useState<string | null>(null);

  const abortRef = useRef(false);

  const parseNames = useCallback((text: string): string[] => {
    return text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  }, []);

  const availableResults = useMemo(
    () => results.filter((r) => r.status === 'available'),
    [results]
  );
  const unavailableResults = useMemo(
    () => results.filter((r) => r.status !== 'available'),
    [results]
  );
  const displayedResults = activeTab === 'available' ? availableResults : unavailableResults;

  const handleSearch = useCallback(async () => {
    const names = parseNames(inputText);
    if (names.length === 0) { setError('Enter at least one domain name'); return; }

    const domains = generateDomainCombinations(names, selectedTLDs);
    const invalid = domains.filter((d) => !isValidDomainName(d));
    if (invalid.length > 0) { setError(`Invalid format: ${invalid[0]}`); return; }
    if (domains.length === 0) { setError('No valid combinations'); return; }

    setError(null);
    setIsSearching(true);
    setResults([]);
    setActiveTab('available');
    setViewMode('results');
    abortRef.current = false;

    try {
      await checkDomains(
        domains,
        (p) => { if (!abortRef.current) setProgress(p); },
        (r) => { if (!abortRef.current) setResults((prev) => sortResultsByStatus([...prev, r])); }
      );
    } catch (err) {
      if (!abortRef.current) setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      if (!abortRef.current) { setIsSearching(false); setProgress(null); }
    }
  }, [inputText, selectedTLDs, parseNames]);

  const handleCancel = useCallback(() => { abortRef.current = true; setIsSearching(false); setProgress(null); }, []);
  const handleClearResults = useCallback(() => setResults([]), []);
  const handleClearInput = useCallback(() => { setInputText(''); setResults([]); setError(null); }, []);
  const handleBackToSearch = useCallback(() => { setViewMode('form'); }, []);

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

  const nameCount = parseNames(inputText).length;
  const combinationCount = nameCount * selectedTLDs.length;
  const hasResults = results.length > 0 || isSearching;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ color: colors.text }}>Search Domains</h1>
        <p className="page-subtitle" style={{ color: colors.textSecondary }}>
          Check availability across {selectedTLDs.length} TLD{selectedTLDs.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="search-layout">
        {viewMode === 'form' ? (
          <div className="panel search-left" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <div className="input-container">
                <textarea
                  className="domain-input"
                  placeholder={"Enter domain names, one per line:\n\nmyproject\ncoolbrand\nstartup2024"}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isSearching}
                  style={{ backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }}
                />
                {inputText.length > 0 && !isSearching && (
                  <button className="clear-input-button" style={{ backgroundColor: colors.surfaceElevated }} onClick={handleClearInput}>
                    <CloseIcon size={12} color={colors.textSecondary} />
                  </button>
                )}
              </div>

              <TLDSelector selectedTLDs={selectedTLDs} onSelectionChange={setSelectedTLDs} />

              {nameCount > 0 && !isSearching && (
                <p className="info-text" style={{ color: colors.textSecondary }}>
                  {combinationCount} combination{combinationCount !== 1 ? 's' : ''} to check
                </p>
              )}

              {error && (
                <div className="error-container" style={{ backgroundColor: `${colors.registered}15` }}>
                  <AlertCircleIcon size={16} color={colors.registered} />
                  <span className="error-text" style={{ color: colors.registered }}>{error}</span>
                </div>
              )}

              {isSearching ? (
                <button className="search-button cancel-button" onClick={handleCancel}>Cancel</button>
              ) : (
                <button
                  className="search-button"
                  style={{ backgroundColor: colors.tint, color: '#fff' }}
                  onClick={handleSearch}
                  disabled={inputText.trim().length === 0 || selectedTLDs.length === 0}
                >
                  <SearchIcon size={16} color="#fff" />
                  Search
                </button>
              )}
          </div>
        ) : (
          <div className="panel search-right" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            {progress && <ProgressBar progress={progress} />}

            {hasResults ? (
              <>
                <div className="results-disclaimer" style={{ borderColor: colors.border, backgroundColor: colors.surfaceElevated }}>
                  <InfoIcon size={14} color={colors.unknown} />
                  <span className="disclaimer-text" style={{ color: colors.textSecondary }}>
                    Availability checks are indicative only. Always verify with your registrar before purchasing.
                  </span>
                </div>
                <div className="results-header">
                  <button
                    className="back-button"
                    style={{ backgroundColor: colors.tint }}
                    onClick={handleBackToSearch}
                    disabled={isSearching}
                  >
                    Back
                  </button>
                  <div className="results-tabs" style={{}}>
                    <button
                      className="result-tab"
                      style={{
                        backgroundColor: activeTab === 'available' ? `${colors.tint}15` : 'transparent',
                        color: activeTab === 'available' ? colors.tint : colors.textSecondary,
                      }}
                      onClick={() => setActiveTab('available')}
                    >
                      Available
                      <span className="result-tab-count" style={{
                        backgroundColor: activeTab === 'available' ? `${colors.tint}25` : colors.surfaceElevated,
                        color: activeTab === 'available' ? colors.tint : colors.textSecondary,
                      }}>{availableResults.length}</span>
                    </button>
                    <button
                      className="result-tab"
                      style={{
                        backgroundColor: activeTab === 'unavailable' ? `${colors.tint}15` : 'transparent',
                        color: activeTab === 'unavailable' ? colors.tint : colors.textSecondary,
                        borderLeftColor: colors.border,
                      }}
                      onClick={() => setActiveTab('unavailable')}
                    >
                      Unavailable
                      <span className="result-tab-count" style={{
                        backgroundColor: activeTab === 'unavailable' ? `${colors.tint}25` : colors.surfaceElevated,
                        color: activeTab === 'unavailable' ? colors.tint : colors.textSecondary,
                      }}>{unavailableResults.length}</span>
                    </button>
                  </div>

                  {results.length > 0 && !isSearching && (
                    <button className="clear-results-button" style={{ backgroundColor: colors.surface, color: colors.textSecondary }} onClick={handleClearResults}>
                      <CloseIcon size={12} color={colors.textSecondary} />
                      Clear
                    </button>
                  )}
                </div>

                {displayedResults.length > 0 ? (
                  <table className="results-table">
                    <tbody>
                      {activeTab === 'available' ? (
                        displayedResults.map((r) => {
                          const inWl = isInWishlist(r.domain);
                          return (
                            <tr key={r.domain}>
                              <td className="wishlist-cell">
                                <button
                                  className="row-action-btn wishlist-btn"
                                  onClick={() => { if (!inWl) addToWishlist(r.domain); }}
                                  disabled={inWl}
                                  title={inWl ? 'In wishlist' : 'Add to wishlist'}
                                >
                                  {inWl
                                    ? <HeartFilledIcon size={14} color={colors.registered} />
                                    : <HeartIcon size={14} color={colors.textSecondary} />
                                  }
                                </button>
                              </td>
                              <td className="domain-cell" style={{ color: colors.text }}>
                                {r.domain}
                                {r.error && <div className="domain-error" style={{ color: colors.unknown, fontFamily: 'inherit', fontSize: 11, marginTop: 2 }}>{r.error}</div>}
                              </td>
                              <td className="actions-cell">
                                <button
                                  className="row-action-btn buy-btn"
                                  style={{ backgroundColor: colors.tint }}
                                  onClick={() => handleBuy(r.domain)}
                                >
                                  Buy <ArrowForwardIcon size={12} color="#fff" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        displayedResults.map((r) => (
                          <tr key={r.domain}>
                            <td className="domain-cell" style={{ color: colors.text }}>
                              {r.domain}
                              {r.error && <div className="domain-error" style={{ color: colors.unknown, fontFamily: 'inherit', fontSize: 11, marginTop: 2 }}>{r.error}</div>}
                            </td>
                            <td className="status-cell">
                              <span className={`status-dot ${r.status}`} style={{ color: colors.text }}>
                                {r.status === 'registered' ? 'Taken' : 'Unknown'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : (
                  !isSearching && (
                    <div className="empty-results">
                      <p className="empty-results-text" style={{ color: colors.textSecondary }}>
                        {activeTab === 'available' ? 'No available domains found' : 'No unavailable domains found'}
                      </p>
                    </div>
                  )
                )}
              </>
            ) : (
              <div className="search-empty">
                <SearchIcon size={32} color={colors.border} />
                <p className="search-empty-title" style={{ color: colors.textSecondary }}>Results appear here</p>
                <p className="search-empty-text" style={{ color: colors.textSecondary }}>
                  Enter domain names and click Search to check availability
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <RegistrarPickerModal
        isOpen={pendingBuyDomain !== null}
        onClose={handleCloseRegistrarModal}
        onSelect={handleSelectRegistrar}
      />
    </div>
  );
}
