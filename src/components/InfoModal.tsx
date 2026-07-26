import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Info, AlertTriangle } from 'lucide-react';

export type InfoModalType = 'about' | 'privacy' | 'disclaimer' | null;

interface InfoModalProps {
  type: InfoModalType;
  onClose: () => void;
}

export default function InfoModal({ type, onClose }: InfoModalProps) {
  if (!type) return null;

  const contentMap = {
    about: {
      title: 'About Us',
      icon: <Info className="w-6 h-6 text-amber-500" />,
      subtitle: 'Connecting travelers directly with trusted local drivers',
      body: (
        <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            <strong className="text-white">Local Taxi Wala</strong> is India's direct local driver network connecting travelers with verified cab operators across top travel destinations like Kashmir, Kargil, Ladakh, Udaipur, Kerala, Manali, Shillong, and beyond.
          </p>
          <p>
            Unlike traditional aggregators, <strong className="text-amber-400">we charge zero middleman commissions</strong>. You speak, negotiate, and book directly with local drivers via WhatsApp. This ensures fair pricing for travelers and maximum earnings for local drivers.
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 mt-4">
            <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-1">Our Core Promises</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
              <li>100% Direct Driver Communication</li>
              <li>Zero Booking Fees & No Hidden Markups</li>
              <li>Verified Local Drivers with Local Route Expertise</li>
            </ul>
          </div>
        </div>
      )
    },
    privacy: {
      title: 'Privacy Policy',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      subtitle: 'How we protect your data and privacy',
      body: (
        <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            Your privacy is important to us. At <strong className="text-white">Local Taxi Wala</strong>, we adhere to strict data protection standards:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 text-xs">
            <li>
              <strong className="text-white">No Traveler Registration Required:</strong> You don't need to create an account, log in, or submit personal passwords to browse and contact drivers.
            </li>
            <li>
              <strong className="text-white">WhatsApp Redirect:</strong> When you click "Book with Local Taxi Wala", you are transferred directly to WhatsApp to chat with the driver. We do not store your private WhatsApp messages.
            </li>
            <li>
              <strong className="text-white">Anonymous Analytics:</strong> We only track aggregated click counts to help drivers know how many inquiries they receive.
            </li>
            <li>
              <strong className="text-white">Driver Partner Data:</strong> Partner details provided during registration are used solely to display verified listings on our directory.
            </li>
          </ul>
        </div>
      )
    },
    disclaimer: {
      title: 'Disclaimer & Terms',
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      subtitle: 'Important information regarding platform usage',
      body: (
        <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            <strong className="text-white">Local Taxi Wala</strong> functions exclusively as an online contact directory connecting independent travelers directly with local vehicle owners and drivers.
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
            <p>
              • <strong className="text-amber-400">Independent Drivers:</strong> Drivers listed on this website are independent operators and not direct employees of Local Taxi Wala.
            </p>
            <p>
              • <strong className="text-amber-400">Direct Agreement:</strong> Trip agreements, fares, payments, route changes, vehicle hygiene, and safety rules are settled directly between you and the driver.
            </p>
            <p>
              • <strong className="text-amber-400">Traveler Responsibility:</strong> Travelers are encouraged to verify vehicle papers, permit details, and driver credentials before starting any journey.
            </p>
          </div>
        </div>
      )
    }
  };

  const activeContent = contentMap[type];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl shrink-0">
              {activeContent.icon}
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{activeContent.title}</h3>
              <p className="text-xs text-slate-400">{activeContent.subtitle}</p>
            </div>
          </div>

          {/* Body */}
          <div className="my-5 max-h-[60vh] overflow-y-auto pr-1">
            {activeContent.body}
          </div>

          {/* Footer Action */}
          <div className="mt-6 pt-4 border-t border-slate-900 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer"
            >
              Got it, Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
