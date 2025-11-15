/**
 * Share Service
 * Utility functions for sharing content using the Web Share API
 */

interface ShareData {
  title: string;
  text: string;
  url?: string;
}

/**
 * Check if the Web Share API is supported by the browser
 * @returns {boolean} True if supported, false otherwise
 */
export const isWebShareSupported = (): boolean => {
  return navigator.share !== undefined;
};

/**
 * Share text content using the Web Share API
 * @param {Object} shareData - The data to share
 * @param {string} shareData.title - Title of the content
 * @param {string} shareData.text - Text to share
 * @param {string} shareData.url - URL to share (optional)
 * @returns {Promise<boolean>} Promise that resolves to true if sharing was successful, false otherwise
 */
export const shareContent = async ({ title, text, url }: ShareData): Promise<boolean> => {
  // Check if Web Share API is supported
  if (!isWebShareSupported()) {
    console.warn('Web Share API is not supported in this browser');
    return false;
  }

  try {
    // Prepare share data
    const shareData: ShareData = {
      title,
      text
    };

    // Add URL only if provided
    if (url) {
      shareData.url = url;
    }

    // Trigger the share dialog
    await navigator.share(shareData);
    return true;
  } catch (error) {
    // Sharing was cancelled or failed
    console.warn('Sharing failed or was cancelled:', error);
    return false;
  }
};

/**
 * Share a message link using the Web Share API
 * @param {string} message - The message to share
 * @param {string} link - The link to share
 * @returns {Promise<boolean>} Promise that resolves to true if sharing was successful
 */
export const shareMessageLink = async (message: string, link: string): Promise<boolean> => {
  return await shareContent({
    title: 'Anonymous Message',
    text: message,
    url: link
  });
};

/**
 * Share the current page using the Web Share API
 * @param {string} title - Title for the shared content
 * @returns {Promise<boolean>} Promise that resolves to true if sharing was successful
 */
export const shareCurrentPage = async (title: string = document.title): Promise<boolean> => {
  return await shareContent({
    title,
    text: document.title,
    url: window.location.href
  });
};

export default {
  isWebShareSupported,
  shareContent,
  shareMessageLink,
  shareCurrentPage
};