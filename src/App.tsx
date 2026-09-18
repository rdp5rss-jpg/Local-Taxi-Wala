import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CityGrid from './components/CityGrid';
import DriverCard from './components/DriverCard';
import ShareModal from './components/ShareModal';
import LandingPage from './components/LandingPage';
import AdminPanel from './components/AdminPanel';
import InfoModal, { InfoModalType } from './components/InfoModal';
import FeaturesBanner from './components/FeaturesBanner';
import { 
  City, 
  Driver, 
  getCities, 
  getDrivers, 
  getInstagramLink, 
  seedInitialDataIfEmpty,
  getVehicleCategories,
  VehicleCategory
} from './lib/db';
import { ArrowLeft, Car, HelpCircle, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VehicleCategoryOption {
  key: string;
  label: string;
  mobileLabel: string;
}

const VEHICLE_CATEGORIES: VehicleCategoryOption[] = [
  { key: 'Sedan', label: 'Sedan', mobileLabel: 'Sedan' },
  { key: 'SUV', label: 'SUV', mobileLabel: 'SUV' },
  { key: 'Tempo', label: 'Tempo Traveller', mobileLabel: 'Tempo' },
];

function matchesCategory(driver: Driver, categoryKey: string): boolean {
  const type = (driver.vehicleType || '').trim().toLowerCase();
  const name = (driver.vehicleName || '').trim().toLowerCase();
  const key = categoryKey.trim().toLowerCase();

  if (key === 'sedan') {
    return type === 'sedan' || type.includes('sedan') || name.includes('sedan') || name.includes('dzire') || name.includes('etios');
  }
  if (key === 'suv') {
    return type === 'suv' || type.includes('suv') || name.includes('suv') || name.includes('innova') || name.includes('scorpio') || name.includes('ertiga') || name.includes('crysta');
  }
  if (key === 'tempo' || key === 'tempo traveller') {
    return type.includes('tempo') || type.includes('traveller') || name.includes('tempo') || name.includes('traveller');
  }
  return type === key || type.includes(key) || name.includes(key);
}

export default function App() {
  // Navigation / Custom SPA routing state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
   // Data states
  const [cities, setCities] = useState<City[]>([]);
  const [activeDrivers, setActiveDrivers] = useState<Driver[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [instagramLink, setInstagramLink] = useState('https://instagram.com/localtaxiwala');
  const [loading, setLoading] = useState(true);
  const [driversLoading, setDriversLoading] = useState(false);

  // Filter and selection states: only Sedan, SUV, and Tempo
  const [vehicleFilter, setVehicleFilter] = useState<string>('Sedan');
  const [shareDriver, setShareDriver] = useState<Driver | null>(null);
  const [cityNameForShare, setCityNameForShare] = useState('');
  const [activeInfoModal, setActiveInfoModal] = useState<InfoModalType>(null);

  // 1. Setup SPA Router events
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Load Firestore Data
  useEffect(() => {
    const initDatabaseAndLoad = async () => {
      setLoading(true);
      try {
        // Trigger seeding if database is completely empty
        await seedInitialDataIfEmpty();
        
        // Load operational hubs (cities)
        const fetchedCities = await getCities();
        setCities(fetchedCities);

        // Load vehicle categories
        const fetchedCats = await getVehicleCategories();
        setCategories(fetchedCats);

        // Load global settings (Instagram Link)
        const ig = await getInstagramLink();
        setInstagramLink(ig);
      } catch (err) {
        console.error("Failed to fetch initial Firestore data", err);
      } finally {
        setLoading(false);
      }
    };
    initDatabaseAndLoad();
  }, []);

  // Parse path to check if we are viewing a specific city
  // E.g., /goa -> Goa drivers
  const cleanedPath = currentPath.slice(1).toLowerCase().trim();
  const activeCity = cities.find((c) => (c.id || '').trim().toLowerCase() === cleanedPath) || null;

  // Load drivers of the active city whenever path changes
  useEffect(() => {
    if (activeCity) {
      let isSubscribed = true;
      const loadCityDrivers = async () => {
        setDriversLoading(true);
        try {
          const fetchedDrivers = await getDrivers(activeCity.id);
          if (isSubscribed) {
            setActiveDrivers(fetchedDrivers);
          }
        } catch (err) {
          console.error("Failed to load drivers", err);
        } finally {
          if (isSubscribed) {
            setDriversLoading(false);
          }
        }
      };
      loadCityDrivers();
      return () => {
        isSubscribed = false;
      };
    } else {
      setActiveDrivers([]);
      setDriversLoading(false);
    }
  }, [activeCity?.id]);

  // Handle share parameters from URL search query (e.g. ?driver=xyz)
  useEffect(() => {
    if (activeCity && activeDrivers.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const driverParam = params.get('driver');
      if (driverParam) {
        const matchedDriver = activeDrivers.find((d) => d.id === driverParam);
        if (matchedDriver) {
          setShareDriver(matchedDriver);
          setCityNameForShare(activeCity.name);
        }
      }
    }
  }, [activeCity, activeDrivers]);

  // Ensure the selected vehicle category has drivers for this city, or auto-switch
  useEffect(() => {
    if (activeDrivers.length > 0) {
      const hasCurrent = activeDrivers.some((d) => matchesCategory(d, vehicleFilter));
      if (!hasCurrent) {
        const availableCategory = VEHICLE_CATEGORIES.find((cat) =>
          activeDrivers.some((d) => matchesCategory(d, cat.key))
        );
        if (availableCategory) {
          setVehicleFilter(availableCategory.key);
        }
      }
    }
  }, [activeDrivers]);

  const handleSelectCity = (cityId: string) => {
    setVehicleFilter('Sedan'); // Default to Sedan
    navigate(`/${cityId.toLowerCase().trim()}`);
  };

  const handleBackToCities = () => {
    navigate('/');
  };

  const handleShareClick = async (driver: Driver) => {
    if (activeCity) {
      const currentUrl = window.location.origin;
      const shareUrl = `${currentUrl}/${encodeURIComponent(activeCity.id)}?driver=${driver.id}`;
      const shareText = `Check out this trusted local driver ${driver.name} who drives a ${driver.vehicleName} in ${activeCity.name}! Direct booking, no commission.`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: `Local Taxi Wala - ${driver.name}`,
            text: shareText,
            url: shareUrl
          });
          return;
        } catch (err) {
          console.log("Native sharing was cancelled or failed. Displaying fallback modal.", err);
        }
      }

      setShareDriver(driver);
      setCityNameForShare(activeCity.name);
    }
  };

  // Filter operational drivers for selected category (Sedan, SUV, or Tempo)
  const filteredDrivers = activeDrivers.filter((driver) => {
    return matchesCategory(driver, vehicleFilter);
  });

  // Check if we are on secondary administration or partner registration page
  const isAdminView = currentPath === '/admin' || currentPath === '/admin882' || currentPath.startsWith('/admin');
  const isLandingView = currentPath === '/landing-page';

  // Render Admin Console Panel
  if (isAdminView) {
    return <AdminPanel />;
  }

  // Render Partner Registration Landing Page
  if (isLandingView) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
        <Header />
        <main className="flex-grow">
          <LandingPage />
        </main>
        <footer className="bg-slate-950 text-slate-400 py-6 px-4 text-center border-t border-slate-900 font-sans text-xs flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-4 text-xs font-semibold flex-wrap text-slate-400">
            <button
              onClick={() => setActiveInfoModal('about')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              About Us
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setActiveInfoModal('privacy')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setActiveInfoModal('disclaimer')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Disclaimer
            </button>
          </div>
          <p className="text-slate-500 text-[11px]">© 2026 Local Taxi Wala — Your trusted travel partner</p>
        </footer>
        <InfoModal
          type={activeInfoModal}
          onClose={() => setActiveInfoModal(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-500/20 selection:text-slate-900">
      
      {/* 1. Header (Dynamic logo/call actions removed per spec) */}
      <Header />

      {/* 2. Core Operational Views */}
      <main className="flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-slate-500 font-sans">
            <div className="relative flex items-center justify-center mb-4">
              <span className="text-4xl animate-bounce">🚕</span>
              <span className="absolute -bottom-1 w-8 h-1.5 bg-slate-300 rounded-full animate-ping opacity-40"></span>
            </div>
            <p className="text-sm font-extrabold text-slate-800">Connecting to Local Taxi Wala Network...</p>
            <p className="text-xs text-slate-400 mt-1">Loading destinations & direct cab listings...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!activeCity ? (
              /* --- HOME VIEW: Destination Cities Grid --- */
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                {/* Cities Grid with dynamic data and smooth bottom edges only */}
                <CityGrid cities={cities} onSelectCity={handleSelectCity} />
              </motion.div>
            ) : (
              /* --- DRIVERS LIST VIEW --- */
              <motion.div
                key="drivers-list"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="py-8 px-4 sm:px-6 max-w-5xl mx-auto"
              >
                {/* Back Button inside the page */}
                <button
                  onClick={handleBackToCities}
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm bg-white hover:bg-slate-100 border border-slate-200/60 rounded-xl px-4 py-2.5 transition-all shadow-sm select-none cursor-pointer mb-6"
                >
                  <ArrowLeft className="w-4 h-4 text-amber-500" />
                  <span>Back to Cities</span>
                </button>

                {/* Title Section */}
                <div className="mb-6 text-center">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {activeCity.name}
                  </h2>
                  <p className="text-sm sm:text-base font-bold text-amber-600 mt-1">
                    Top Verified Local Taxi Services
                  </p>
                </div>

                {/* 3 Categories Only: Sedan, SUV, and Tempo - 100% visible on mobile with ZERO horizontal scrolling */}
                <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3 max-w-lg mx-auto">
                  {VEHICLE_CATEGORIES.map((cat) => {
                    const isActive = vehicleFilter.trim().toLowerCase() === cat.key.trim().toLowerCase();
                    const categoryCount = activeDrivers.filter((d) => matchesCategory(d, cat.key)).length;

                    return (
                      <button
                        key={cat.key}
                        id={`filter-${cat.key.toLowerCase()}`}
                        onClick={() => setVehicleFilter(cat.key)}
                        className={`px-2 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all select-none cursor-pointer border ${
                          isActive
                            ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md font-black'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                        }`}
                      >
                        <Car className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          <span className="sm:hidden">{cat.mobileLabel}</span>
                          <span className="hidden sm:inline">{cat.label}</span>
                          {!driversLoading && categoryCount > 0 ? ` (${categoryCount})` : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Drivers Cards Grid or Loading Skeleton */}
                {driversLoading ? (
                  <div className="py-16 text-center max-w-md mx-auto">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h4 className="font-bold text-slate-800 text-base">Finding verified drivers in {activeCity.name}...</h4>
                    <p className="text-xs text-slate-400 mt-1">Connecting directly to local taxi owners</p>
                  </div>
                ) : filteredDrivers.length > 0 ? (
                  <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredDrivers.map((driver) => (
                        <DriverCard
                          key={driver.id}
                          driver={driver}
                          cityName={activeCity.name}
                          onShare={handleShareClick}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className="py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto">
                    <HelpCircle className="w-11 h-11 text-slate-300 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-800 text-sm">No {vehicleFilter} cabs currently in {activeCity.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Check other available vehicle options in {activeCity.name}:
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                      {VEHICLE_CATEGORIES.filter((c) => c.key.toLowerCase() !== vehicleFilter.toLowerCase()).map((otherCat) => (
                        <button
                          key={otherCat.key}
                          onClick={() => setVehicleFilter(otherCat.key)}
                          className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          View {otherCat.mobileLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feature Highlights Section under driver listings */}
                <FeaturesBanner />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* 3. Share Modal Overlay */}
      {shareDriver && (
        <ShareModal
          driver={shareDriver}
          cityName={cityNameForShare}
          isOpen={shareDriver !== null}
          onClose={() => setShareDriver(null)}
        />
      )}

      {/* 4. Instagram Floating Bar on bottom right with 'Follow us' label above it */}
      {instagramLink && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-1.5 pointer-events-none">
          <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/90 text-[10px] font-black px-2.5 py-1 rounded-full shadow-xl flex items-center gap-1 animate-bounce pointer-events-auto">
            <span className="tracking-wide">Follow us</span>
            <span className="text-amber-400 text-xs">👇</span>
          </div>
          <a
            href={instagramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 hover:scale-110 active:scale-95 text-white rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer group pointer-events-auto"
            title="Follow us on Instagram"
          >
            <Instagram className="w-6 h-6 stroke-[2]" />
          </a>
        </div>
      )}

      {/* 5. Clean, Minimal Footer */}
      <footer className="bg-slate-950 text-slate-400 py-6 px-4 text-center border-t border-slate-900 font-sans text-xs flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-4 text-xs font-semibold flex-wrap text-slate-400">
          <button
            onClick={() => setActiveInfoModal('about')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            About Us
          </button>
          <span className="text-slate-700">•</span>
          <button
            onClick={() => setActiveInfoModal('privacy')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <span className="text-slate-700">•</span>
          <button
            onClick={() => setActiveInfoModal('disclaimer')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Disclaimer
          </button>
        </div>
        <p className="text-slate-500 text-[11px]">© 2026 Local Taxi Wala — Your trusted travel partner</p>
      </footer>

      {/* 6. Legal / Info Modal Overlay */}
      <InfoModal
        type={activeInfoModal}
        onClose={() => setActiveInfoModal(null)}
      />
    </div>
  );
}
