import React, { useState } from 'react';
import { Driver, recordWhatsAppClick } from '../lib/db';
import { Share2, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DriverCardProps {
  key?: React.Key;
  driver: Driver;
  cityName: string;
  onShare: (driver: Driver) => void;
}

export default function DriverCard({ driver, cityName, onShare }: DriverCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [localClicks, setLocalClicks] = useState(driver.clicks || 0);

  // Formulate prefilled WhatsApp link
  // Message format: "Book with Local Taxi Wala! Hi {Driver Name}, I want to book your {Car Model} in {City}. I found you on Local Taxi Wala. Website: localtaxiwala.com"
  const rawMessage = `Book with Local Taxi Wala! Hi ${driver.name}, I want to book your ${driver.vehicleName} in ${cityName}. I found you on Local Taxi Wala. Website: localtaxiwala.com`;
  const encodedMessage = encodeURIComponent(rawMessage);
  const cleanPhone = driver.phone.replace('+', '').trim(); // strip the +
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  const handleBookingClick = async (e: React.MouseEvent) => {
    setLocalClicks(prev => prev + 1);
    // Record analytics in background
    try {
      await recordWhatsAppClick(driver.id);
    } catch (err) {
      console.error("Failed to track analytics click", err);
    }
  };

  const nextImage = () => {
    if (!driver.images || driver.images.length === 0) return;
    setActiveImageIndex((prev) => (prev + 1) % driver.images.length);
  };

  const prevImage = () => {
    if (!driver.images || driver.images.length === 0) return;
    setActiveImageIndex((prev) => (prev - 1 + driver.images.length) % driver.images.length);
  };

  const hasImages = driver.images && driver.images.length > 0;
  const currentImageUrl = hasImages ? driver.images[activeImageIndex] : "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', duration: 0.4 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md overflow-hidden flex flex-col h-full"
    >
      {/* 1. Image Container with Carousel Controls */}
      <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden group">
        
        {/* Carousel Image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImageIndex}
            src={currentImageUrl}
            alt={`${driver.name}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover select-none"
          />
        </AnimatePresence>

        {/* Gradient Overlay for labels readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/20 pointer-events-none" />

        {/* Blue Circle Share Button on Top Right */}
        <button
          onClick={() => onShare(driver)}
          className="absolute top-3 right-3 w-9 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all z-10 cursor-pointer"
          title="Share this Cab Profile"
        >
          <Share2 className="w-4 h-4 fill-current text-white" />
        </button>

        {/* Left/Right Click zones or Hover arrows */}
        {driver.images && driver.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-slate-950/40 hover:bg-slate-950/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 text-xs font-bold"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-slate-950/40 hover:bg-slate-950/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 text-xs font-bold"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}

        {/* Yellow License Plate Badge on Bottom Right */}
        {driver.plateNumber && (
          <div className="absolute bottom-3 right-3 bg-amber-400 border border-amber-500 rounded px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-slate-950 font-mono tracking-wider shadow-md select-none">
            {driver.plateNumber}
          </div>
        )}

        {/* Interactive Dot indicators for Carousel */}
        {driver.images && driver.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
            {driver.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  activeImageIndex === idx ? 'bg-amber-400 w-3' : 'bg-white/50 hover:bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Driver Details */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug font-sans">
              {driver.name}
            </h3>
            {/* Golden Experience badge placed inline next to driver name */}
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full text-[10px] sm:text-[11px] font-semibold font-sans shrink-0">
              <Award className="w-3 h-3 text-amber-600 shrink-0" />
              <span>{driver.experience} Yrs Experience</span>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5 font-sans">
            {driver.vehicleName} {driver.vehicleType && driver.vehicleType.toLowerCase() !== driver.vehicleName.toLowerCase() ? `(${driver.vehicleType})` : ''}
          </p>
        </div>

        {/* 3. Booking Green WhatsApp Button */}
        <div className="mt-3">
          <a
            href={whatsappUrl}
            onClick={handleBookingClick}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#22c35e] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_3px_10px_rgba(37,211,102,0.2)] hover:shadow-[0_4px_14px_rgba(37,211,102,0.35)] active:scale-95 transition-all select-none cursor-pointer text-center font-sans"
          >
            {/* Custom WhatsApp SVG Icon */}
            <svg
              className="w-4 h-4 fill-current shrink-0 text-white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.863-9.73.001-2.595-1.006-5.035-2.836-6.867C16.671 2.185 14.238 1.18 11.8 1.182c-5.434 0-9.858 4.37-9.861 9.732-.001 1.764.485 3.49 1.408 5.013l-.925 3.376 3.475-.915zM17.16 14.6c-.29-.145-1.72-.85-1.99-.95-.27-.1-.46-.15-.66.15-.2.3-.77.95-.94 1.15-.17.2-.34.22-.63.08-1.11-.55-2.12-1.12-2.92-1.81-.62-.53-1.03-1.18-1.15-1.38-.12-.2-.01-.31.13-.45.13-.13.29-.34.44-.5.15-.17.2-.29.3-.49.1-.2.05-.38-.02-.53-.07-.15-.66-1.59-.9-2.17-.24-.58-.48-.5-.66-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.03 1-1.03 2.44 0 1.44 1.05 2.84 1.2 3.03.15.19 2.07 3.17 5.02 4.45.7.3 1.25.48 1.68.62.7.22 1.34.19 1.84.12.56-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.08-.13-.29-.2-.58-.35z" />
            </svg>
            <span>Book Directly</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
