import React from 'react';
import { Users, Car, MessageCircle } from 'lucide-react';

export default function FeaturesBanner() {
  return (
    <div className="mt-12 mb-6 pt-10 border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto text-center px-4">
        {/* Main Title */}
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
          Plan Your Next Trip With Local Taxi Services
        </h3>
        
        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl mx-auto font-medium font-sans leading-relaxed">
          Private Taxi services and curated Experiences with experience local taxi services.
        </p>

        {/* 3 Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {/* Item 1 */}
          <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-center group hover:border-amber-400 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-2.5 text-amber-600 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-base font-extrabold text-slate-900 font-sans">5000+ Happy Customers</span>
          </div>

          {/* Item 2 */}
          <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-center group hover:border-amber-400 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-2.5 text-amber-600 group-hover:scale-110 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-base font-extrabold text-slate-900 font-sans">Local taxi Services</span>
          </div>

          {/* Item 3 */}
          <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-center group hover:border-amber-400 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-2.5 text-emerald-600 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-base font-extrabold text-slate-900 font-sans">24/7 Whatsapp Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
