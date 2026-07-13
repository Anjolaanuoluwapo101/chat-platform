import { useState } from 'react';
import { Copy, Check, Share2, Link as LinkIcon } from 'lucide-react';
import shareService from '../../services/shareService';

// Tells the user which URL to send to friends so they can receive anonymous
// messages - reuses shareService (Web Share API + clipboard fallback).
const ShareLinkCard = ({ username }: { username: string }) => {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/messages/${username}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    const shared = await shareService.shareMessageLink(
      'Send me an anonymous message!',
      link
    );
    if (!shared) {
      copyToClipboard();
    }
  };

  return (
    <div className="p-5 bg-lk-s1 dark:bg-dk-s1 rounded-[14px] border border-lk-border dark:border-dk-border shadow-[0_2px_12px_rgba(0,0,0,.06),0_1px_3px_rgba(0,0,0,.04)] mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-2xl bg-lk-accent-pale dark:bg-dk-accent-pale text-lk-accent2 dark:text-dk-accent">
          <LinkIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lk-t1 dark:text-dk-t1">Your link</h3>
          <p className="text-sm text-lk-t3 dark:text-dk-t3">Share this so friends can message you anonymously</p>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={link}
          readOnly
          className="grow min-w-0 px-4 py-2.5 text-sm bg-lk-s2 dark:bg-dk-s2 border border-lk-border2 dark:border-dk-border2 rounded-lg text-lk-t2 dark:text-dk-t2 focus:outline-none"
        />
        <button
          onClick={copyToClipboard}
          className="shrink-0 px-4 py-2.5 rounded-lg font-medium text-sm bg-lk-accent dark:bg-dk-accent text-white hover:bg-lk-accent2 dark:hover:bg-dk-accent2 transition-colors flex items-center gap-1.5"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        {shareService.isWebShareSupported() && (
          <button
            onClick={shareLink}
            className="shrink-0 px-4 py-2.5 rounded-lg font-medium text-sm border border-lk-border dark:border-dk-border text-lk-t1 dark:text-dk-t1 hover:border-lk-accent dark:hover:border-dk-accent transition-colors flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        )}
      </div>
    </div>
  );
};

export default ShareLinkCard;
