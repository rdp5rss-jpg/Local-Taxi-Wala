import React, { useState } from 'react';
import { addInquiry } from '../lib/db';
import { motion } from 'motion/react';
import { Check, ShieldCheck, CheckCircle2, ChevronRight, MessageSquare, Send } from 'lucide-react';

export default function LandingPage() {
  const [driverName, setDriverName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [experience, setExperience] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName || !phone || !city || !experience || !vehicleDetails) return;
    
    setLoading(true);
    try {
      await addInquiry({
        driverName,
        phone,
        city,
        experience: Number(experience),
        vehicleDetails
      });
      setSuccess(true);
      // Reset form
      setDriverName('');
      setPhone('');
      setCity('');
      setExperience('');
      setVehicleDetails('');
    } catch (err) {
      console.error("Error submitting inquiry", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* Hero Section */}
      <div className="relative py-20 px-4 sm:px-6 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0,transparent_60%)] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold mb-6 font-sans"
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Driver Partner Registration 2026</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-6xl font-black tracking-tight font-sans leading-none"
        >
          Grow Your Business with <br />
          <span className="text-amber-400">Local Taxi Wala</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mt-4 font-sans font-medium"
        >
          List your taxi or travel agency directly. Connect with tourists from Kashmir, Goa, Rajasthan, and more with zero platform commissions.
        </motion.p>

        <div className="mt-8 flex justify-center">
          <a
            href="#inquiry-form"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-full shadow-lg text-sm sm:text-base transition-all active:scale-95 cursor-pointer flex items-center gap-1 font-sans"
          >
            <span>Submit Listing Inquiry</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Feature Blocks */}
      <div className="py-16 bg-slate-950/40 border-y border-slate-800/60 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-slate-900/60 border border-slate-800/60 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 text-lg">
              💰
            </div>
            <h3 className="text-lg font-bold font-sans text-white">0% Commissions</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
              Keep 100% of your earnings. Clients contact you directly on WhatsApp and pay you directly.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800/60 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 text-lg">
              🤝
            </div>
            <h3 className="text-lg font-bold font-sans text-white">Direct Client WhatsApp</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
              No complex booking interfaces or long payout waits. Chat, negotiate, and finalize on WhatsApp.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800/60 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 text-lg">
              ✨
            </div>
            <h3 className="text-lg font-bold font-sans text-white">Local Agency Presence</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
              Build your local brand with high-fidelity car pictures and customer trust under your name.
            </p>
          </div>
        </div>
      </div>

      {/* Box to send inquiry */}
      <div id="inquiry-form" className="py-20 px-4 sm:px-6 max-w-xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white font-sans">Send Listing Inquiry</h2>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Enter your details below and our team will get back to you shortly to verify your listing.
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center text-emerald-400 flex flex-col items-center gap-3 font-sans"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              <div>
                <h4 className="font-bold text-lg text-white">Inquiry Submitted!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Thank you for your interest! Our travel coordinator will verify your taxi details and call you back in 24 hours.
                </p>
              </div>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Submit another inquiry
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Agency / Driver Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Salim Tours Kashmir"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +919928237000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    placeholder="e.g. 8"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  City / Operating Region
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kashmir, Goa, Jaipur"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Vehicle Details
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Innova Crysta (SUV) / Dzire (Sedan)"
                  value={vehicleDetails}
                  onChange={(e) => setVehicleDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Submitting inquiry...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Listing Details</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
