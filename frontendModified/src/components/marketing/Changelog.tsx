import MarketingLayout from './MarketingLayout';

const entries = [
  {
    date: 'July 2026',
    version: 'v2.3',
    changes: [
      'Redesigned app with a new green accent theme',
      'Added marketing pages: Pricing, About, Changelog',
      'Fixed dead /messages redirect to route to your own inbox',
      'Removed orphaned /groups/create route in favor of the create group modal',
    ],
  },
  {
    date: 'April 2026',
    version: 'v2.2',
    changes: [
      'Added group admin panel with member management',
      'Push notifications via Pusher Beams',
      'Improved reply threading in group chats',
    ],
  },
  {
    date: 'January 2026',
    version: 'v2.1',
    changes: [
      'Anonymous group posting mode',
      'Media attachments in messages (images, video, audio)',
      'Performance improvements for large group chats',
    ],
  },
  {
    date: 'October 2025',
    version: 'v2.0',
    changes: [
      'Launched group messaging',
      'Real-time delivery with Pusher',
      'New privacy controls',
    ],
  },
];

const Changelog = () => {
  return (
    <MarketingLayout>
      <section className="max-w-2xl lg:max-w-4xl 2xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-lk-t1 dark:text-dk-t1 mb-10 text-center">
          Changelog
        </h1>
        <div className="space-y-8">
          {entries.map((entry) => (
            <div
              key={entry.version}
              className="p-6 bg-lk-s1 dark:bg-dk-s1 rounded-[14px] border border-lk-border dark:border-dk-border"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-bold text-lk-t1 dark:text-dk-t1">{entry.version}</h2>
                <span className="text-xs font-medium text-lk-t3 dark:text-dk-t3">{entry.date}</span>
              </div>
              <ul className="space-y-2">
                {entry.changes.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-lk-t2 dark:text-dk-t2">
                    <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-lk-accent dark:bg-dk-accent shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Changelog;
