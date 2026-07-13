import { useState } from 'react';
import Layout from '../../layouts/Layout';
import { Shield, Database, Lock, Radio } from 'lucide-react';
import { getCommonNavItems } from '../nav/sharedNavItems';

const navItems = getCommonNavItems();

interface ToggleRowProps {
  title: string;
  description: string;
  storageKey: string;
  defaultOn?: boolean;
}

const ToggleRow = ({ title, description, storageKey, defaultOn = false }: ToggleRowProps) => {
  const [on, setOn] = useState<boolean>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored !== null ? stored === 'true' : defaultOn;
  });

  const handleToggle = () => {
    const next = !on;
    setOn(next);
    localStorage.setItem(storageKey, String(next));
  };

  return (
    <div className="flex items-center justify-between gap-4 py-4 px-5 border-b border-lk-border2 dark:border-dk-border2 last:border-b-0">
      <div className="min-w-0">
        {/* make both float to the left */}
        <p className="font-medium text-lk-t1 dark:text-dk-t1 text-left">{title}</p>
        <p className="text-sm text-lk-t3 dark:text-dk-t3 text-left">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={handleToggle}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
          on ? 'bg-lk-accent dark:bg-dk-accent' : 'bg-lk-border dark:bg-dk-border'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            on ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

const infoCards = [
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Secure Authentication',
    desc: 'Auth tokens are managed via HTTP-only, SameSite=Lax cookies to prevent CSRF attacks.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'No Personal Data',
    desc: 'We collect only a username and hashed password. No personal information is required.',
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: 'Secure Storage',
    desc: 'Dual storage system with Redis for real-time performance and a durable SQL database.',
  },
  {
    icon: <Radio className="w-6 h-6" />,
    title: 'Real-Time Messaging',
    desc: 'Pusher WebSocket delivers messages instantly with no third-party analytics tracking you.',
  },
];

const Privacy = () => {
  return (
    <Layout navItems={navItems} title="TYT!">
      <div className="min-h-screen text-lk-t1 dark:text-dk-t1">
        <div className="relative z-10 max-w-2xl lg:max-w-4xl 2xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <header className="mb-8">
            <h1 className="font-display text-3xl font-extrabold text-lk-t1 dark:text-dk-t1 mb-1">
              Privacy & Security
            </h1>
            <p className="text-lk-t3 dark:text-dk-t3">Your anonymity is our priority.</p>
          </header>

          {/* Toggle preferences */}
          <div className="mb-10 bg-lk-s1 dark:bg-dk-s1 rounded-[14px] border border-lk-border dark:border-dk-border overflow-hidden">
            <h2 className="font-display font-bold text-sm uppercase tracking-wide text-lk-t3 dark:text-dk-t3 px-5 pt-4 pb-2">
              Preferences
            </h2>
            <ToggleRow
              title="Store read receipts"
              description="Let senders know when you've read their message"
              storageKey="pref_read_receipts"
              defaultOn={false}
            />
            <ToggleRow
              title="Anonymous group posts"
              description="Hide your username by default in anonymous groups"
              storageKey="pref_anonymous_posts"
              defaultOn={true}
            />
            <ToggleRow
              title="Push notifications"
              description="Get notified when you receive a new message"
              storageKey="pref_push_notifications"
              defaultOn={true}
            />
          </div>

          {/* Info cards */}
          <div className="space-y-4">
            {infoCards.map((card) => (
              <div
                key={card.title}
                className="flex gap-4 p-5 bg-lk-s1 dark:bg-dk-s1 rounded-[14px] border border-lk-border dark:border-dk-border"
              >
                <div className="w-16 h-auto shrink-0 flex items-center justify-center rounded-2xl bg-lk-accent-pale dark:bg-dk-accent-pale text-lk-accent2 dark:text-dk-accent">
                  {card.icon}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lk-t1 dark:text-dk-t1 mb-1 text-left">{card.title}</h3>
                  <p className="text-sm text-lk-t3 dark:text-dk-t3 text-left">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
