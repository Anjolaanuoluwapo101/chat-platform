import React, { useState } from 'react';
import { AnonymousIcon } from '../../ui/NavBar';
import Layout from '../../layouts/Layout';
import CardStackContainer from './CardStackContainer';
import { DASHBOARD_CARDS } from './dashboardConstants';
import { GroupIcon, LayoutDashboardIcon, MessageCircleIcon, SettingsIcon } from 'lucide-react';
import ChannelsSection from './ChannelsSection';
// import PushNotificationService from '../../services/notifications';

interface NavItem {
  title: string;
  to: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { title: "Dashboard", to: "/dashboard", icon: <LayoutDashboardIcon /> },
  { title: "Messages", to: "/messages", icon: <MessageCircleIcon /> },
  { title: "Groups", to: "/groups", icon: <GroupIcon /> },
  { title: "Settings", to: "/settings", icon: <SettingsIcon /> }
];

/**
 * The main Dashboard component with card stack functionality.
 * Revamped styling to be consistent with the existing design patterns.
 */
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
      <div className="flex flex-col items-center justify-start min-h-screen py-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="w-full px-4 max-w-6xl">
          {/* Enhanced Header Section */}
          <div className="text-center mb-16 mt-6 relative">
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
              
              <div className="flex justify-center gap-4 mb-12">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 w-32">
                  <div className="text-2xl font-bold text-blue-600">10K+</div>
                  <div className="text-gray-600 text-sm">Messages Sent</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 w-32">
                  <div className="text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-gray-600 text-sm">Groups Created</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 w-32">
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <div className="text-gray-600 text-sm">Availability</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
              <p className="text-gray-600 max-w-2xl mx-auto mt-6 text-xl">
                Discover what makes our anonymous communication platform unique
              </p>
            </div>
            
            {/* Using the modularized CardStackContainer component */}
            <CardStackContainer
              cards={DASHBOARD_CARDS}
              onCardClick={handleCardClick}
              activeIndex={activeIndex}
            />
          </div>

          {/* Channels Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Communication Channels</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
              <p className="text-gray-600 max-w-2xl mx-auto mt-6 text-xl">
                Choose how you want to receive anonymous messages
              </p>
            </div>
            <ChannelsSection />
          </div>

          {/* Call to Action Section */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8 text-lg">
              Join thousands of users who have already discovered the power of anonymous communication
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/register" 
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Create Account
              </a>
              <a 
                href="/login" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-lg transition-all duration-300"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;