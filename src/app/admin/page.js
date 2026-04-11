"use client";

import { useMemo, useState } from 'react';
import styles from './page.module.css';

const rows = [
  {
    agreementId: 'AGR12345',
    initials: 'EJ',
    avatarColor: '#1a56db',
    userName: 'Emily Johnson',
    action: 'Agreement Signed',
    category: 'Positive',
    categoryClass: 'bPositive',
    context: 'Freelance',
    timestamp: 'Mar 13, 2024, 09:30 AM',
  },
  {
    agreementId: 'AGR56789',
    initials: 'MS',
    avatarColor: '#5a6a7e',
    userName: 'Michael Smith',
    action: 'Payment Failed',
    category: 'Negative',
    categoryClass: 'bNegative',
    context: 'Rental',
    timestamp: 'Mar 14, 2024, 01:15 PM',
  },
  {
    agreementId: 'AGR78901',
    initials: 'LC',
    avatarColor: '#d97706',
    userName: 'Lisa Carter',
    action: 'Dispute Raised',
    category: 'Dispute',
    categoryClass: 'bDispute',
    context: 'Marketplace',
    timestamp: 'Mar 15, 2024, 11:40 AM',
  },
  {
    agreementId: 'AGR22456',
    initials: 'DB',
    avatarColor: '#4a5568',
    userName: 'David Brown',
    action: 'Agreement Breach',
    category: 'Negative',
    categoryClass: 'bNegative',
    context: 'Service',
    timestamp: 'Mar 16, 2024, 08:50 AM',
  },
  {
    agreementId: 'AGR34567',
    initials: 'SL',
    avatarColor: '#0e9f6e',
    userName: 'Sara Lee',
    action: 'Deadline Reminder Sent',
    category: 'Neutral',
    categoryClass: 'bNeutral',
    context: 'Freelance',
    timestamp: 'Mar 18, 2024, 07:55 AM',
  },
];

const PAGE_SIZE = 3;

const defaultFilters = {
  user: 'All Users',
  action: 'All Actions',
  category: 'All Categories',
  search: '',
  startDate: '',
  endDate: '',
};

function parseTimestamp(value) {
  return new Date(value).getTime();
}

export default function AdminPage() {
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);

  const users = useMemo(() => ['All Users', ...new Set(rows.map((row) => row.userName))], []);
  const actions = useMemo(() => ['All Actions', ...new Set(rows.map((row) => row.action))], []);
  const categories = useMemo(() => ['All Categories', ...new Set(rows.map((row) => row.category))], []);

  const filteredRows = useMemo(() => {
    const startTs = appliedFilters.startDate ? new Date(`${appliedFilters.startDate}T00:00:00`).getTime() : null;
    const endTs = appliedFilters.endDate ? new Date(`${appliedFilters.endDate}T23:59:59`).getTime() : null;
    const search = appliedFilters.search.trim().toLowerCase();

    const result = rows.filter((row) => {
      const ts = parseTimestamp(row.timestamp);
      const matchesUser = appliedFilters.user === 'All Users' || row.userName === appliedFilters.user;
      const matchesAction = appliedFilters.action === 'All Actions' || row.action === appliedFilters.action;
      const matchesCategory = appliedFilters.category === 'All Categories' || row.category === appliedFilters.category;
      const matchesStart = startTs === null || ts >= startTs;
      const matchesEnd = endTs === null || ts <= endTs;

      const textPool = `${row.agreementId} ${row.userName} ${row.action} ${row.context} ${row.category}`.toLowerCase();
      const matchesSearch = !search || textPool.includes(search);

      return matchesUser && matchesAction && matchesCategory && matchesStart && matchesEnd && matchesSearch;
    });

    result.sort((a, b) => {
      const first = parseTimestamp(a.timestamp);
      const second = parseTimestamp(b.timestamp);
      return sortDirection === 'asc' ? first - second : second - first;
    });

    return result;
  }, [appliedFilters, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, safePage]);

  const dateRangeText = draftFilters.startDate || draftFilters.endDate
    ? `${draftFilters.startDate || 'Start'} – ${draftFilters.endDate || 'End'}`
    : 'Date range';

  const handleDraftChange = (key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setPage(1);
  };

  const toggleSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setPage(1);
  };

  const resetAll = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSortDirection('desc');
    setPage(1);
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.pageTitle}>Admin Event Logs Dashboard</h1>

      <div className={styles.card}>
        <div className={styles.cardHeader} />
        <div className={styles.cardBody}>
          <div className={styles.filterRow}>
            <div className={styles.selectWrap}>
              <select value={draftFilters.user} onChange={(event) => handleDraftChange('user', event.target.value)}>
                {users.map((user) => (
                  <option key={user}>{user}</option>
                ))}
              </select>
            </div>
            <div className={styles.selectWrap}>
              <select value={draftFilters.action} onChange={(event) => handleDraftChange('action', event.target.value)}>
                {actions.map((action) => (
                  <option key={action}>{action}</option>
                ))}
              </select>
            </div>
            <div className={styles.selectWrap}>
              <select value={draftFilters.category} onChange={(event) => handleDraftChange('category', event.target.value)}>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className={styles.dateInput}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <div className={styles.dateRange}>
                <input
                  className={styles.dateField}
                  type="date"
                  value={draftFilters.startDate}
                  onChange={(event) => handleDraftChange('startDate', event.target.value)}
                  aria-label="Start date"
                />
                <span className={styles.rangeDash}>–</span>
                <input
                  className={styles.dateField}
                  type="date"
                  value={draftFilters.endDate}
                  onChange={(event) => handleDraftChange('endDate', event.target.value)}
                  aria-label="End date"
                />
              </div>
            </div>
          </div>

          <div className={styles.searchRow}>
            <div className={styles.searchWrap}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={draftFilters.search}
                onChange={(event) => handleDraftChange('search', event.target.value)}
              />
            </div>
            <button className={styles.iconBtn} type="button" onClick={toggleSort} title="Toggle timestamp sort">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span className={styles.sortLabel}>{sortDirection === 'asc' ? 'Oldest' : 'Newest'}</span>
            </button>
            <button className={styles.iconBtn} type="button" onClick={resetAll} title="Reset filters">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <button className={styles.applyBtn} type="button" onClick={applyFilters}>
              Apply Filters
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Agreement ID</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Category</th>
                  <th>Context</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row) => (
                  <tr key={row.agreementId}>
                    <td>
                      <span className={styles.agrId}>{row.agreementId}</span>
                    </td>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatarInitials} style={{ background: row.avatarColor }}>
                          {row.initials}
                        </div>
                        <span className={styles.userName}>{row.userName}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.actionText}>{row.action}</span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles[row.categoryClass]}`}>{row.category}</span>
                    </td>
                    <td>
                      <span className={styles.contextText}>{row.context}</span>
                    </td>
                    <td>
                      <span className={styles.tsText}>{row.timestamp}</span>
                    </td>
                  </tr>
                ))}
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td className={styles.emptyState} colSpan={6}>
                      No events match the selected filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button className={styles.pgBtn} type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={safePage === 1}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span>
              Page {safePage} of {totalPages}
            </span>
            <button className={styles.pgBtn} type="button" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={safePage === totalPages}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button className={styles.pgNext} type="button" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={safePage === totalPages}>
              Next
            </button>
          </div>
          <p className={styles.statusText}>Showing {paginatedRows.length} of {filteredRows.length} matching logs • {dateRangeText}</p>
        </div>
      </div>
    </main>
  );
}
