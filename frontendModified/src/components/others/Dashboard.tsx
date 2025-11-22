import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnonymousIcon } from '../../ui/NavBar';
import Layout from '../../layouts/Layout';
import CardStackContainer from './CardStackContainer';
import { DASHBOARD_CARDS } from './dashboardConstants';
import { Shield } from 'lucide-react';
import ChannelsSection from './ChannelsSection';
import { getCommonNavItems } from '../nav/sharedNavItems';
// import PushNotificationService from '../../services/notifications';

interface NavItem {
  title: string;
  to: string;
  icon: React.ReactNode;
}

const navItems : NavItem[] = getCommonNavItems();

function Dashboard() {
  // State to track the top-most card
  const [activeIndex, setActiveIndex] = useState(0);

  // Click handler to cycle through cards
  const handleCardClick = () => {
    // Increment the index with modulo to cycle through cards
    setActiveIndex((prevIndex) => (prevIndex + 1) % DASHBOARD_CARDS.length);
  };

  // PushNotificationService.initialize().then(() => {
  //   console.log("Push Notification Service initialized.");
  //   //add interest
  //   PushNotificationService.addInterest("general");
  // });

  return (
    <Layout navItems={navItems} title="TYT!">
      <div className="flex flex-col items-center justify-start min-h-screen py-8 bg-linear-to-br from-gray-50 to-blue-50">
        <div className="w-full px-4 max-w-6xl">
          {/* Enhanced Header Section */}
          <motion.div 
            className="text-center mb-16 mt-6 relative"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="bg-blue-100 p-4 rounded-full">
                  <AnonymousIcon className="w-16 h-16 text-blue-600" />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 relative">
                <span className="relative inline-block">
                  <span className="relative z-10">Talk</span>
                  <div className="absolute bottom-1 left-0 w-full h-3 bg-blue-200 opacity-70 rounded-full -z-10"></div>
                </span>{' '}
                <span className="text-gray-900">Your</span>{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">Talk</span>
                  <div className="absolute bottom-1 left-0 w-full h-3 bg-blue-200 opacity-70 rounded-full -z-10"></div>
                </span>
              </h1>
              
              <div className="max-w-2xl mx-auto mb-8">
                <div className="inline-block bg-white px-6 py-3 rounded-full shadow-sm border border-blue-100">
                  <p className="text-gray-700 text-lg">
                    An anonymous communication platform built by{' '}
                    <a 
                      href="https://github.com/anjolaanuoluwapo101" 
                      className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Anjola Akinsoyinu
                    </a>
                  </p>
                </div>
              </div>
              
              <motion.div 
                className="flex justify-center gap-4 mb-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.2
                    }
                  }
                }}
              >
                <motion.div 
                  className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 w-32"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <div className="text-2xl font-bold text-blue-600">1K+</div>
                  <div className="text-gray-600 text-sm">Messages Sent</div>
                </motion.div>
                <motion.div 
                  className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 w-32"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <div className="text-2xl font-bold text-blue-600">25+</div>
                  <div className="text-gray-600 text-sm">Groups Created</div>
                </motion.div>
                <motion.div 
                  className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 w-32"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <div className="text-lg font-bold text-blue-600">Real <br></br>Time</div>
                  <div className="text-gray-600 text-sm">Updates!</div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div 
            className="mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="text-center mb-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
              <p className="text-gray-600 max-w-2xl mx-auto mt-6 text-xl">
                Discover what makes our anonymous communication platform unique
              </p>
            </motion.div>
            
            {/* Using the modularized CardStackContainer component */}
            <CardStackContainer
              cards={DASHBOARD_CARDS}
              onCardClick={handleCardClick}
              activeIndex={activeIndex}
            />
          </motion.div>

          {/* Channels Section */}
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Communication Channels</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
              <p className="text-gray-600 max-w-2xl mx-auto mt-6 text-xl">
                Choose how you want to receive anonymous messages
              </p>
            </motion.div>
            <ChannelsSection />
          </motion.div>

          {/* Privacy Section */}
          <motion.div 
            className="bg-blue-600 rounded-2xl p-8 md:p-12 mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-700 p-4 rounded-full">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Your Privacy Matters</h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8 text-lg">
              Learn how we protect your identity with multiple anonymous communication modes and industry-leading security
            </p>
            <a 
              href="/privacy" 
              className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View Privacy Details
            </a>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;