import React from 'react';
import { City } from '../lib/db';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import FeaturesBanner from './FeaturesBanner';

interface CityGridProps {
  cities: City[];
  onSelectCity: (cityId: string) => void;
}

export default function CityGrid({ cities, onSelectCity }: CityGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Premium Hero Title */}
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans"
        >
          Book Directly With Local Taxi Wala
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm sm:text-base text-slate-500 mt-2 font-medium font-sans"
        >
          Find Local Trusted Taxi Service For Your Next Trip
        </motion.p>
      </div>

      {/* Cities Grid with 2-columns on mobile, smooth edges on bottom two edges only */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {cities.map((city) => (
          <motion.div
            key={city.id}
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={() => onSelectCity(city.id)}
            // "add smooth edges for down two edges only" -> rounded-b-3xl rounded-t-none
            className="group bg-white rounded-b-[24px] rounded-t-none border-x border-b border-slate-100 shadow-sm hover:shadow-md hover:border-amber-500/30 overflow-hidden cursor-pointer flex flex-col transition-all h-full"
          >
            {/* Image Container with precise aspect ratios - no rounded corners on top */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
              <img
                src={city.image}
                alt={`${city.name} travel image`}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60 pointer-events-none" />
            </div>

            {/* Content Details */}
            <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between text-center sm:text-left">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors tracking-tight font-sans">
                  {city.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 font-medium font-sans">
                  {city.subtitle}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {cities.length === 0 && (
          <div className="col-span-full py-16 text-center bg-slate-50 rounded-b-2xl rounded-t-none border border-slate-100">
            <p className="text-slate-500 text-sm font-medium font-sans">No destinations available currently.</p>
          </div>
        )}
      </motion.div>

      {/* Feature Highlights Section */}
      <FeaturesBanner />
    </div>
  );
}
