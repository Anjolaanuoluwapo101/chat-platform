import { motion } from 'framer-motion';
import Layout from '../../layouts/Layout';
import { Shield,Database, MessageCircle, Users, EyeOff } from 'lucide-react';

const navItems = [
  { title: "Dashboard", to: "/dashboard", icon: <Shield /> },
  { title: "Messages", to: "/messages", icon: <MessageCircle /> },
  { title: "Groups", to: "/groups", icon: <Users /> },
];

const Privacy = () => {
  return (
    <Layout navItems={navItems} title="Privacy - TYT!">
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-amber-900/20 via-orange-900/20 to-amber-900/20"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500 rounded-full mix-blur-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blur-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-700 rounded-full mix-blur-multiply filter blur-xl opacity-5 animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header Section */}
          <header className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="block">Privacy & Security</span>
                <span className="block text-2xl font-normal text-slate-300 mt-2">Your anonymity is our priority</span>
              </h1>
              
              <p className="text-xl text-slate-100 max-w-3xl mx-auto leading-relaxed">
                We take your privacy seriously. Learn how we protect your identity and secure your communications.
              </p>
            </motion.div>
          </header>

          {/* Privacy Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Privacy Features</h2>
              <p className="text-slate-300 max-w-2xl mx-auto">
                Advanced privacy and security measures to protect your identity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-600"
              >
                <div className="p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg w-12 h-12 mb-4 mx-auto">
                  <Shield className="w-6 h-6 text-amber-400 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Secure Authentication</h3>
                <p className="text-slate-200">User authentication tokens are securely managed via HTTP-only, SameSite=Lax cookies to prevent CSRF attacks.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-600"
              >
                <div className="p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg w-12 h-12 mb-4 mx-auto">
                  <EyeOff className="w-6 h-6 text-amber-400 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Personal Data</h3>
                <p className="text-slate-200">We collect only a username and hashed password. No personal information is stored or required.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-600"
              >
                <div className="p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg w-12 h-12 mb-4 mx-auto">
                  <Database className="w-6 h-6 text-amber-400 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Secure Storage</h3>
                <p className="text-slate-200">Dual storage system with Redis for real-time performance and MySQL for persistent data storage.</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Communication Modes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Communication Modes</h2>
              <p className="text-slate-300 max-w-2xl mx-auto">
                Multiple options to ensure your identity remains protected
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 border border-slate-600"
              >
                <h3 className="text-xl font-bold text-white mb-4">Single-Channel Anonymous</h3>
                <ul className="space-y-3 text-slate-200">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>One-way communication to any user</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Messages stored with recipient's username only</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Sender information never stored</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Recipients cannot identify sender</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 border border-slate-600"
              >
                <h3 className="text-xl font-bold text-white mb-4">Multi-Channel Anonymous</h3>
                <ul className="space-y-3 text-slate-200">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Anonymous group chats</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>All messages show as "Anonymous"</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Username replaced at database level</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Members cannot see identities</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 border border-slate-600"
              >
                <h3 className="text-xl font-bold text-white mb-4">Non-Anonymous Mode</h3>
                <ul className="space-y-3 text-slate-200">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Identified group chats</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Messages include username</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Set at group creation</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Cannot be changed later</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>

          {/* Data Handling & Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Data Handling & Security</h2>
              <p className="text-slate-300 max-w-2xl mx-auto">
                How we securely manage and protect your data
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-600"
            >
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Password Security</h3>
                  <p className="text-slate-200">
                    User passwords are securely hashed using PHP's password_hash() function with bcrypt algorithm, ensuring secure password storage.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Dual Storage System</h3>
                  <p className="text-slate-200">
                    Messages are stored in a durable SQL database (MySQL) for persistence and cached in Redis for real-time group chat performance.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Anonymous Message Handling</h3>
                  <p className="text-slate-200">
                    In single-channel mode, sender information is not stored. In anonymous groups, usernames are replaced with "Anonymous" before display.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Privacy Guarantees */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Privacy Guarantees</h2>
              <p className="text-slate-300 max-w-2xl mx-auto">
                Our commitment to protecting your privacy and identity
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">Minimal Data Collection</h3>
                <p className="text-slate-200">
                  We collect only username, password (hashed), and email for account creation and password recovery. No personal information beyond what's necessary for the service.
                </p>
              </div>

              <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">No Third-Party Analytics</h3>
                <p className="text-slate-200">
                  The platform does not use Google Analytics, Facebook Pixel, or any third-party tracking scripts. Your usage is not monitored by external parties.
                </p>
              </div>

              <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">Real-Time Messaging</h3>
                <p className="text-slate-200">
                  Uses Pusher WebSocket technology for instant message delivery. Messages appear in real-time without page refresh, ensuring seamless communication.
                </p>
              </div>

              <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">Secure Session Management</h3>
                <p className="text-slate-200">
                  All authenticated endpoints validate the user's session via PHP session mechanism before processing requests, ensuring server-side authentication checks are enforced.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;