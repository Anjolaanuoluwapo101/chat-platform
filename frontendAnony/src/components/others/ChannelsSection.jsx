import React, { useState } from 'react';
import auth from '../../services/auth';
import shareService from '../../services/shareService';

/**
 * ChannelsSection Component
 * Allows users to manage their communication channels for receiving anonymous messages
 */
const ChannelsSection = () => {
  const [expandedChannel, setExpandedChannel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [singleChannelLink, setSingleChannelLink] = useState(
    `${window.location.origin}/${auth.getCurrentUser()?.username}/messages`
  );

  const toggleChannel = (channelId) => {
    setExpandedChannel(expandedChannel === channelId ? null : channelId);
  };

  const handleGetLink = () => {
    setShowModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(singleChannelLink);
    // toast notification
    alert('Link copied to clipboard!');
  };

  const shareLink = async () => {
    const result = await shareService.shareMessageLink(
      "Receive anonymous messages from this link",
      singleChannelLink
    );
    
    if (!result) {
      // Fallback to copy if sharing is not supported or failed
      copyToClipboard();
    }
  };

  return (
    <div className="w-full mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Single Channel */}
        <div 
          className="bg-white rounded-2xl shadow-lg border border-blue-200 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:bg-blue-50"
          onClick={() => toggleChannel('single')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleChannel('single');
            }
          }}
        >
          <div className="p-8 cursor-pointer">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Single Channel</h3>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl text-blue-600 font-bold">
                  {expandedChannel === 'single' ? '−' : '+'}
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-6">Receive messages from anonymous users</p>
            <div className="flex items-center text-blue-600 font-medium">
              <span>Learn more</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {expandedChannel === 'single' && (
            <div className="px-8 pb-8 animate-fadeIn">
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGetLink();
                  }}
                  className="w-full mb-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Get Single Channel Link
                </button>
                {shareService.isWebShareSupported() && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      shareLink();
                    }}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Link
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Multiple Channel */}
        <div 
          className="bg-white rounded-2xl shadow-lg border border-blue-200 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:bg-blue-50"
          onClick={() => toggleChannel('multiple')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleChannel('multiple');
            }
          }}
        >
          <div className="p-8 cursor-pointer">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Multiple Channel</h3>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl text-blue-600 font-bold">
                  {expandedChannel === 'multiple' ? '−' : '+'}
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-6">Create, View and Manage Anonymous Groups</p>
            <div className="flex items-center text-blue-600 font-medium">
              <span>Learn more</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {expandedChannel === 'multiple' && (
            <div className="px-8 pb-8 animate-fadeIn">
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600 mb-6">Manage your anonymous group conversations in one place.</p>
                <a
                  href="/groups"
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Go to Groups
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Single Channel Link */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Your Single Channel Link</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">Share this link to receive anonymous messages:</p>
              <div className="flex">
                <input
                  type="text"
                  value={singleChannelLink}
                  readOnly
                  className="grow px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Copy
                </button>
              </div>
              {shareService.isWebShareSupported() && (
                <div className="mt-4">
                  <button
                    onClick={shareLink}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share via Social Media
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelsSection;