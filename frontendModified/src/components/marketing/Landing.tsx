import MarketingLayout from './MarketingLayout';
import { MessageSquare, ShieldCheck, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Complete Privacy',
    desc: 'No personal data collection. Your identity stays protected.',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Anonymous Messaging',
    desc: 'Share a link and receive anonymous messages instantly.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Group Conversations',
    desc: 'Create or join topic-based groups, anonymous or not.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Real-Time',
    desc: 'Messages arrive instantly, no refresh required.',
  },
];

const stats = [
  { value: '1,200+', label: 'Messages sent' },
  { value: '100+', label: 'Active groups' },
  { value: '3', label: 'Channel types' },
];

const Landing = () => {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold text-lk-t1 dark:text-dk-t1 leading-tight mb-6">
          Talk Your Talk, <span className="text-lk-accent2 dark:text-dk-accent">Anonymously.</span>
        </h1>
        <p className="text-lg md:text-xl text-lk-t2 dark:text-dk-t2 max-w-2xl mx-auto mb-10">
          A fast and secure communication platform with multiple anonymity modes,
          built for private conversations that matter.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/register"
            className="w-full sm:w-auto text-center px-8 py-3 rounded-full font-display font-bold text-white bg-lk-accent dark:bg-dk-accent hover:bg-lk-accent2 dark:hover:bg-dk-accent2 transition-colors"
          >
            Create free account
          </a>
          <a
            href="/login"
            className="w-full sm:w-auto text-center px-8 py-3 rounded-full font-display font-bold text-lk-t1 dark:text-dk-t1 border-2 border-lk-border dark:border-dk-border hover:border-lk-accent dark:hover:border-dk-accent transition-colors"
          >
            Sign in
          </a>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-lk-border dark:border-dk-border bg-lk-s1 dark:bg-dk-s1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-3 gap-4 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-display text-2xl md:text-3xl font-extrabold text-lk-t1 dark:text-dk-t1">{s.value}</div>
              <div className="text-xs md:text-sm text-lk-t3 dark:text-dk-t3">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-lk-t1 dark:text-dk-t1 text-center mb-10">
          Everything you need to talk freely
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 bg-lk-s1 dark:bg-dk-s1 rounded-[14px] border border-lk-border dark:border-dk-border"
            >
              <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-lk-accent-pale dark:bg-dk-accent-pale text-lk-accent2 dark:text-dk-accent mb-4">
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-lk-t1 dark:text-dk-t1 mb-1">{f.title}</h3>
              <p className="text-sm text-lk-t3 dark:text-dk-t3">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <blockquote className="p-8 bg-lk-accent-pale dark:bg-dk-accent-pale rounded-[14px] text-center">
          <p className="text-lg text-lk-t1 dark:text-dk-t1 font-medium mb-4">
            "Finally a place where I can share honest feedback without worrying about who's reading it."
          </p>
          <footer className="text-sm text-lk-t3 dark:text-dk-t3">— Anonymous user</footer>
        </blockquote>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-lk-t1 dark:text-dk-t1 mb-4">
          Ready to communicate securely?
        </h2>
        <p className="text-lk-t2 dark:text-dk-t2 mb-8">
          Join hundreds of users who trust our platform for private, anonymous communication.
        </p>
        <a
          href="/register"
          className="inline-block px-8 py-3 rounded-full font-display font-bold text-white bg-lk-accent dark:bg-dk-accent hover:bg-lk-accent2 dark:hover:bg-dk-accent2 transition-colors"
        >
          Get started for free
        </a>
      </section>
    </MarketingLayout>
  );
};

export default Landing;
