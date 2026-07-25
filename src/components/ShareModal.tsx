import React, { useState } from 'react';
import { Driver } from '../lib/db';
import { Check, Copy, Share2, MessageCircle, Send, X } from 'lucide-react';
import { motion } from 'motion/react';

interface ShareModalProps {
  driver: Driver;
  cityName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ driver, cityName, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate a realistic link matching the /city-name standard
  const currentUrl = window.location.origin;
  const shareUrl = `${currentUrl}/${encodeURIComponent(cityName.toLowerCase())}?driver=${driver.id}`;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const shareText = `Check out this trusted local driver ${driver.name} who drives a ${driver.vehicleName} in ${cityName}! Direct booking, no commission.`;
  const encodedShareText = encodeURIComponent(shareText + " " + shareUrl);

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodedShareText}`, '_blank');
  };

  const handleTelegramShare = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const hasImages = driver.images && driver.images.length > 0;
  const imageToUse = hasImages ? driver.images[0] : "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        className="bg-white border border-slate-100 rounded-3xl p-6 max-w-md w-full text-slate-900 relative shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-sans">Share Driver Profile</h3>
            <p className="text-xs text-slate-500 font-sans">Recommend to friends & family</p>
          </div>
        </div>

        {/* Selected Driver Summary inside Modal */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-5 flex gap-3">
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
            <img
              src={imageToUse}
              alt={driver.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full font-sans uppercase">
              {cityName}
            </span>
            <h4 className="font-bold text-sm text-slate-900 mt-1 font-sans">{driver.name}</h4>
            <p className="text-xs text-slate-500 font-sans">{driver.vehicleName} · {driver.experience} Yrs Exp</p>
          </div>
        </div>

        {/* Share buttons options grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2 p-3 border border-emerald-100 rounded-2xl hover:bg-emerald-50 text-emerald-700 font-bold text-sm transition-all cursor-pointer font-sans"
          >
            <MessageCircle className="w-4.5 h-4.5 text-emerald-500 fill-current" />
            <span>WhatsApp</span>
          </button>
          
          <button
            onClick={handleTelegramShare}
            className="flex items-center justify-center gap-2 p-3 border border-sky-100 rounded-2xl hover:bg-sky-50 text-sky-700 font-bold text-sm transition-all cursor-pointer font-sans"
          >
            <Send className="w-4.5 h-4.5 text-sky-500 fill-current" />
            <span>Telegram</span>
          </button>
        </div>

        {/* Copy Link Input Bar */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 font-sans">Share Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-600 font-mono outline-none flex-1 truncate"
            />
            <button
              onClick={handleCopy}
              className={`px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer font-sans ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Premium visual QR Code placeholder */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3 justify-center">
          <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-[22px]">
            📱
          </div>
          <div className="text-left">
            <h5 className="text-xs font-bold text-slate-800 font-sans">Scan QR Code to Share</h5>
            <p className="text-[10px] text-slate-500 font-sans">Scan using your phone's camera to open on mobile.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
