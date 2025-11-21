import  { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../layouts/Layout';
import CardStackContainer from './CardStackContainer';
import { LayoutDashboardIcon, MessageCircleIcon, GroupIcon, SettingsIcon, Shield, Lock, Database, Eye, Server, FileText } from 'lucide-react';

// Privacy feature cards for the card stack
const PRIVACY_CARDS = [
  { 
    id: 1, 
    icon: Shield, 
    text: 'Single-channel anonymous messages with no sender information stored' 
  },
  { 
    id: 2, 
    icon: Lock, 
    text: 'Multi-channel anonymous groups where all members appear as "Anonymous"' 
  },
  { 
    id: 3, 
    icon: Database, 
    text: 'AES-128-CTR encryption for secure message storage' 
  },
  { 
    id: 4, 
    icon: Eye, 
    text: 'No third-party analytics or tracking scripts' 
  },
  { 
    id: 5, 
    icon: Server, 
    text: 'Dual storage system: SQL for persistence, Redis for real-time performance' 
  },
  { 
    id: 6, 
    icon: FileText, 
    text: 'Open source codebase - verify our privacy practices yourself' 
  },
];

const navItems = [
  { title: "Dashboard", to: "/dashboard", icon: <LayoutDashboardIcon /> },
  { title: "Messages", to: "/messages", icon: <MessageCircleIcon /> },
  { title: "Groups", to: "/groups", icon: <GroupIcon /> },
  { title: "Settings", to: "/settings", icon: <SettingsIcon /> }
];

const Privacy = () => {
  // State to track active card in stack
  const [activeIndex, setActiveIndex] = useState(0);

  // Click handler to cycle through privacy feature cards
  const handleCardClick = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % PRIVACY_CARDS.length);
  };

  return (
    <Layout navItems={navItems} title="Privacy - TYT!">
      <div className="flex flex-col items-center justify-start min-h-screen py-8 bg-linear-to-br from-gray-50 to-blue-50">
        <div className="w-full px-4 max-w-6xl">
          {/* Header with animations like Dashboard */}
          <motion.div 
            className="text-center mb-16 mt-6"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-xl">
              How we protect your identity and data
            </p>
          </motion.div>

          {/* Privacy Features Section with Card Stack */}
          <motion.div 
            className="mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Privacy Features</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
              <p className="text-gray-600 max-w-2xl mx-auto mt-6 text-xl">
                Discover how we keep your communications anonymous and secure
              </p>
            </motion.div>
            
            {/* Reusing CardStackContainer from Dashboard */}
            <CardStackContainer
              cards={PRIVACY_CARDS}
              onCardClick={handleCardClick}
              activeIndex={activeIndex}
            />
          </motion.div>

          {/* Communication Modes - Optimized spacing */}
          <motion.div 
            className="mb-20"
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Communication Modes</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Single-Channel Anonymous */}
              <motion.div 
                className="bg-white rounded-xl p-8 shadow-md border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Single-Channel Anonymous</h3>
                <ul className="space-y-3 text-gray-700">
                  <li>• One-way communication to any user</li>
                  <li>• Messages stored with recipient's username only</li>
                  <li>• Sender information not stored</li>
                  <li>• Recipients cannot identify sender</li>
                </ul>
              </motion.div>

              {/* Multi-Channel Anonymous */}
              <motion.div 
                className="bg-white rounded-xl p-8 shadow-md border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Multi-Channel Anonymous</h3>
                <ul className="space-y-3 text-gray-700">
                  <li>• Anonymous group chats</li>
                  <li>• All messages show "Anonymous"</li>
                  <li>• Username replaced at database level</li>
                  <li>• Members cannot see identities</li>
                </ul>
              </motion.div>

              {/* Non-Anonymous Mode */}
              <motion.div 
                className="bg-white rounded-xl p-8 shadow-md border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Non-Anonymous Mode</h3>
                <ul className="space-y-3 text-gray-700">
                  <li>• Identified group chats</li>
                  <li>• Messages include username</li>
                  <li>• Set at group creation</li>
                  <li>• Cannot be changed later</li>
                </ul>
              </motion.div>
            </div>
          </motion.div>

          {/* Data Handling & Security - Optimized spacing */}
          <motion.div 
            className="mb-20"
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Data Handling & Security</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-10 shadow-md border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Server-Side Encryption</h3>
                  <p className="text-gray-700">
                    Messages are encrypted on the server using AES-128-CTR encryption for storage and password reset tokens.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Dual Storage System</h3>
                  <p className="text-gray-700">
                    Messages are stored in a durable SQL database (MySQL/SQLite) for persistence and cached in Redis for real-time group chat performance.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Anonymous Message Handling</h3>
                  <p className="text-gray-700">
                    In single-channel mode, sender information is not stored. In anonymous groups, usernames are replaced with "Anonymous" before display.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Privacy Guarantees - Optimized spacing */}
          <motion.div 
            className="mb-20"
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Privacy Guarantees</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-10 shadow-md border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Minimal Data Collection</h3>
                  <p className="text-gray-700">
                    We collect only username, password (hashed), and email for account creation and password recovery.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">No Third-Party Analytics</h3>
                  <p className="text-gray-700">
                    The platform does not use Google Analytics, Facebook Pixel, or any third-party tracking scripts.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Open Source</h3>
                  <p className="text-gray-700">
                    The codebase is publicly available. You can audit the code to verify privacy and security practices.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Real-Time Messaging</h3>
                  <p className="text-gray-700">
                    Uses Pusher WebSocket technology for instant message delivery. Messages appear in real-time without page refresh, ensuring seamless communication.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Push Notifications</h3>
                  <p className="text-gray-700">
                    Receive instant notifications for new messages and group activities. Stay connected even when not actively browsing the platform.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
