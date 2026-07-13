import MarketingLayout from './MarketingLayout';
import { Check } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Everything you need to start talking anonymously.',
    features: [
      'Personal anonymous inbox',
      'Join unlimited groups',
      'Real-time messaging',
      'Basic media sharing',
    ],
    cta: 'Get started',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Plus',
    price: '$5',
    period: 'per month',
    description: 'For power users who live in group chats.',
    features: [
      'Everything in Free',
      'Create unlimited groups',
      'Group admin tools',
      'Priority notifications',
      'Extended media storage',
    ],
    cta: 'Start free trial',
    href: '/register',
    highlighted: true,
  },
  {
    name: 'Teams',
    price: '$15',
    period: 'per month',
    description: 'Built for communities and moderated spaces.',
    features: [
      'Everything in Plus',
      'Advanced moderation tools',
      'Custom group branding',
      'Priority support',
    ],
    cta: 'Contact us',
    href: '/about',
    highlighted: false,
  },
];

const Pricing = () => {
  return (
    <MarketingLayout>
      <section className="max-w-5xl lg:max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-lk-t1 dark:text-dk-t1 mb-3">
            Simple, honest pricing
          </h1>
          <p className="text-lk-t2 dark:text-dk-t2">
            Start for free. Upgrade anytime as your conversations grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-8 rounded-[14px] border flex flex-col ${
                tier.highlighted
                  ? 'bg-lk-s1 dark:bg-dk-s1 border-lk-accent dark:border-dk-accent shadow-[0_8px_32px_rgba(0,0,0,.09),0_2px_8px_rgba(0,0,0,.05)]'
                  : 'bg-lk-s1 dark:bg-dk-s1 border-lk-border dark:border-dk-border'
              }`}
            >
              {tier.highlighted && (
                <span className="self-start mb-3 text-[10px] font-bold uppercase tracking-wide text-lk-accent2 dark:text-dk-accent bg-lk-accent-pale dark:bg-dk-accent-pale px-2.5 py-1 rounded-full">
                  Most popular
                </span>
              )}
              <h2 className="font-display text-xl font-bold text-lk-t1 dark:text-dk-t1 mb-1">{tier.name}</h2>
              <p className="text-sm text-lk-t3 dark:text-dk-t3 mb-4">{tier.description}</p>
              <div className="mb-6">
                <span className="font-display text-4xl font-extrabold text-lk-t1 dark:text-dk-t1">{tier.price}</span>
                <span className="text-sm text-lk-t3 dark:text-dk-t3"> / {tier.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-lk-t2 dark:text-dk-t2">
                    <Check className="w-4 h-4 text-lk-accent2 dark:text-dk-accent shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={tier.href}
                className={`text-center px-6 py-3 rounded-full font-display font-bold transition-colors ${
                  tier.highlighted
                    ? 'text-white bg-lk-accent dark:bg-dk-accent hover:bg-lk-accent2 dark:hover:bg-dk-accent2'
                    : 'text-lk-t1 dark:text-dk-t1 border-2 border-lk-border dark:border-dk-border hover:border-lk-accent dark:hover:border-dk-accent'
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Pricing;
