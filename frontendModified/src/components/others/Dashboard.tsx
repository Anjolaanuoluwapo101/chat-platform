import React from 'react';
import Layout from '../../layouts/Layout';
import { getCommonNavItems } from '../nav/sharedNavItems';
import auth from '../../services/auth';
import { MessageSquare, Users, ShieldCheck, ChevronRight } from 'lucide-react';

interface NavItem {
  title: string;
  to: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = getCommonNavItems();

const HomeCard = ({
  icon,
  title,
  subtitle,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href: string;
}) => (
  <a
    href={href}
    className="flex items-center gap-4 p-5 bg-lk-s1 dark:bg-dk-s1 rounded-[14px] border border-lk-border dark:border-dk-border shadow-[0_2px_12px_rgba(0,0,0,.06),0_1px_3px_rgba(0,0,0,.04)] hover:border-lk-accent dark:hover:border-dk-accent transition-colors"
  >
    <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl bg-lk-accent-pale dark:bg-dk-accent-pale text-lk-accent2 dark:text-dk-accent">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="font-display font-bold text-lk-t1 dark:text-dk-t1">{title}</h3>
      <p className="text-sm text-lk-t3 dark:text-dk-t3 truncate">{subtitle}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-lk-t3 dark:text-dk-t3 shrink-0" />
  </a>
);

function Dashboard() {
  const currentUser = auth.getCurrentUser();

  // Check if current user has been set, if not, refresh
  if (currentUser?.username == undefined || currentUser?.username == null) {
    window.location.reload();
  }

  const sessionStartRaw = sessionStorage.getItem('isAuthenticated');
  const sessionStart = sessionStartRaw ? parseFloat(sessionStartRaw) : null;
  const sessionHoursAgo = sessionStart
    ? Math.max(0, Math.floor((Date.now() / 1000 - sessionStart) / 3600))
    : null;
  const sessionMinutesAgo = sessionStart
    ? Math.max(0, Math.floor((Date.now() / 1000 - sessionStart) / 60))
    : null;

  const sessionAgoText =
    sessionHoursAgo !== null
      ? sessionHoursAgo >= 1
        ? `${sessionHoursAgo}h ago`
        : `${sessionMinutesAgo}m ago`
      : 'Unknown';

  return (
    <Layout navItems={navItems} title="TYT!">
      <div className="min-h-screen text-lk-t1 dark:text-dk-t1">
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <header className="mb-8">
            <h1 className="font-display text-3xl font-extrabold text-lk-t1 dark:text-dk-t1 mb-1">
              Welcome back{currentUser?.username ? `, ${currentUser.username}` : ''}
            </h1>
            <p className="text-lk-t3 dark:text-dk-t3">
              Fast and secure, private communication platform.
            </p>
          </header>

          <div className="space-y-4 mb-10">
            <HomeCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="Messages"
              subtitle="Your private anonymous inbox"
              href={`/messages/${currentUser?.username}`}
            />
            <HomeCard
              icon={<Users className="w-6 h-6" />}
              title="Groups"
              subtitle="Join topic-based conversations"
              href="/groups"
            />
            <HomeCard
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Privacy"
              subtitle="Manage your privacy preferences"
              href="/privacy"
            />
          </div>

          <div className="p-5 bg-lk-s2 dark:bg-dk-s2 rounded-[14px] border border-lk-border2 dark:border-dk-border2">
            <h2 className="font-display font-bold text-sm uppercase tracking-wide text-lk-t3 dark:text-dk-t3 mb-3">
              Session
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-lk-t3 dark:text-dk-t3">Logged in as</dt>
                <dd className="font-medium text-lk-t1 dark:text-dk-t1">{currentUser?.username || 'Unknown'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-lk-t3 dark:text-dk-t3">Session started</dt>
                <dd className="font-medium text-lk-t1 dark:text-dk-t1">{sessionAgoText}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-lk-t3 dark:text-dk-t3">Auth method</dt>
                <dd className="font-medium text-lk-t1 dark:text-dk-t1">Session storage</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
