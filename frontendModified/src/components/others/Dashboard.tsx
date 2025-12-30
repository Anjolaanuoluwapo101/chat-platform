import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnonymousIcon } from '../auth/AuthShared';
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
  const [userStats, setUserStats] = useState({ messages: 0, groups: 0, channels: 0 });
  const [copyStatus, setCopyStatus] = useState({ copied: false, message: '' });

  // Check if current user has been set, if not, refresh
  if(auth.getCurrentUser().username == undefined || auth.getCurrentUser().username == null){
    window.location.reload();
  }

  useEffect(() => {
    // Simulate loading user stats
    setTimeout(() => {
      setUserStats({
        messages: Math.floor(Math.random() * 100) + 10,
        groups: Math.floor(Math.random() * 15) + 3,
        channels: Math.floor(Math.random() * 5) + 1
      });
      
    }, 500);
  }, []);

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
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-amber-900/20 via-orange-900/20 to-amber-900/20"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500 rounded-full mix-blur-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blur-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-700 rounded-full mix-blur-multiply filter blur-xl opacity-5 animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <header className="py-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center justify-center mb-6">
                <div className="bg-linear-to-br from-amber-500 via-orange-500 to-amber-600 p-6 rounded-2xl shadow-2xl shadow-amber-500/20">
                  <AnonymousIcon className="w-20 h-20 text-white" />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="block">Talk Your Talk!</span>
                <span className="block text-2xl font-normal text-slate-300 mt-2">Secure Anonymous Communication Platform</span>
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
                <div className="p-3 bg-amber-500/20 rounded-lg mr-4">
                  <motion.div 
                    className="w-6 h-6 bg-linear-to-r from-amber-400 to-orange-400 rounded-full"
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut"
                    }}
                  ></motion.div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{userStats.messages}</p>
                  <p className="text-slate-200">Messages</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600"
            >
              <div className="flex items-center">
                <div className="p-3 bg-orange-500/20 rounded-lg mr-4">
                  <motion.div 
                    className="w-6 h-6 bg-linear-to-r from-orange-400 to-amber-400 rounded-full"
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                      delay: 0.3
                    }}
                  ></motion.div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{userStats.groups}</p>
                  <p className="text-slate-200">Groups</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600"
            >
              <div className="flex items-center">
                <div className="p-3 bg-slate-500/20 rounded-lg mr-4">
                  <motion.div 
                    className="w-6 h-6 bg-linear-to-r from-slate-400 to-slate-500 rounded-full"
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                      delay: 0.6
                    }}
                  ></motion.div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{userStats.channels}</p>
                  <p className="text-slate-200">Channels</p>
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
                      <div className="p-2 bg-linear-to-r from-amber-500/20 to-orange-500/20 rounded-lg mr-4 mt-1">
                        <motion.div 
                          className="w-2 h-2 bg-linear-to-r from-amber-400 to-orange-400 rounded-full"
                          animate={{ 
                            scale: [1, 1.3, 1],
                          }}
                          transition={{ 
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeInOut",
                            delay: index * 0.2
                          }}
                        ></motion.div>
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
            <h2 className="text-3xl font-bold text-white mb-4">Have Something to Share?</h2>
            <p className="text-slate-200 text-xl mb-6">
              Your thoughts, ideas, and messages are welcome here. Send an anonymous message to connect and communicate freely.
            </p>
            <p className="text-slate-300 mb-8">
              All messages are kept private and secure. Your identity remains protected while allowing for open communication.
            </p>
            <a
              href={`/messages/${auth.getCurrentUser()?.username}`}
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
              { title: "Complete Privacy", desc: "End-to-end encryption with no personal data collection" },
              { title: "Secure Identity", desc: "Your real identity remains completely protected" },
              { title: "Real-Time", desc: "Instant message delivery without refresh required" },
              { title: "Flexible Modes", desc: "Choose between anonymous and non-anonymous communication" },
              { title: "Community", desc: "Join topic-based groups with like-minded individuals" },
              { title: "Rich Media", desc: "Share images, videos, audio, and documents securely" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scaleX: 1.03 }}
                className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-600"
              >
                <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-black/40 z-10"></div>
                  {feature.title === "Complete Privacy" && (
                    <img 
                      src="https://images.unsplash.com/photo-1504728237481-88c99d0b3a6b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                      alt="Complete Privacy" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  {feature.title === "Secure Identity" && (
                    <img 
                      src="https://images.unsplash.com/photo-1563014959-7aaa83350933?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                      alt="Secure Identity" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  {feature.title === "Real-Time" && (
                    <img 
                      src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                      alt="Real-Time" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  {feature.title === "Flexible Modes" && (
                    <img 
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                      alt="Flexible Modes" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  {feature.title === "Community" && (
                    <img 
                      src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                      alt="Community" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  {feature.title === "Rich Media" && (
                    <img 
                      src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                      alt="Rich Media" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 relative z-20">{feature.title}</h3>
                <p className="text-slate-200 relative z-20">{feature.desc}</p>
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