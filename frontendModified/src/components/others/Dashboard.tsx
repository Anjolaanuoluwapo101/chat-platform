import React, { useState} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../layouts/Layout';
import { getCommonNavItems } from '../nav/sharedNavItems';
import auth from '../../services/auth';
import { Copy} from 'lucide-react';

interface NavItem {
  title: string;
  to: string;
  icon: React.ReactNode;
}

const navItems : NavItem[] = getCommonNavItems();

function Dashboard() {
  const [activeTab, setActiveTab] = useState<'single' | 'multi'>('single');
  const [copyStatus, setCopyStatus] = useState({ copied: false, message: '' });

  // Check if current user has been set, if not, refresh
  if(auth.getCurrentUser().username == undefined || auth.getCurrentUser().username == null){
    window.location.reload();
  }


  const copyChannelLink = () => {
    const channelLink = `${window.location.origin}/messages/${auth.getCurrentUser()?.username}`;
    navigator.clipboard.writeText(channelLink)
      .then(() => {
        setCopyStatus({ copied: true, message: 'Link copied to clipboard!' });
        setTimeout(() => setCopyStatus({ copied: false, message: '' }), 2000);
      })
      .catch(err => {
        setCopyStatus({ copied: false, message: 'Failed to copy link due to ' + err });
        setTimeout(() => setCopyStatus({ copied: false, message: '' }), 2000);
      });
  };

  // Communication modes data
  const communicationModes = {
    single: {
      title: "Single Channel Communication",
      description: "Personal communication channel for receiving anonymous messages",
      features: [
        "Personal message link",
        "Direct anonymous messaging",
        "Real-time notifications",
        "Message history tracking"
      ],
      actionText: "Access Channel",
      actionLink: `/messages/${auth.getCurrentUser()?.username}`
    },
    multi: {
      title: "Multi-Channel Groups",
      description: "Topic-based groups with both anonymous and non-anonymous modes",
      features: [
        "Create/join topic groups",
        "Anonymous & non-anonymous modes",
        "Group administration tools",
        "Moderation capabilities"
      ],
      actionText: "Explore Groups",
      actionLink: "/groups"
    }
  };

  return (
    <Layout navItems={navItems} title="TYT!">
      <div className="min-h-screen  text-white">
        <div className="relative z-10  max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <header className="py-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {/* <div className="inline-flex items-center justify-center mb-6">
                <div className="bg-linear-to-br from-amber-500 via-orange-500 to-amber-600 p-6 rounded-2xl shadow-2xl shadow-amber-500/20">
                  <AnonymousIcon className="w-20 h-20 text-white" />
                </div>
              </div> */}
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="block">Talk Your Talk!</span>
                <span className="block text-2xl font-normal text-slate-300 mt-2">Fast and Secure Communication Platform</span>
              </h1>
              
              <p className="text-xl text-slate-100 max-w-3xl mx-auto leading-relaxed">
                Secure, private, and flexible communication system with multiple anonymity modes for diverse use cases
              </p>
            </motion.div>
          </header>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600"
            >
              <div className="flex items-center">
                <div>
                  <span className="text-2xl font-bold text-white">1200+</span>
                  <span className="text-xl text-slate-200">  Messages</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600"
            >
              <div className="flex items-center">
                <div>
                  <span className="text-2xl font-bold text-white">100+</span>
                  <span className="text-xl text-slate-200">  Groups</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600"
            >
              <div className="flex items-center">
                <div>
                  <span className="text-2xl font-bold text-white text-left">3</span>
                  <span className="text-xl text-slate-200">  Channel Types!</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Communication Modes Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-slate-800/80 backdrop-blur-sm rounded-xl p-1 border border-slate-600">
                <button
                  onClick={() => setActiveTab('single')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === 'single'
                      ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Single Channel
                </button>
                <button
                  onClick={() => setActiveTab('multi')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === 'multi'
                      ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Multi-Channel Groups
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'single' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'single' ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-600"
              >
                <h2 className="text-3xl font-bold text-white mb-4">
                  {communicationModes[activeTab].title}
                </h2>
                <p className="text-slate-200 mb-6 text-lg">
                  {communicationModes[activeTab].description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {communicationModes[activeTab].features.map((feature, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scaleX: 1.02 }}
                      className="flex items-start"
                    >
                      <div className="p-2 bg-linear-to-r from-amber-500/5 to-orange-500/75 rounded-lg mr-4 mt-1">
                        <div className="bg-linear-to-r from-amber-400 to-orange-400 rounded-full"></div>
                      </div>
                      <span className="text-slate-200">{feature}</span>
                    </motion.div>
                  ))}
                </div>
                
                {activeTab === 'single' ? (
                  <div className="space-y-4">
                    <div className="text-slate-200 mb-4">
                      <p>Share your personal channel link to receive anonymous messages:</p>
                      <div className="mt-2 p-3 bg-slate-700/50 rounded-lg font-mono text-sm break-all">
                        {`${window.location.origin}/messages/${auth.getCurrentUser()?.username}`}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={copyChannelLink}
                        className="inline-flex items-center justify-center px-6 py-3 bg-linear-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link to Access Channel
                      </button>
                      <a
                        href={communicationModes[activeTab].actionLink}
                        className="inline-flex items-center justify-center px-6 py-3 bg-slate-700 text-white font-bold rounded-lg border border-slate-600 hover:bg-slate-600 transition-all duration-300"
                      >
                        {communicationModes[activeTab].actionText}
                      </a>
                    </div>
                    {copyStatus.message && (
                      <div className={`text-center p-2 rounded ${copyStatus.copied ? 'text-green-400' : 'text-red-400'}`}>
                        {copyStatus.message}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={communicationModes[activeTab].actionLink}
                    className="inline-flex items-center px-6 py-3 bg-linear-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    {communicationModes[activeTab].actionText}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Message Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-600 mb-16 text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Have Something to Share To The Developer?</h2>
            <p className="text-slate-200 text-xl mb-6">
              Your thoughts, ideas, and messages are welcome here. Send an anonymous message to me! Don't worry I won't know you sent it.
            </p>
            <p className="text-slate-300 mb-8">
              All messages are kept private and secure. Your identity remains protected while allowing for open communication.
            </p>
            <a
              href={`/messages/Anjola303`}
              className="inline-block px-8 py-4 bg-linear-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:shadow-xl transition-all duration-300"
            >
              Send Me a Message
            </a>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          >
            {[
              { 
                title: "Complete Privacy", 
                desc: "End-to-end encryption with no personal data collection",
                icon: (
                  <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )
              },
              { 
                title: "Secure Identity", 
                desc: "Your real identity remains completely protected",
                icon: (
                  <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )
              },
              { 
                title: "Real-Time", 
                desc: "Instant message delivery without refresh required",
                icon: (
                  <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              { 
                title: "Flexible Modes", 
                desc: "Choose between anonymous and non-anonymous communication",
                icon: (
                  <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              },
              { 
                title: "Community", 
                desc: "Join topic-based groups with like-minded individuals",
                icon: (
                  <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
              { 
                title: "Rich Media", 
                desc: "Supports images, videos, audio, and documents",
                icon: (
                  <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600 hover:border-amber-500/50 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 bg-slate-700/50 rounded-full">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-300">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Communicate Securely?
            </h2>
            <p className="text-slate-200 text-xl mb-8 max-w-2xl mx-auto">
              Join hundreds of users who trust our platform for private, anonymous communication
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.a
                whileHover={{ scaleX: 1.05 }}
                href="/groups"
                className="px-8 py-4 bg-linear-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                Explore Groups
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;