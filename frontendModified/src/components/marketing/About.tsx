import MarketingLayout from './MarketingLayout';
import { ShieldCheck, Heart, Target } from 'lucide-react';

const team = [
  { name: 'Anjola A.', role: 'Founder & Engineer' },
  { name: 'The Community', role: 'Beta testers & feedback' },
];

const About = () => {
  return (
    <MarketingLayout>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-lk-t1 dark:text-dk-t1 mb-4 text-center">
          About Talk Your Talk!
        </h1>
        <p className="text-lk-t2 dark:text-dk-t2 text-center mb-12">
          We believe honest conversation is easier when you don't have to worry about who's watching.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          <div className="p-6 bg-lk-s1 dark:bg-dk-s1 rounded-[14px] border border-lk-border dark:border-dk-border text-center">
            <div className="mx-auto mb-3 w-11 h-11 flex items-center justify-center rounded-2xl bg-lk-accent-pale dark:bg-dk-accent-pale text-lk-accent2 dark:text-dk-accent">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lk-t1 dark:text-dk-t1 mb-1">Privacy first</h3>
            <p className="text-sm text-lk-t3 dark:text-dk-t3">We don't collect what we don't need.</p>
          </div>
          <div className="p-6 bg-lk-s1 dark:bg-dk-s1 rounded-[14px] border border-lk-border dark:border-dk-border text-center">
            <div className="mx-auto mb-3 w-11 h-11 flex items-center justify-center rounded-2xl bg-lk-accent-pale dark:bg-dk-accent-pale text-lk-accent2 dark:text-dk-accent">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lk-t1 dark:text-dk-t1 mb-1">Built for people</h3>
            <p className="text-sm text-lk-t3 dark:text-dk-t3">Simple tools for real conversations.</p>
          </div>
          <div className="p-6 bg-lk-s1 dark:bg-dk-s1 rounded-[14px] border border-lk-border dark:border-dk-border text-center">
            <div className="mx-auto mb-3 w-11 h-11 flex items-center justify-center rounded-2xl bg-lk-accent-pale dark:bg-dk-accent-pale text-lk-accent2 dark:text-dk-accent">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lk-t1 dark:text-dk-t1 mb-1">Our mission</h3>
            <p className="text-sm text-lk-t3 dark:text-dk-t3">Make anonymous communication safe and easy.</p>
          </div>
        </div>

        <h2 className="font-display text-xl font-bold text-lk-t1 dark:text-dk-t1 mb-6 text-center">Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          {team.map((member) => (
            <div
              key={member.name}
              className="p-4 bg-lk-s1 dark:bg-dk-s1 rounded-[14px] border border-lk-border dark:border-dk-border text-center"
            >
              <div className="mx-auto mb-2 w-10 h-10 flex items-center justify-center rounded-full bg-lk-accent-pale dark:bg-dk-accent-pale text-lk-accent2 dark:text-dk-accent font-display font-bold">
                {member.name[0]}
              </div>
              <div className="font-medium text-lk-t1 dark:text-dk-t1 text-sm">{member.name}</div>
              <div className="text-xs text-lk-t3 dark:text-dk-t3">{member.role}</div>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
};

export default About;
