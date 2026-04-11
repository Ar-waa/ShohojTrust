import Link from 'next/link';

const timelineEvents = [
  {
    type: 'created',
    title: 'Agreement Created',
    description: 'You created the agreement.',
    time: 'Mar 12, 2024, 10:15 AM',
  },
  {
    type: 'sent',
    title: 'Sent to Client',
    description: 'Agreement sent to Emily Johnson.',
    time: 'Mar 12, 2024, 11:00 AM',
  },
  {
    type: 'signed',
    title: 'Signed by Client',
    description: 'Emily Johnson signed the agreement.',
    time: 'Mar 13, 2024, 09:30 AM',
    badge: 'Signed',
    badgeClass: 'badge-signed',
  },
  {
    type: 'paid',
    title: 'Payment Completed',
    description: 'Payment received from Emily Johnson.',
    time: 'Mar 14, 2024, 02:20 PM',
    badge: 'Paid',
    badgeClass: 'badge-paid',
  },
  {
    type: 'reminder',
    title: 'Deadline Reminder',
    description: 'Upcoming due date: March 20, 2024.',
    time: 'Mar 18, 2024, 08:00 AM',
    badge: 'Reminder',
    badgeClass: 'badge-reminder',
  },
];

const iconByType = {
  created: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <line x1="9" y1="15" x2="12" y2="15" />
    </svg>
  ),
  sent: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </svg>
  ),
  signed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  paid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="12" x2="15" y2="14" />
      <text x="12" y="16" textAnchor="middle" fontSize="9" fill="#fff" stroke="none" fontFamily="sans-serif" fontWeight="700">$</text>
    </svg>
  ),
  reminder: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

const iconColorClassByType = {
  created: 'ic-blue',
  sent: 'ic-blue',
  signed: 'ic-teal',
  paid: 'ic-blue',
  reminder: 'ic-gold',
};

export default function HomePage() {
  return (
    <main className="timelinePage">
      <div>
        <p className="page-title">User Agreement Activity Timeline</p>

        <div className="card">
          <h2 className="card-title">Agreement Activity Timeline</h2>
          <p className="card-id">Agreement ID: AGR12345</p>
          <div className="divider" />

          <div className="timeline">
            {timelineEvents.map((event, index) => (
              <div className="tl-item" key={`${event.type}-${index}`}>
                <div className="icon-col">
                  <div className={`icon-wrap ${iconColorClassByType[event.type]}`}>{iconByType[event.type]}</div>
                </div>

                <div className="content">
                  <div className="ev-header">
                    <span className="ev-title">{event.title}</span>
                    {event.badge ? <span className={`badge ${event.badgeClass}`}>{event.badge}</span> : null}
                  </div>
                  <p className="ev-desc">{event.description}</p>
                  <span className="ev-time">{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="helper-note">
          API ready: <Link href="/api/agreements/AGR12345/events">/api/agreements/AGR12345/events</Link>
        </p>
      </div>
    </main>
  );
}
