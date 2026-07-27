import React from 'react';

export default function Header() {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white font-sans">
            Local Taxi Wala
          </h1>
          <p className="text-[10px] text-amber-400 font-bold tracking-wider uppercase mt-0.5">
            Top Verified Local Taxi Services Only
          </p>
        </div>
      </div>
    </header>
  );
}
